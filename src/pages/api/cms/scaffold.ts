import { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method } = req;

    if (method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const moduleConfig = req.body;

    // Save config to formJson directory
    const formJsonDir = path.resolve(process.cwd(), "formJson");
    if (!fs.existsSync(formJsonDir)) {
      fs.mkdirSync(formJsonDir, { recursive: true });
    }

    const configPath = path.join(
      formJsonDir,
      `${moduleConfig.resourceName}.json`,
    );
    fs.writeFileSync(configPath, JSON.stringify(moduleConfig, null, 2));

    // Run scaffold script
    try {
      const output = execSync(
        `npm run generate:module ${moduleConfig.resourceName}`,
        {
          cwd: process.cwd(),
          encoding: "utf-8",
        },
      );

      return res.status(200).json({
        success: true,
        message: "Module scaffolding generated successfully",
        output,
        configPath,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate scaffold",
        error: error.message,
        output: error.stdout || error.stderr,
      });
    }
  } catch (error: any) {
    console.error("CMS Scaffold API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
