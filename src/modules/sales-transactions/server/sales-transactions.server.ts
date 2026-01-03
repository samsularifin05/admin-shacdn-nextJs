import { prisma } from "@/lib/prisma";
import { SalesTransactionFormData } from "../types/sales-transactions.schema";

export const salesTransactionServer = {
  async getPaginated(page: number, limit: number, search?: string, filters?: Record<string, any>) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { transactionCode: { contains: search, mode: "insensitive" } },
      ];
    }
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          if (!isNaN(Number(val))) where[key] = Number(val);
          else where[key] = val;
        }
      });
    }

    const [data, total] = await Promise.all([
      prisma.tm_sales_transaction.findMany({
        skip,
        take: limit,
        where,
        include: {
          items: { include: { barangIdRel: true } }
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_sales_transaction.count({ where }),
    ]);

    return {
      "sales-transactions": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number) {
    return prisma.tm_sales_transaction.findUnique({
      where: { id },
      include: {
        
        items: { include: { barangIdRel: true } }
      },
    });
  },

  async create(data: SalesTransactionFormData) {
    // Auto-generate codes for: transactionCode
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix_transactionCode = `SLS-${year}${month}${day}-`;
    const lastRecord_transactionCode = await prisma.tm_sales_transaction.findFirst({
      where: {
        transactionCode: {
          startsWith: prefix_transactionCode,
        },
      },
      orderBy: { transactionCode: "desc" },
    });

    let nextSeq_transactionCode = 1;
    if (lastRecord_transactionCode) {
      const lastCode = lastRecord_transactionCode.transactionCode;
      const lastSeqStr = lastCode.substring(prefix_transactionCode.length);
      const lastSeq = parseInt(lastSeqStr);
      if (!isNaN(lastSeq)) {
        nextSeq_transactionCode = lastSeq + 1;
      }
    }
    data.transactionCode = prefix_transactionCode + String(nextSeq_transactionCode).padStart(4, "0");

    const createData: any = { ...data };
    
    if (data.items) {
      createData.items = {
        create: data.items
      };
    }

    
    return prisma.$transaction(async (tx) => {
      const result = await tx.tm_sales_transaction.create({
        data: createData,
        include: { 
          items: true 
        }
      });

      // Stock Logic: reduce tm_barang
      const detailField = "items";
      if (detailField && result[detailField]) {
        for (const item of (result[detailField] as any[])) {
          if (item.barangId) {
            await tx.tm_barang.update({
              where: { id: item.barangId },
              data: {
                stock: {
                  decrement: item.qty
                }
              }
            });
          }
        }
      }
      return result;
    });
  },

  async update(id: number, data: SalesTransactionFormData) {
    const updateData: any = { ...data };
    
    if (data.items) {
      updateData.items = {
        deleteMany: {},
        create: data.items
      };
    }

    return prisma.tm_sales_transaction.update({
      where: { id },
      data: updateData,
      include: {
        
        items: true
      },
    });
  },

  async delete(id: number) {
    return prisma.tm_sales_transaction.delete({
      where: { id },
    });
  },
};
