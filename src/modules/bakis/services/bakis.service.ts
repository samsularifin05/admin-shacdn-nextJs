import { Baki, BakiFormData } from "../types/bakis.schema";
import { apiClient } from "@/lib/api-client";

const API_BASE = "/api/bakis";

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const bakiService = {
  async getAll(page = 1, limit = 10, search?: string): Promise<PaginatedResult<Baki>> {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.append("search", search);
    const res = await apiClient.get(`${API_BASE}?${query.toString()}`);
    return res.json();
  },

  async create(data: BakiFormData): Promise<Baki> {
    const res = await apiClient.post(API_BASE, data);
    return res.json();
  },

  async update(id: number, data: BakiFormData): Promise<Baki> {
    const res = await apiClient.put(`${API_BASE}/${id}`, data);
    return res.json();
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_BASE}/${id}`);
  },
};
