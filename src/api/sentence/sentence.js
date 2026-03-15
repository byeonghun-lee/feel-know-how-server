import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const SentenceSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    text: { type: String, required: true },
    author: { type: String, default: "" },
    book: { type: String, default: "" },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    syncedAt: { type: Date, default: () => dayjs().toDate() },
});

SentenceSchema.index({ userId: 1, text: 1 }, { unique: true });

const Sentence = mongoose.model("Sentence", SentenceSchema);
export default Sentence;
