import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const ReadingListSchema = new Schema({
    cardId: { type: mongoose.Types.ObjectId, required: true, ref: "Card" },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    isExpired: { type: Boolean, default: false },
});

const ReadingList = mongoose.model("ReadingList", ReadingListSchema);
export default ReadingList;
