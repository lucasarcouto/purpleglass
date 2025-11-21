export interface TokenPayload {
  userId: number;
  email: string;
}

export interface UserData {
  id: number;
  email: string;
  name: string | null;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}
