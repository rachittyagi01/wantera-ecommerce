import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
}

interface AuthState {
  user: User | null
  accessToken: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer