import { ApiService } from "../apiService";
import { ILoginResponse, IRegisterPayload, IRegisterResponse, IVerificationResponse, IUser } from "@/types/auth";

const apiService = new ApiService();

export const userService = {
  /** Login user with email and password */
  login: async (email: string, password: string) => {
    return await apiService.post<ILoginResponse>({
      endpoint: "/api/auth/login",
      config: {
        body: { email, password },
      },
    });
  },

  /** Register new user */
  register: async (payload: IRegisterPayload) => {
    return await apiService.post<IRegisterResponse>({
      endpoint: "/api/auth/register",
      config: {
        body: payload,
      },
    });
  },

  /** Get current user profile */
  getProfile: async () => {
    return await apiService.get<IUser>({
      endpoint: "/api/auth/profile",
      config: {
        requiresAuth: true,
      },
    });
  },

  /** Verify account via token */
  verifyAccount: async (token: string) => {
    return await apiService.post<IVerificationResponse>({
      endpoint: "/api/auth/verify",
      config: {
        body: { token },
      },
    });
  },

  /** Resend verification email */
  resendVerification: async (email: string) => {
    return await apiService.post<IVerificationResponse>({
      endpoint: "/api/auth/verify/resend",
      config: {
        body: { email },
      },
    });
  },

  /** Request password reset link */
  forgotPassword: async (email: string) => {
    return await apiService.post<IVerificationResponse>({
      endpoint: "/api/auth/forgot-password",
      config: {
        body: { email },
      },
    });
  },

  /** Submit new password using reset token */
  resetPassword: async (token: string, newPassword: string) => {
    return await apiService.post<IVerificationResponse>({
      endpoint: "/api/auth/reset-password",
      config: {
        body: { token, newPassword },
      },
    });
  },
};

