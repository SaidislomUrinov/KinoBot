import { model, Schema } from "mongoose";
import { getNow } from "../utils/date.js";
import jwt from 'jsonwebtoken';
import configs from "../utils/configs.js";
const schema = new Schema({
    id: Number,
    admin: Boolean,
    created: {
        type: Number,
        default: getNow
    },
    step: String,
    etc: {}
});
schema.methods.signIn = async function (name, photo) {
    try {
        const token = jwt.sign({ id: this.id, name: name || '', photo: photo || null }, configs.access);
        return token
    } catch (error) {
        console.log(error);
        return false
    }
}
export default model('User', schema);