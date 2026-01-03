import { prisma } from "@/lib/prisma";
import { JenisFormData } from "../types/jenis.schema";

export const jenisServer = {
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
      prisma.tm_jenis.findMany({
        skip,
        take: limit,
        where,
        include: {
          kodeGroupRel: true
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_jenis.count({ where }),
    ]);

    return {
      "jenis": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },



  async getById(id: number) {
    return prisma.tm_jenis.findUnique({
      where: { id },
        include: {
          kodeGroupRel: true
        },
    });
  },

  async create(data: JenisFormData) {
    return prisma.tm_jenis.create({
      data: {
        ...data,
      },
        include: {
          kodeGroupRel: true
        },
    });
  },

  async update(id: number, data: JenisFormData) {
    return prisma.tm_jenis.update({
      where: { id },
      data,
        include: {
          kodeGroupRel: true
        },
    });
  },

  async delete(id: number) {
    return prisma.tm_jenis.delete({
      where: { id },
    });
  },
};
