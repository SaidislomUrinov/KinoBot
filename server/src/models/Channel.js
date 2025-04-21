import { model, Schema } from "mongoose";
import { getNow } from "../utils/date.js";
import Join from "./Join.js";

const schema = new Schema({
    id: String,
    name: String,
    username: String,
    url: String,//if global? username : invite link
    created: {
        type: Number,
        default: getNow
    },
    type: {
        type: String,
        enum: ['public', 'private', 'request']
    },
    target: Number,
});
schema.methods.result = async function () {
    try {
        const joins = await Join.countDocuments({ channel: this._id });
        return joins
    } catch (error) {
        console.error(error);
        return 0
    }
}
export default model('Channel', schema);