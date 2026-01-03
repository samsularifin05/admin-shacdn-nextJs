import { prisma } from "@/lib/prisma";
import { BarangFormData } from "../types/barangs.schema";

export const barangServer = {
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
      prisma.tm_barang.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_barang.count({ where }),
    ]);

    return {
      "barangs": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },



  async getById(id: number) {
    return prisma.tm_barang.findUnique({
      where: { id },
    });
  },

  async create(data: BarangFormData) {
    return prisma.tm_barang.create({
      data: {
        ...data,
      },
    });
  },

  async update(id: number, data: BarangFormData) {
    return prisma.tm_barang.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.tm_barang.delete({
      where: { id },
    });
  },
};
