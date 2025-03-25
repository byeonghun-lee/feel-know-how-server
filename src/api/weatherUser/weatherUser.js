import mongoose, { Schema } from "mongoose";

const weatherUserSchema = new Schema(
    {
        deviceId: { type: String, required: true },
        token: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const WeatherUser = mongoose.model("WeatherUser", weatherUserSchema);

export default WeatherUser;
