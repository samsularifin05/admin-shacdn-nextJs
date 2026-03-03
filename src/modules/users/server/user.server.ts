import { prisma } from "@/lib/prisma";
import { User, UserFormData } from "../types/user.schema";
import { sanitizeObject, sanitizeString } from "@/lib/security";
import bcrypt from "bcrypt";
import { Prisma, User as PrismaUser } from "@prisma/client";

/**
 * Normalize DB status value to application status union type
 */
const normalizeStatus = (status: string): User["status"] => {
  return status === "Inactive" ? "Inactive" : "Active";
};

/**
 * Map Prisma user entity into API-safe User shape
 */
const toUser = (data: PrismaUser): User => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: normalizeStatus(data.status),
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
};

const toUsers = (data: PrismaUser[]): User[] => {
  return data.map(toUser);
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
        users: toUsers(users),
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
      return toUsers(users);
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
      return user ? toUser(user) : null;
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
    return toUser(user);
  },

  /**
   * Update a user
   */
  async updateUser(id: number, data: UserFormData): Promise<User> {
    // SECURITY: Sanitize all input data to prevent XSS
    const safeData = sanitizeObject(data);

    const updateData: Prisma.UserUpdateInput = {
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
    return toUser(user);
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

    return toUser(user);
  },
};
