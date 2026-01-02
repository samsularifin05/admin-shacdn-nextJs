import { prisma } from "@/lib/prisma";
import { User, UserFormData } from "../types/user.schema";
import { sanitizeObject, sanitizeString } from "@/lib/security";
import bcrypt from "bcrypt";

/**
 * Helper to serialize Prisma objects for Next.js SSR (JSON compatible)
 */
const serializeUser = (data: any): User => {
  if (!data) return data;
  const serialized = JSON.parse(JSON.stringify(data));
  // Remove password from serialized output for security
  if (Array.isArray(serialized)) {
    serialized.forEach((u: any) => delete u.password);
  } else {
    delete serialized.password;
  }
  return serialized as User;
};

export const userServerLogic = {
  /**
   * Fetch paginated users
   */
  async getPaginatedUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;

      // Sanitize search input to prevent injection in search queries
      const safeSearch = search ? sanitizeString(search) : undefined;

      const where = safeSearch
        ? {
            OR: [
              { name: { contains: safeSearch, mode: "insensitive" as const } },
              { email: { contains: safeSearch, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users: serializeUser(users) as unknown as User[],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Prisma Error (getPaginatedUsers):", error);
      return {
        users: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }
  },

  /**
   * Fetch all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      return serializeUser(users) as unknown as User[];
    } catch (error) {
      console.error("Prisma Error (getAllUsers):", error);
      return [];
    }
  },

  /**
   * Fetch a single user
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return serializeUser(user);
    } catch (error) {
      console.error("Prisma Error (getUserById):", error);
      return null;
    }
  },

  /**
   * Create a new user with hashed password
   */
  async createUser(data: UserFormData): Promise<User> {
    // SECURITY: Sanitize all input data to prevent XSS
    const safeData = sanitizeObject(data);

    const hashedPassword = await bcrypt.hash(safeData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: safeData.name,
        email: safeData.email,
        password: hashedPassword,
        role: safeData.role,
        status: safeData.status,
      },
    });
    return serializeUser(user);
  },

  /**
   * Update a user
   */
  async updateUser(id: number, data: UserFormData): Promise<User> {
    // SECURITY: Sanitize all input data to prevent XSS
    const safeData = sanitizeObject(data);

    const updateData: any = {
      name: safeData.name,
      email: safeData.email,
      role: safeData.role,
      status: safeData.status,
    };

    // Only update password if it's changed from dummy and provided
    if (safeData.password && safeData.password !== "******") {
      updateData.password = await bcrypt.hash(safeData.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return serializeUser(user);
  },

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  },

  /**
   * Verify user credentials for login
   */
  async verifyUser(email: string, password: string): Promise<User> {
    // Sanitize email for lookup
    const safeEmail = sanitizeString(email);

    const user = await prisma.user.findUnique({
      where: { email: safeEmail },
    });

    if (!user) {
      throw new Error("User with this email not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect password");
    }

    return serializeUser(user);
  },
};
