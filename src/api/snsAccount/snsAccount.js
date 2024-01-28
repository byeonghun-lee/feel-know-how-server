import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const SnsAccountSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    instagram: { type: String },
    youtube: { type: String },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    updatedAt: { type: Date, default: () => dayjs().toDate() },
});

const SnsAccount = mongoose.model("SnsAccount", SnsAccountSchema);
export default SnsAccount;
