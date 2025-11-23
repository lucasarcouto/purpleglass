export class ApiEndpoint {
  // Auth endpoints
  static readonly GET_CURRENT_USER = "/api/auth/me";
  static readonly REGISTER = "/api/auth/register";
  static readonly LOGIN = "/api/auth/login";
  static readonly LOGOUT = "/api/auth/logout";

  // Notes endpoints
  static readonly NOTES = "/api/notes";
  static note(id: string) {
    return `/api/notes/${id}`;
  }

  // Upload endpoint
  static readonly UPLOAD = "/api/upload";
}
