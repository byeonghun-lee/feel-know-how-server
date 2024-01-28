import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const FollowRelationSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    followId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "SnsProfile",
    },
    groupIdList: [{ type: mongoose.Types.ObjectId, ref: "Group" }],
    createdAt: { type: Date, default: () => dayjs().toDate() },
    updatedAt: { type: Date, default: () => dayjs().toDate() },
    lastViewedDate: { type: Date, default: () => dayjs().toDate() },
});

const FollowRelation = mongoose.model("FollowRelation", FollowRelationSchema);
export default FollowRelation;
