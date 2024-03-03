import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const GroupRelationSchema = new Schema({
    followRelationId: { type: mongoose.Types.ObjectId, ref: "FollowRelation" },
    groupId: { type: mongoose.Types.ObjectId, ref: "Group" },
    createdAt: { type: Date, default: () => dayjs().toDate() },
});

const GroupRelation = mongoose.model("GroupRelation", GroupRelationSchema);
export default GroupRelation;
