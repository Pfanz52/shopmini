import { api } from "./api";
import { User } from "@/types/user.types";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "@/types/auth.types";
import { authenticateUser, getUserByEmail } from "@/data/mockUsers";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (response: any) => {
        console.log("Login response:", response);

        // Xử lý response từ API theo format thật từ backend
        if (response?.status === "success") {
          return {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
          };
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log("Login error:", response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || "Login failed";
      },
    }),

    verifyEmail: builder.mutation<{ message: string }, string>({
      async queryFn(token, _api, _extra, fetchWithBQ) {
        const result = await fetchWithBQ(`/auth/verify-email/${token}`);

        if (result.error) {
          const msg = (result.error.data as any)?.message as string | undefined;

          // Token đã dùng coi như thành công
          if (
            result.error.status === 400 &&
            msg &&
            (msg.includes("đã được xác thực") ||
              msg.includes("already verified") ||
              msg.includes("đã được sử dụng"))
          ) {
            return {
              data: { message: "Email đã được xác thực thành công trước đó" },
            };
          }

          return { error: result.error };
        }

        const data = result.data as any;
        return {
          data: { message: data?.message ?? "Email verified successfully" },
        };
      },
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      transformResponse: (response: any) => {
        console.log("Register response:", response);

        // Xử lý response từ API theo format thật từ backend
        if (response?.status === "success") {
          return {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
          };
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log("Register error:", response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || "Registration failed";
      },
    }),

    refreshToken: builder.mutation<
      { token: string; refreshToken: string },
      void
    >({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken: localStorage.getItem("refreshToken") },
      }),
      transformResponse: (response: any) => {
        console.log("Refresh token response:", response);

        if (response?.status === "success") {
          return {
            token: response.token,
            refreshToken: response.refreshToken,
          };
        }

        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log("Refresh token error:", response);

        // Clear tokens nếu refresh token expired
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        return response?.data || "Token refresh failed";
      },
    }),

    logout: builder.mutation<void, void>({
      queryFn: () => {
        try {
          // Clear localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: "Logout failed" } };
        }
      },
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log("Get current user response:", response);

        // Xử lý response từ API theo format thật từ backend
        if (response?.status === "success") {
          console.log("✅ Returning user data:", response.data);
          return response.data; // API trả về user trong response.data
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log("Get current user error:", response);
        // Let the global interceptor handle 401 errors
        return response?.data || "Failed to fetch user";
      },
      providesTags: ["CurrentUser"],
    }),
  }),
});

export const {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useVerifyEmailMutation,
} = authApi;
