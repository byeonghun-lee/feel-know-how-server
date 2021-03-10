import mongoose, { Schema } from "mongoose";

const BoxSchema = new Schema({
    name: { type: String, enum: ["inBox", "trash"], required: true },
    userId: { type: String, required: true },
});
