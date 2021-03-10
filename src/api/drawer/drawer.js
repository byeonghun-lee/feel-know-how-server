import { boolean } from "joi";
import mongoose, { Schema } from "mongoose";

const DrawerSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    public: { type: Boolean, default: false },
    originDrawerId: { type: String },
    hasOrigin: { type: Boolean, default: false },
    readCardList: [{ cardId: { type: String }, read: { type: Boolean } }],
    toBeDeleted: { type: Boolean },
    dateToBeDeleted: { type: Date },
});

const Drawer = mongoose.model("Drawer", DrawerSchema);
export default Drawer;
