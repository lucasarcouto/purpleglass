import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "@/core/database/client.js";
import { TokenPayload, UserData } from "@/types.js";

class AuthProvider {
  /**
   * Creates a new user account.
   *
   * @param email - User's email address
   * @param password - Plain text password (will be hashed before storing in the database)
   * @param name - User's full name
   *
   * @returns JWT token and sanitized user data
   *
   * @throws Error if email already exists
   */
  async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<UserData> {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Authenticates a user.
   *
   * @param email - User's email address
   * @param password - Plain text password to verify
   *
   * @returns JWT token and sanitized user data
   *
   * @throws Error if credentials are invalid
   */
  async authenticateUser(email: string, password: string): Promise<UserData> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await this.comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Verifies a JWT token and extracts payload.
   *
   * @param token - JWT token to verify
   *
   * @returns Token payload if valid, null otherwise
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      const secret = this.getJwtSecret();
      const payload = jwt.verify(token, secret) as TokenPayload;

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Hashes a password using bcrypt.
   *
   * @param password - Plain text password
   *
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a plain text password with a hash.
   *
   * @param password - Plain text password
   * @param hash - Stored password hash
   *
   * @returns True if password matches, false otherwise
   */
  private async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a JWT token for a user.
   *
   * @param userId - User's database ID
   * @param email - User's email
   *
   * @returns Signed JWT token
   */
  private generateToken(userId: number, email: string): string {
    const secret = this.getJwtSecret();
    const payload: TokenPayload = { userId, email };
    const options: SignOptions = { expiresIn: "7d" };

    return jwt.sign(payload, secret, options);
  }

  /**
   * Gets JWT secret from environment.
   *
   * @returns JWT secret
   *
   * @throws Error if JWT_SECRET is not set
   */
  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is not defined in environment variables. Please set it in your .env file."
      );
    }

    return secret;
  }
}

export const authProvider = new AuthProvider();
