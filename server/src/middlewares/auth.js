import configs from "../utils/configs.js";
import jwt from 'jsonwebtoken';
export default async (req, res, next) => {
    try {
        const token = req.headers?.['x-auth-token'];
        if (!token || !token?.startsWith('Bearer ')) throw new Error("Invalid token");

        const decoded = jwt.verify(token.replace('Bearer ', ''), configs.access);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.send({
            ok: false,
            msg: error.message
        })
    }
}