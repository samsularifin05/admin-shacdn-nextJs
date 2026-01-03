import { prisma } from "@/lib/prisma";
import { KategoriFormData } from "../types/kategoris.schema";

export const kategoriServer = {
  async getPaginated(page: number, limit: number, search?: string, filters?: Record<string, any>) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { kodeGroup: { contains: search, mode: "insensitive" } },
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
      include: {
        
        
      },
    });
  },

  async create(data: KategoriFormData) {
    const createData: any = { ...data };
    

    
    return prisma.tm_kategori.create({
      data: createData,
      include: {
        
        
      },
    });
  },

  async update(id: number, data: KategoriFormData) {
    const updateData: any = { ...data };
    

    return prisma.tm_kategori.update({
      where: { id },
      data: updateData,
      include: {
        
        
      },
    });
  },

  async delete(id: number) {
    return prisma.tm_kategori.delete({
      where: { id },
    });
  },
};
