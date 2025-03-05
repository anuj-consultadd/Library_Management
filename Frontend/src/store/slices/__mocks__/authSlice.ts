import { createSlice } from "@reduxjs/toolkit"

// Mock initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Mock auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUserRequest: (state) => {
      state.loading = true
      state.error = null
    },
    loginUserSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
    },
    loginUserFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logoutUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

// Export actions and reducer
export const { loginUserRequest, loginUserSuccess, loginUserFailure, logoutUser } = authSlice.actions
export default authSlice.reducer

