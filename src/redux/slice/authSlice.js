import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    user: null,
    studentInfo: null,
    tuitionInfo: null,
    token: null,
    isAuthenticated: false,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            if (action.payload.user) {
                state.user = action.payload.user
            }
            if (action.payload.tuitionInfo) {
                state.tuitionInfo = action.payload.tuitionInfo
            }
            if (action.payload.studentInfo) {
                state.studentInfo = action.payload.studentInfo
            }
            if (action.payload.token) {
                state.token = action.payload.token
                state.isAuthenticated = true
            }
        },
        logout: () => initialState,

        updateUser: (state, action) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    ...action.payload,
                }
            }
        },
    },
})

export const { login, logout, updateUser } = authSlice.actions
export default authSlice.reducer
