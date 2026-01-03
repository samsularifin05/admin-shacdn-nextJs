import { prisma } from "@/lib/prisma";
import { BakiFormData } from "../types/bakis.schema";

export const bakiServer = {
  async getPaginated(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { kodeGudang: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.tm_baki.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_baki.count({ where }),
    ]);

    return {
      "bakis": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number) {
    return prisma.tm_baki.findUnique({
      where: { id },
    });
  },

  async create(data: BakiFormData) {
    return prisma.tm_baki.create({
      data: {
        ...data,
      },
    });
  },

  async update(id: number, data: BakiFormData) {
    return prisma.tm_baki.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.tm_baki.delete({
      where: { id },
    });
  },
};
