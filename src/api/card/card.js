import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const CardSchema = new Schema({
    title: { type: String, required: true },
    desc: { type: String, maxLength: 141 },
    url: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true },
    drawerId: { type: mongoose.Types.ObjectId },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    status: { type: String, enum: ["inBox", "trash"] },
    isRead: { type: Boolean, default: false },
});

const Card = mongoose.model("Card", CardSchema);
export default Card;
