import { prisma } from "@/lib/prisma";
import { SalesTransactionFormData } from "../types/sales-transactions.schema";

export const salesTransactionServer = {
  async getPaginated(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        // Add other search fields if needed
      ];
    }

    const [data, total] = await Promise.all([
      prisma.tr_sales.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tr_sales.count({ where }),
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
    return prisma.tr_sales.findUnique({
      where: { id },
    });
  },

  async create(data: SalesTransactionFormData) {
    return prisma.tr_sales.create({
      data: {
        ...data,
      },
    });
  },

  async update(id: number, data: SalesTransactionFormData) {
    return prisma.tr_sales.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.tr_sales.delete({
      where: { id },
    });
  },
};
