import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const FollowRelationSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    snsName: { type: String, enum: ["instagram", "youtube"] },
    followId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "SnsProfile",
    },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    updatedAt: { type: Date, default: () => dayjs().toDate() },
    lastViewedDate: { type: Date, default: () => dayjs().toDate() },
});

const FollowRelation = mongoose.model("FollowRelation", FollowRelationSchema);
export default FollowRelation;
