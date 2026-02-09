import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method } = req;
    const { resourceName } = req.query;

    if (!resourceName) {
      return res.status(400).json({ message: "Resource name required" });
    }

    // Get module config
    const module = await prisma.cmsModule.findUnique({
      where: { resourceName: resourceName as string, published: true },
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
        },
        relationships: {
          include: {
            targetModule: true,
          },
        },
      },
    });

    if (!module) {
      return res
        .status(404)
        .json({ message: "Module not found or not published" });
    }

    // Parse the database URL to get connection details
    const dbUrl = process.env.DATABASE_URL || "";

    // Dynamic query based on the module's tableName
    const query = `SELECT * FROM ${module.tableName}`;

    switch (method) {
      case "GET":
        // For security, we'll use Prisma's raw query
        const data = await prisma.$queryRawUnsafe(query);
        return res.status(200).json({
          data,
          module: {
            name: module.name,
            title: module.title,
            fields: module.fields,
          },
        });

      case "POST":
        // Insert new record
        let insertData = { ...req.body };

        // Generate auto-code fields
        for (const field of module.fields) {
          if (field.autoCode && field.autoCode.trim() !== "") {
            const pattern =
              typeof field.autoCode === "string"
                ? field.autoCode
                : String(field.autoCode);

            // Get current date parts
            const today = new Date();
            const year = String(today.getFullYear());
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");

            // Find sequence pattern {0001} or {00000001}
            const seqMatch = pattern.match(/\{(0+1?)\}/);
            let generatedCode = pattern;

            if (seqMatch) {
              const seqPattern = seqMatch[0]; // e.g., "{0001}"
              const seqLength = seqPattern.length - 2; // minus { and }

              // Get last record to determine next sequence
              const lastRecordQuery = `SELECT ${field.name} FROM ${module.tableName} ORDER BY id DESC LIMIT 1`;
              const lastRecords: any[] =
                await prisma.$queryRawUnsafe(lastRecordQuery);

              let nextSeq = 1;
              if (lastRecords.length > 0 && lastRecords[0][field.name]) {
                const lastCode = String(lastRecords[0][field.name]);
                // Extract sequence number from last code
                const lastSeqMatch = lastCode.match(/(\d+)$/);
                if (lastSeqMatch) {
                  nextSeq = parseInt(lastSeqMatch[1]) + 1;
                }
              }

              const seqNumber = String(nextSeq).padStart(seqLength, "0");
              generatedCode = generatedCode.replace(seqPattern, seqNumber);
            }

            // Replace date placeholders
            generatedCode = generatedCode
              .replace("{YYYY}", year)
              .replace("{YY}", year.slice(-2))
              .replace("{MM}", month)
              .replace("{DD}", day)
              .replace("{YYYYMMDD}", `${year}${month}${day}`)
              .replace("{YYMMDD}", `${year.slice(-2)}${month}${day}`);

            insertData[field.name] = generatedCode;
          }
        }

        // Filter out auto-generated fields and empty values
        const excludeFields = [
          "id",
          "createdAt",
          "updatedAt",
          "created_at",
          "updated_at",
        ];
        const fields = Object.keys(insertData)
          .filter((k) => !excludeFields.includes(k))
          .filter(
            (k) =>
              insertData[k] !== undefined &&
              insertData[k] !== null &&
              insertData[k] !== "",
          );

        const values = fields.map((f) => insertData[f]);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
        const insertQuery = `INSERT INTO ${module.tableName} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`;

        const insertedRecord = await prisma.$queryRawUnsafe(
          insertQuery,
          ...values,
        );
        return res.status(201).json({
          success: true,
          data: Array.isArray(insertedRecord)
            ? insertedRecord[0]
            : insertedRecord,
        });

      case "PUT":
        // Update existing record
        const updateData = req.body;
        const {
          id,
          createdAt,
          updatedAt,
          created_at,
          updated_at,
          ...updateFields
        } = updateData;

        if (!id) {
          return res.status(400).json({ message: "ID required for update" });
        }

        // Filter out empty values
        const filteredFields = Object.keys(updateFields).filter(
          (k) =>
            updateFields[k] !== undefined &&
            updateFields[k] !== null &&
            updateFields[k] !== "",
        );

        if (filteredFields.length === 0) {
          return res.status(400).json({ message: "No fields to update" });
        }

        const updateKeys = filteredFields;
        const updateValues = updateKeys.map((k) => updateFields[k]);
        const setClause = updateKeys
          .map((k, i) => `${k} = $${i + 1}`)
          .join(", ");
        const updateQuery = `UPDATE ${module.tableName} SET ${setClause} WHERE id = $${updateKeys.length + 1} RETURNING *`;

        const updatedRecord = await prisma.$queryRawUnsafe(
          updateQuery,
          ...updateValues,
          id,
        );
        return res.status(200).json({
          success: true,
          data: Array.isArray(updatedRecord) ? updatedRecord[0] : updatedRecord,
        });

      case "DELETE":
        // Delete record
        const deleteId = req.body.id || req.query.id;

        if (!deleteId) {
          return res.status(400).json({ message: "ID required for delete" });
        }

        const deleteQuery = `DELETE FROM ${module.tableName} WHERE id = $1 RETURNING *`;
        const deletedRecord = await prisma.$queryRawUnsafe(
          deleteQuery,
          deleteId,
        );

        return res.status(200).json({
          success: true,
          data: Array.isArray(deletedRecord) ? deletedRecord[0] : deletedRecord,
        });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("Dynamic Module API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
