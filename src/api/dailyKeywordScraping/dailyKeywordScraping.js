import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const DailyKeywordScrapingSchema = new Schema({
    keyword: { type: mongoose.Types.ObjectId, required: true, ref: "Keyword" },
    screenShotUrl: { type: Boolean, required: true },
    textContent: [
        {
            _id: false,
            userBlogUrl: { type: String },
            userBlogContentUrl: { type: String },
            userBlogContentTitle: { type: String },
            userBlogContentDesc: { type: String },
            element: { type: Object },
        },
    ],
    createdAt: { type: Date, default: () => dayjs().toDate() },
});

const DailyKeywordScraping = mongoose.model(
    "DailyKeywordScraping",
    DailyKeywordScrapingSchema
);
export default DailyKeywordScraping;
