import { model, Schema } from "mongoose";
import { getNow } from "../utils/date.js";

const schema = new Schema({
    id: Number,
    name: String,
    imageId: String,
    imagePath: String,
    smallImagePath: String,
    year: Number,
    desc: String,
    type: {
        type: String,
        enum: ['movie', 'serial']
    },
    mediaIds: [{
        duration: Number,
        fileId: String
    }],
    genres: [{
        type: Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    isPremium: {
        type: Boolean,
        default: false
    },
    created: {
        type: Number,
        default: getNow
    }
});

export default model('Media', schema);