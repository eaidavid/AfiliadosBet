import { eq, desc, count } from "drizzle-orm";
import { db } from "./db";
import { users, type User, type InsertUser, type LoginData } from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  authenticateUser(credentials: LoginData): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Clean admin operations
  getAllAffiliates(): Promise<Array<User>>;
  getTotalAffiliatesCount(): Promise<number>;
  updateUserStatus(id: number, isActive: boolean): Promise<void>;
  resetUserPassword(id: number): Promise<void>;
  deleteUser(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async authenticateUser(credentials: LoginData): Promise<User | undefined> {
    const user = credentials.usernameOrEmail.includes('@') 
      ? await this.getUserByEmail(credentials.usernameOrEmail)
      : await this.getUserByUsername(credentials.usernameOrEmail);

    if (!user) return undefined;

    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    return passwordMatch ? user : undefined;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllAffiliates(): Promise<Array<User>> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, 'affiliate'));

    return result;
  }

  async getTotalAffiliatesCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'affiliate'));
    
    return result.count;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id));
  }

  async resetUserPassword(id: number): Promise<void> {
    const newPassword = 'newpassword123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();