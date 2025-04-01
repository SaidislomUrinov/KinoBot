import { Router } from "express";
import userRoutes from "./routes/user.routes.js";

export default Router()
    .use('/user', userRoutes)