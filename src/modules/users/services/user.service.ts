import { User, UserFormData } from "../types/user.schema";
import { apiClient } from "@/lib/api-client";

const API_BASE = "/api/users";

export interface PaginatedResult<T> {
  users: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const userService = {
  // GET: Fetch paginated users
  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedResult<User>> {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) query.append("search", search);

    const response = await apiClient.get(`${API_BASE}?${query.toString()}`);
    return response.json();
  },

  // POST: Create a new user
  async createUser(data: UserFormData): Promise<User> {
    const response = await apiClient.post(API_BASE, data);
    return response.json();
  },

  // PUT: Update an existing user
  async updateUser(id: number, data: UserFormData): Promise<User> {
    const response = await apiClient.put(`${API_BASE}/${id}`, data);
    return response.json();
  },

  // DELETE: Remove a user
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`${API_BASE}/${id}`);
  },
};
