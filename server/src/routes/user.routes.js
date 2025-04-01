import { Router } from "express";
import userController from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

export default Router()
    .post('/signIn', userController.signIn)
    .get('/getAllMedia', auth, userController.getAllMedia)
    .get('/getGenres', userController.getGenres)
    .post('/sendMe', auth, userController.sendMe)
