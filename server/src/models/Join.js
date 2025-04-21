import { model, Schema } from "mongoose";
import { getNow } from "../utils/date.js";

const schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel'
    },

    created: {
        type: Number,
        default: getNow
    },
});

export default model('Join', schema);