import mongoose, { Schema } from "mongoose";

const BoxSchema = new Schema({
    name: { type: String, enum: ["inbox", "trash"], required: true },
    userId: { type: mongoose.Types.ObjectId, required: true },
});

const Box = mongoose.model("Box", BoxSchema);
export default Box;
