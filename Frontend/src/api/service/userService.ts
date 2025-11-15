import { ApiService } from "../apiService";
import { IUser, ILoginResponse, IRegisterPayload } from "@/types/auth";

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
    return await apiService.post<ILoginResponse>({
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
};

