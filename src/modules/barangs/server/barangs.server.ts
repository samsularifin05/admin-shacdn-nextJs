import { prisma } from "@/lib/prisma";
import { BarangFormData } from "../types/barangs.schema";

export const barangServer = {
  async getPaginated(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { kodeBarang: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.tm_barang.findMany({
        skip,
        take: limit,
        where,
        include: {
          kategoriRel: true,
          jenisRel: true,
          kodeBakiRel: true
        },
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
        include: {
          kategoriRel: true,
          jenisRel: true,
          kodeBakiRel: true
        },
    });
  },

  async create(data: BarangFormData) {
    // Auto-generate codes for: kodeBarang
    const lastRecord_kodeBarang = await prisma.tm_barang.findFirst({
      orderBy: { kodeBarang: "desc" },
    });

    let nextSeq_kodeBarang = 1;
    if (lastRecord_kodeBarang) {
      const lastCode = lastRecord_kodeBarang.kodeBarang;
      const lastSeq = parseInt(lastCode);
      if (!isNaN(lastSeq)) {
        nextSeq_kodeBarang = lastSeq + 1;
      }
    }
    data.kodeBarang = String(nextSeq_kodeBarang).padStart(8, "0");

    return prisma.tm_barang.create({
      data: {
        ...data,
      },
        include: {
          kategoriRel: true,
          jenisRel: true,
          kodeBakiRel: true
        },
    });
  },

  async update(id: number, data: BarangFormData) {
    return prisma.tm_barang.update({
      where: { id },
      data,
        include: {
          kategoriRel: true,
          jenisRel: true,
          kodeBakiRel: true
        },
    });
  },

  async delete(id: number) {
    return prisma.tm_barang.delete({
      where: { id },
    });
  },
};
