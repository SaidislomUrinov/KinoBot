import { createSlice } from "@reduxjs/toolkit";

const genres = createSlice({
    name: 'genres',
    initialState: {
        genres: []
    },
    reducers: {
        updateGenres: (state, action) => {
            state.genres = action.payload
        },
    }
});

export const { updateGenres } = genres.actions;
export default genres.reducer;