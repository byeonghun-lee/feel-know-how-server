import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const keywordScrapingLogSchema = new Schema({
    keywordRelation: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "KeywordRelation",
    },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    action: { type: String, enum: ["create", "addScrapingData"] },
    displayedList: [
        { _id: false, url: { type: String }, rank: { type: Number } },
    ],
    createdAt: { type: Date, default: () => dayjs().toDate() },
});

const KeywordScrapingLog = mongoose.model(
    "KeywordScrapingLog",
    keywordScrapingLogSchema
);

export default KeywordScrapingLog;
