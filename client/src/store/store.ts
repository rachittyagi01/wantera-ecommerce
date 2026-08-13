import { configureStore } from "@reduxjs/toolkit"

export const store = configureStore({
  reducer: {
    // Feature slices will be added here as we build them.
    // Example (added in Phase 9 — Authentication):
    // auth: authReducer,
  },
})

// Types inferred from the store itself — used throughout the app
// so every component knows the exact shape of global state.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch