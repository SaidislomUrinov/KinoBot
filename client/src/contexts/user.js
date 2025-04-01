import { createSlice } from "@reduxjs/toolkit";

const user = createSlice({
    name: 'user',
    initialState: {
        id: '',
        name: '',
        photo: '',
        access: ''
    },
    reducers: {
        updateUser: (state, action) => {
            return { ...state, ...action.payload }
        },
        clearUser: (state) => {
            state.id = '';
            state.name = '';
            state.photo = '';
            state.access = '';
        }
    }
});

export const { updateUser, clearUser } = user.actions;
export default user.reducer;