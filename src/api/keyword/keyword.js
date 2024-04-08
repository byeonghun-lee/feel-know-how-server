import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const KeywordSchema = new Schema({
    name: { type: String, required: true },
    target: { type: String, required: true, enum: ["naverBlog"] },
    createdAt: { type: Date, default: () => dayjs().toDate() },
});

KeywordSchema.index({ name: 1, target: 1 }, { unique: true });

const Keyword = mongoose.model("Keyword", KeywordSchema);

export default Keyword;
