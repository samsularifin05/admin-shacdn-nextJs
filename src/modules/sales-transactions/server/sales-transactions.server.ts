import { prisma } from "@/lib/prisma";
import { SalesTransactionFormData } from "../types/sales-transactions.schema";

export const salesTransactionServer = {
  async getPaginated(page: number, limit: number, search?: string, filters?: Record<string, any>) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { transactionCode: { contains: search, mode: "insensitive" } },
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
      prisma.tm_sales_transaction.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tm_sales_transaction.count({ where }),
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
    return prisma.tm_sales_transaction.findUnique({
      where: { id },
    });
  },

  async create(data: SalesTransactionFormData) {
    // Auto-generate codes for: transactionCode
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix_transactionCode = `CC-FJ-${year}${month}${day}-`;
    const lastRecord_transactionCode = await prisma.tm_sales_transaction.findFirst({
      where: {
        transactionCode: {
          startsWith: prefix_transactionCode,
        },
      },
      orderBy: { transactionCode: "desc" },
    });

    let nextSeq_transactionCode = 1;
    if (lastRecord_transactionCode) {
      const lastCode = lastRecord_transactionCode.transactionCode;
      const lastSeqStr = lastCode.substring(prefix_transactionCode.length);
      const lastSeq = parseInt(lastSeqStr);
      if (!isNaN(lastSeq)) {
        nextSeq_transactionCode = lastSeq + 1;
      }
    }
    data.transactionCode = prefix_transactionCode + String(nextSeq_transactionCode).padStart(4, "0");

    return prisma.tm_sales_transaction.create({
      data: {
        ...data,
      },
    });
  },

  async update(id: number, data: SalesTransactionFormData) {
    return prisma.tm_sales_transaction.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.tm_sales_transaction.delete({
      where: { id },
    });
  },
};
