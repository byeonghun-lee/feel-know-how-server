import mongoose, { Schema } from "mongoose";

const mailAuthSchema = new Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    expireAt: { type: Date },
});

mailAuthSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const MailAuth = mongoose.model("MailAuth", mailAuthSchema);
export default MailAuth;
