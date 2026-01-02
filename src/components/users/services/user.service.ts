import { User, UserFormData } from "../dto/user.schema";

// Simulating API latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data storage (in-memory for demo)
let mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ["Admin", "User", "Editor", "Viewer"][Math.floor(Math.random() * 4)],
  status: ["Active", "Inactive"][Math.floor(Math.random() * 2)] as
    | "Active"
    | "Inactive",
}));

export const userService = {
  // GET: Fetch all users
  async getUsers(): Promise<User[]> {
    await delay(800);
    return [...mockUsers];
  },

  // POST: Create a new user
  async createUser(data: UserFormData): Promise<User> {
    await delay(1000);
    const newUser: User = {
      id: Math.max(0, ...mockUsers.map((u) => u.id)) + 1,
      ...data,
    };
    mockUsers = [newUser, ...mockUsers];
    return newUser;
  },

  // PUT: Update an existing user
  async updateUser(id: number, data: UserFormData): Promise<User> {
    await delay(1000);
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");

    const updatedUser = { ...mockUsers[index], ...data };
    mockUsers[index] = updatedUser;
    return updatedUser;
  },

  // DELETE: Remove a user
  async deleteUser(id: number): Promise<void> {
    await delay(800);
    mockUsers = mockUsers.filter((u) => u.id !== id);
  },
};
