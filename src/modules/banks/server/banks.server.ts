import { prisma } from "@/lib/prisma";
import { BankFormData } from "../types/banks.schema";

export const bankServer = {
  async getPaginated(page: number, limit: number, search?: string, filters?: Record<string, any>) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
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
      prisma.tm_banks.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_banks.count({ where }),
    ]);

    return {
      "banks": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number) {
    return prisma.tm_banks.findUnique({
      where: { id },
    });
  },

  async create(data: BankFormData) {
    return prisma.tm_banks.create({
      data: {
        ...data,
      },
    });
  },

  async update(id: number, data: BankFormData) {
    return prisma.tm_banks.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.tm_banks.delete({
      where: { id },
    });
  },
};
