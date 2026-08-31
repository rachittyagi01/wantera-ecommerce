import { api } from "./api"

interface AuthResponse {
  message: string
  accessToken: string
  user: {
    id: string
    name: string
    email: string
    role: "USER" | "ADMIN"
  }
}

interface SignupData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
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
  }),
})

export const { useSignupMutation, useLoginMutation, useLogoutApiMutation } = authApi