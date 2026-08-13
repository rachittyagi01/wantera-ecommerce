import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"
import type { RootState, AppDispatch } from "./store"

// Use these throughout the app instead of plain `useDispatch`/`useSelector` —
// they know WANTERA's exact state shape, so you get autocomplete and type-checking.
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector