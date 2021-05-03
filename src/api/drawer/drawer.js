import mongoose, { Schema } from "mongoose";

const DrawerSchema = new Schema({
    name: { type: String, required: true, maxlength: 15 },
    desc: { type: String, maxLength: 141 },
    userId: { type: mongoose.Types.ObjectId, required: true },
    allPublic: { type: Boolean, default: false },
    originDrawerId: { type: mongoose.Types.ObjectId },
    hasOrigin: { type: Boolean, default: false },
    readCardList: [{ cardId: { type: String }, read: { type: Boolean } }],
    toBeDeleted: { type: Boolean },
    dateToBeDeleted: { type: Date },
    createdAt: { type: Date, default: new Date() },
    contributors: [{ type: mongoose.Types.ObjectId }],
    tags: [{ type: String, maxlength: 6 }],
    forkList: [{ type: mongoose.Types.ObjectId }],
    likeList: [{ type: mongoose.Types.ObjectId }],
    history: [
        {
            userId: { type: String },
            message: { type: String },
            action: {
                type: String,
                enum: ["read", "add", "update", "remove", "addContributors"],
            },
        },
    ],
    views: [
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
    // 날짜별로 sort하고 싶은데...
    // yearMonth를 키 값으로 해야하나?

    const result = { totalCount: 0, list: [] };
    result.totalCount = await this.countDocuments(query);
    const list = await this.find()
        .select(["name", "desc", "forkList", "likeList"])
        .limit(30)
        .skip(skip)
        .lean();
    result.list = list.map((drawer) => ({
        name: drawer.name,
        desc: drawer.desc,
        forkCounts: drawer.forkList ? drawer.forkList.length : 0,
        likeCounts: drawer.likeList ? drawer.likeList.length : 0,
    }));

    return result;
};

const Drawer = mongoose.model("Drawer", DrawerSchema);
export default Drawer;
