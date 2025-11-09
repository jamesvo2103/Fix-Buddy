import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user')) || null,
        loading: false
    },
    reducers: {
        login: (state, action) => {
            state.token = action.payload.token;
            state.user = {
                username: action.payload.username,
                experience: action.payload.experience
            };
            state.loading = false;
            // Store in localStorage
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify({
                username: action.payload.username,
                experience: action.payload.experience
            }));
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.loading = false;
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
})

export const { login, logout, setLoading } = authSlice.actions
export default authSlice.reducer
