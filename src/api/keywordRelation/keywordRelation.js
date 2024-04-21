import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const KeywordRelationSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    keyword: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Keyword",
    },
    blogList: { type: [String] },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    // customScrapingTime: { type: String }, // 개별 스크래핑 시간
    uuid: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false },
});

KeywordRelationSchema.index({ useId: 1, keyword: 1 }, { unique: true });

KeywordRelationSchema.virtual("log", {
    ref: "KeywordScrapingLog",
    localField: "_id",
    foreignField: "keywordRelation",
});

const KeywordRelation = mongoose.model(
    "KeywordRelation",
    KeywordRelationSchema
);

export default KeywordRelation;
