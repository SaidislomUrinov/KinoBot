import { model, Schema } from "mongoose";

const schema = new Schema({
    name: String
});
export default model('Genre', schema);