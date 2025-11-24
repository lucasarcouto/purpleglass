import { put, del } from "@vercel/blob";
import { prisma } from "@/core/database/client.js";

interface UploadOptions {
  addRandomSuffix?: boolean;
}

class BlobProvider {
  /**
   * Uploads a file to Vercel Blob storage and tracks ownership.
   *
   * @param userId - User ID who owns this file
   * @param filename - Original filename
   * @param buffer - File buffer
   * @param options - Upload options (access level, random suffix)
   *
   * @returns URL of the uploaded file
   */
  async uploadFile(
    userId: number,
    filename: string,
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<string> {
    const addRandomSuffix = options.addRandomSuffix ?? true;

    const blob = await put(filename, buffer, {
      access: "public",
      addRandomSuffix,
    });

    // Track blob ownership in database
    await prisma.blobMetadata.create({
      data: {
        url: blob.url,
        userId,
        filename,
        size: buffer.length,
      },
    });

    return blob.url;
  }

  /**
   * Deletes one or more files from Vercel Blob storage.
   * Verifies ownership before deletion.
   *
   * @param userId - User ID requesting the deletion
   * @param urls - Single URL or array of URLs to delete
   *
   * @returns Number of files deleted
   *
   * @throws Error if user doesn't own any of the files
   */
  async deleteFiles(userId: number, urls: string | string[]): Promise<number> {
    const urlsToDelete = Array.isArray(urls) ? urls : [urls];

    if (urlsToDelete.length === 0) {
      return 0;
    }

    // Only process URLs from our Vercel Blob store
    const validUrls = urlsToDelete.filter((url) => this.isBlobUrl(url));

    if (validUrls.length === 0) {
      return 0;
    }

    // Verify ownership - get blobs that belong to this user
    const ownedBlobs = await prisma.blobMetadata.findMany({
      where: {
        url: { in: validUrls },
        userId,
      },
      select: { url: true },
    });

    const ownedUrls = ownedBlobs.map((b) => b.url);

    if (ownedUrls.length === 0) {
      throw new Error(
        "No files found or you don't have permission to delete them"
      );
    }

    // Delete from Vercel Blob storage
    await del(ownedUrls);

    // Delete metadata from database
    await prisma.blobMetadata.deleteMany({
      where: {
        url: { in: ownedUrls },
        userId,
      },
    });

    return ownedUrls.length;
  }

  /**
   * Deletes files without ownership check (for internal use).
   * Used when ownership is already verified (e.g., deleting note's blobs).
   *
   * @param urls - URLs to delete
   */
  async deleteFilesInternal(urls: string[]): Promise<void> {
    if (urls.length === 0) {
      return;
    }

    const validUrls = urls.filter((url) => this.isBlobUrl(url));

    if (validUrls.length === 0) {
      return;
    }

    // Delete from Vercel Blob storage
    await del(validUrls);

    // Delete metadata from database
    await prisma.blobMetadata.deleteMany({
      where: {
        url: { in: validUrls },
      },
    });
  }

  /**
   * Extracts all Vercel Blob URLs from a JSON object/array.
   *
   * @param content - Content to search (usually note content)
   *
   * @returns Array of blob URLs found
   */
  extractBlobUrls(content: any): string[] {
    const urls: string[] = [];

    if (!content) return urls;

    urls.push(...this.extractFromObject(content));

    return urls;
  }

  private extractFromObject(obj: any): string[] {
    const urls: string[] = [];

    if (typeof obj === "string" && this.isBlobUrl(obj)) {
      urls.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => {
        urls.push(...this.extractFromObject(item));
      });
    } else if (typeof obj === "object" && obj !== null) {
      Object.values(obj).forEach((value) => {
        urls.push(...this.extractFromObject(value));
      });
    }

    return urls;
  }

  /**
   * Checks if a URL is a Vercel Blob URL.
   * Supported format: https://{store-id}.public.blob.vercel-storage.com/{path}/{filename}
   *
   * @param url - URL to check
   *
   * @returns True if URL is from Vercel Blob storage
   */
  private isBlobUrl(url: string): boolean {
    if (typeof url !== "string") {
      return false;
    }

    try {
      const urlObj = new URL(url);

      // Must be https
      if (urlObj.protocol !== "https:") {
        return false;
      }

      // Match Vercel Blob storage domain pattern: *.public.blob.vercel-storage.com
      const hostname = urlObj.hostname;

      return hostname.endsWith(".public.blob.vercel-storage.com");
    } catch {
      return false;
    }
  }
}

export const blobProvider = new BlobProvider();
