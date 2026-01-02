import { Bank, BankFormData } from "../types/banks.schema";
import { apiClient } from "@/lib/api-client";

const API_BASE = "/api/banks";

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const bankService = {
  async getAll(page = 1, limit = 10, search?: string): Promise<PaginatedResult<Bank>> {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.append("search", search);
    const res = await apiClient.get(`${API_BASE}?${query.toString()}`);
    return res.json();
  },

  async create(data: BankFormData): Promise<Bank> {
    const res = await apiClient.post(API_BASE, data);
    return res.json();
  },

  async update(id: number, data: BankFormData): Promise<Bank> {
    const res = await apiClient.put(`${API_BASE}/${id}`, data);
    return res.json();
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_BASE}/${id}`);
  },
};
