import mongoose, { Schema } from "mongoose";

const DrawerSchema = new Schema({
    name: { type: String, required: true, maxlength: 15 },
    desc: { type: String, maxLength: 140 },
    userId: { type: mongoose.Types.ObjectId, required: true },
    allPublic: { type: Boolean, default: false },
    originDrawerId: { type: mongoose.Types.ObjectId },
    hasOrigin: { type: Boolean, default: false },
    readCardList: [{ cardId: { type: String }, read: { type: Boolean } }],
    toBeDeleted: { type: Boolean },
    dateToBeDeleted: { type: Date },
    createdAt: { type: Date, default: new Date() },
    contributors: [{ type: mongoose.Types.ObjectId }],
    tags: [{ type: String }],
    forkCount: { type: Number },
    likeCount: { type: Number },
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
});

DrawerSchema.pre("save", function (next) {
    const _name = this.name.replace(/\s/g, "");
    this.name = _name.charAt(0).toUpperCase() + _name.slice(1, _name.length);

    next();
});

const Drawer = mongoose.model("Drawer", DrawerSchema);
export default Drawer;
