import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const SnsAccountSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    instagram: {
        path: { type: String },
        isRegister: { type: Boolean, default: false },
    },
    youtube: {
        path: { type: String },
        isRegister: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    updatedAt: { type: Date, default: () => dayjs().toDate() },
});

const SnsAccount = mongoose.model("SnsAccount", SnsAccountSchema);
export default SnsAccount;
