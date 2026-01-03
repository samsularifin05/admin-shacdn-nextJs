import { prisma } from "@/lib/prisma";
import { JenisFormData } from "../types/jenis.schema";

export const jenisServer = {
  async getPaginated(page: number, limit: number, search?: string, filters?: Record<string, any>) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { kodeJenis: { contains: search, mode: "insensitive" } },
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
    const createData: any = { ...data };
    

    
    return prisma.tm_jenis.create({
      data: createData,
      include: {
        kodeGroupRel: true
        
      },
    });
  },

  async update(id: number, data: JenisFormData) {
    const updateData: any = { ...data };
    

    return prisma.tm_jenis.update({
      where: { id },
      data: updateData,
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
