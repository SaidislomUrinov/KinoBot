import mongoose from "mongoose";
import cors from 'cors';
import express from "express";
import bot from "./src/bot/bot.js";
import configs from "./src/utils/configs.js";
import router from "./src/router.js";
mongoose.connect(configs.mongoUrl);
const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use('/api', router);
app.listen(configs.port, () => {
    bot.start();
    bot.catch(e => {
        console.log(e)
    });
})