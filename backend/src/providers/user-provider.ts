import bcrypt from "bcryptjs";
import { prisma } from "@/core/database/client.js";
import { blobProvider } from "@/providers/blob-provider.js";

interface UserExportData {
  user: {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
  notes: Array<{
    id: string;
    title: string;
    content: unknown;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  }>;
  files: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    createdAt: Date;
  }>;
  statistics: {
    totalNotes: number;
    totalFiles: number;
    totalStorageBytes: number;
    accountAge: string;
  };
}

class UserProvider {
  /**
   * Exports all user data for GDPR Article 20 (Right to Data Portability)
   *
   * @param userId - ID of the user requesting data export
   * @returns Complete user data including notes, files, and metadata
   */
  async exportUserData(userId: number): Promise<UserExportData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch all user notes
    const notes = await prisma.note.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all user files
    const files = await prisma.blobMetadata.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        url: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalStorageBytes = files.reduce((sum, file) => sum + file.size, 0);
    const accountAge = this.calculateAccountAge(user.createdAt);

    return {
      user,
      notes,
      files,
      statistics: {
        totalNotes: notes.length,
        totalFiles: files.length,
        totalStorageBytes,
        accountAge,
      },
    };
  }

  /**
   * Deletes user account and all associated data for GDPR Article 17 (Right to Erasure)
   *
   * @param userId - ID of the user to delete
   * @param password - User's password for confirmation
   * @throws Error if password is incorrect or deletion fails
   */
  async deleteUserAccount(userId: number, password: string): Promise<void> {
    // Verify user exists and password is correct
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Get all user blob files to delete from Vercel Blob
    const blobFiles = await prisma.blobMetadata.findMany({
      where: { userId },
      select: { url: true },
    });

    // Delete all files from Vercel Blob Storage
    const blobUrls = blobFiles.map((file: { url: string }) => file.url);

    if (blobUrls.length > 0) {
      try {
        await blobProvider.deleteFilesInternal(blobUrls);
      } catch (error) {
        console.error("Failed to delete blob files:", error);
        // Continue with deletion even if blob deletion fails
      }
    }

    // Delete user account - this will cascade delete notes and blob_metadata
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Gets user info by ID
   */
  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Calculates human-readable account age
   * @private
   */
  private calculateAccountAge(createdAt: Date): string {
    const now = new Date();

    const diffMs = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    const remainingDays = diffDays % 30;

    const parts: string[] = [];

    if (diffYears > 0)
      parts.push(`${diffYears} year${diffYears > 1 ? "s" : ""}`);
    if (diffMonths > 0)
      parts.push(`${diffMonths} month${diffMonths > 1 ? "s" : ""}`);
    if (remainingDays > 0 || parts.length === 0)
      parts.push(`${remainingDays} day${remainingDays !== 1 ? "s" : ""}`);

    return parts.join(", ");
  }
}

export const userProvider = new UserProvider();
