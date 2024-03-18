import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const SearchHistorySchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    keyword: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: () => dayjs().toDate() },
    createdAt: { type: Date, default: () => dayjs().toDate() },
});

const SearchHistory = mongoose.model("SearchHistory", SearchHistorySchema);
export default SearchHistory;
