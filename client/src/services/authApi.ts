import { api } from "./api";

interface AuthResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  };
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RefreshResponse {
  message: string;
  accessToken: string;
}

interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    profileImage?: string;
    isVerified: boolean;
    createdAt: string;
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse, SignupData>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginData>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    logoutApi: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    updateProfile: builder.mutation<
      { message: string; user: MeResponse["user"] },
      { name?: string; profileImage?: string }
    >({
      query: (body) => ({
        url: "/auth/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PUT",
        body,
      }),
    }),
    refresh: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutApiMutation,
  useRefreshMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
