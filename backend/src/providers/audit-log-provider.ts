import { prisma } from "@/core/database/client.js";
import { Prisma } from "@prisma/client";

export type AuditAction =
  // Authentication actions
  | "register"
  | "login"
  | "login_failed"
  | "logout"
  // User data actions
  | "access_user_data"
  | "export_user_data"
  | "delete_user_account"
  // Note actions
  | "create_note"
  | "update_note"
  | "delete_note"
  // File actions
  | "upload_file"
  | "delete_file";

export type ResourceType = "user" | "note" | "file";

export interface AuditLogInput {
  userId?: number;
  action: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.JsonObject;
}

class AuditLogProvider {
  /**
   * Creates an audit log entry.
   *
   * @param input - Audit log data
   */
  async log(input: AuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          metadata: input.metadata ?? Prisma.JsonNull,
        },
      });
    } catch (error) {
      // If foreign key constraint fails (user was deleted), retry with null userId
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "P2003"
      ) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: null, // Anonymize the log
              action: input.action,
              resourceType: input.resourceType,
              resourceId: input.resourceId,
              ipAddress: input.ipAddress,
              userAgent: input.userAgent,
              metadata: input.metadata ?? Prisma.JsonNull,
            },
          });
          console.log(
            `Audit log created with null userId (original userId ${input.userId} no longer exists)`
          );
          return;
        } catch (retryError) {
          console.error("Failed to create anonymized audit log:", retryError);
        }
      }

      // Log error but don't throw - audit logging should not break the main flow
      console.error("Failed to create audit log:", error);
    }
  }

  /**
   * Gets audit logs for a specific user.
   *
   * @param userId - User ID
   * @param limit - Maximum number of logs to return
   * @param offset - Number of logs to skip
   */
  async getUserLogs(userId: number, limit = 50, offset = 0) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Gets all audit logs with optional filtering.
   *
   * @param action - Filter by action type
   * @param limit - Maximum number of logs to return
   * @param offset - Number of logs to skip
   */
  async getAllLogs(action?: AuditAction, limit = 100, offset = 0) {
    return prisma.auditLog.findMany({
      where: action ? { action } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}

export const auditLogProvider = new AuditLogProvider();
