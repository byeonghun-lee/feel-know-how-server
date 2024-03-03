import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const snsProfileSchema = new Schema({
    snsName: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    name: { type: String },
    desc: { type: String },
    lastUploadedAt: { type: Date },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    updatedAt: { type: Date, default: () => dayjs().toDate() },
    imageUrl: { type: String },
});

const SnsProfile = mongoose.model("SnsProfile", snsProfileSchema);
export default SnsProfile;
