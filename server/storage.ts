import {
  users,
  files,
  userSettings,
  type User,
  type UpsertUser,
  type File,
  type InsertFile,
  type UserSettings,
  type InsertUserSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // File operations
  getFiles(userId: string): Promise<File[]>;
  getDeletedFiles(userId: string): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  getFileByShareToken(token: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, data: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: string): Promise<void>;
  restoreFile(id: string): Promise<void>;
  permanentDeleteFile(id: string): Promise<void>;
  emptyTrash(userId: string): Promise<void>;

  // Settings operations
  getSettings(userId: string): Promise<UserSettings | undefined>;
  upsertSettings(settings: InsertUserSettings & { userId: string }): Promise<UserSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // File operations
  async getFiles(userId: string): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isDeleted, false)));
  }

  async getDeletedFiles(userId: string): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isDeleted, true)));
  }

  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getFileByShareToken(token: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.shareToken, token));
    return file;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async updateFile(id: string, data: Partial<InsertFile>): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    await db
      .update(files)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(files.id, id));
  }

  async restoreFile(id: string): Promise<void> {
    await db
      .update(files)
      .set({ isDeleted: false, deletedAt: null })
      .where(eq(files.id, id));
  }

  async permanentDeleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async emptyTrash(userId: string): Promise<void> {
    await db
      .delete(files)
      .where(and(eq(files.userId, userId), eq(files.isDeleted, true)));
  }

  // Settings operations
  async getSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertSettings(
    settingsData: InsertUserSettings & { userId: string }
  ): Promise<UserSettings> {
    const existing = await this.getSettings(settingsData.userId);
    
    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(userSettings.userId, settingsData.userId))
        .returning();
      return updated;
    }
    
    const [newSettings] = await db
      .insert(userSettings)
      .values(settingsData)
      .returning();
    return newSettings;
  }
}

export const storage = new DatabaseStorage();
