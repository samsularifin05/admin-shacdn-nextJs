import { prisma } from "@/lib/prisma";
import { BannerFormData } from "../types/banners.schema";

export const bannerServer = {
  async getPaginated(page: number, limit: number, search?: string, filters?: Record<string, any>) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
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
      prisma.tm_banner.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_banner.count({ where }),
    ]);

    return {
      "banners": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number) {
    return prisma.tm_banner.findUnique({
      where: { id },
      include: {
        
        
      },
    });
  },

  async create(data: BannerFormData) {
    const createData: any = { ...data };
    

    
    return prisma.tm_banner.create({
      data: createData,
      include: {
        
        
      },
    });
  },

  async update(id: number, data: BannerFormData) {
    const updateData: any = { ...data };
    

    return prisma.tm_banner.update({
      where: { id },
      data: updateData,
      include: {
        
        
      },
    });
  },

  async delete(id: number) {
    return prisma.tm_banner.delete({
      where: { id },
    });
  },
};
