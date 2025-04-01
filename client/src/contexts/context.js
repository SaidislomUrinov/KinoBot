import { configureStore } from "@reduxjs/toolkit";
import user from './user';
import genres from './genres';
export default configureStore({
    reducer: {
        user,
        genres
    }
});