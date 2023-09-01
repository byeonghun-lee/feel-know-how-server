import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const DrawerSchema = new Schema({
    name: { type: String, required: true, maxlength: 15 },
    uniqueNameForUser: { type: String, required: true },
    desc: { type: String, maxLength: 141 },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "Auth" },
    allPublic: { type: Boolean, default: false },
    originDrawerId: { type: mongoose.Types.ObjectId },
    hasOrigin: { type: Boolean, default: false },
    toBeDeleted: { type: Boolean },
    dateToBeDeleted: { type: Date },
    createdAt: { type: Date, default: () => dayjs().toDate() },
    updatedAt: { type: Date, default: () => dayjs().toDate() },
    contributors: [{ type: mongoose.Types.ObjectId }],
    tags: [{ type: String, maxlength: 6 }],
    forkList: [{ type: mongoose.Types.ObjectId }],
    likeList: [{ type: mongoose.Types.ObjectId }],
    history: [
        {
            userId: { type: mongoose.Types.ObjectId },
            message: { type: String },
            target: { type: String, enum: ["drawer", "card", "contributors"] },
            targetId: { type: mongoose.Types.ObjectId },
            action: {
                type: String,
                enum: ["read", "create", "update", "delete"],
            },
        },
    ],
    totalViews: { type: Number, default: 0 },
    halfMonthViews: { type: Number, default: 0 },
    viewsHistory: [
        {
            yearMonth: { type: String }, // 202101
            firstHalfMonth: { type: Number, default: 0 },
            secondHalfMonth: { type: Number, default: 0 },
        },
    ],
});

DrawerSchema.pre("save", function (next) {
    const _name = this.name.replace(/\s/g, "");
    this.name = _name.charAt(0).toUpperCase() + _name.slice(1, _name.length);

    next();
});

DrawerSchema.statics.findPublicDrawers = async function ({ skip }) {
    const query = {
        allPublic: true,
    };

    // todo
    // 어느정도 view가 쌓이면 totalViews에서 halfMonthViews로 변경

    const result = { totalCount: 0, list: [] };
    result.totalCount = await this.countDocuments(query);
    const list = await this.find(query)
        .select([
            "_id",
            "name",
            "desc",
            "forkList",
            "likeList",
            "userId",
            "uniqueNameForUser",
        ])
        .populate({
            path: "userId",
            selct: "nickname",
        })
        .limit(30)
        .skip(skip)
        .sort({ totalViews: -1, updatedAt: -1, createdAt: -1 })
        .lean();

    result.list = list.map((drawer) => ({
        id: drawer._id,
        name: drawer.name,
        desc: drawer.desc,
        userNickname: drawer.userId.nickname,
        link: `/@${drawer.userId.nickname}/${drawer.uniqueNameForUser}`,
        forkCounts: drawer.forkList ? drawer.forkList.length : 0,
        likeCounts: drawer.likeList ? drawer.likeList.length : 0,
    }));

    return result;
};

const Drawer = mongoose.model("Drawer", DrawerSchema);
export default Drawer;
