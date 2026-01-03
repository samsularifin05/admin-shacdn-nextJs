import { prisma } from "@/lib/prisma";
import { KategoriFormData } from "../types/kategoris.schema";

export const kategoriServer = {
  async getPaginated(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { kodeGroup: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.tm_kategori.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_kategori.count({ where }),
    ]);

    return {
      "kategoris": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number) {
    return prisma.tm_kategori.findUnique({
      where: { id },
    });
  },

  async create(data: KategoriFormData) {
    return prisma.tm_kategori.create({
      data: {
        ...data,
      },
    });
  },

  async update(id: number, data: KategoriFormData) {
    return prisma.tm_kategori.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.tm_kategori.delete({
      where: { id },
    });
  },
};
