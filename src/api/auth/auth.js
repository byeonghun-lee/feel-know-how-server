import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import Joi from "joi";

const saltRounds = 10;

const AuthSchema = new Schema({
    email: { type: String },
    phoneNumber: { type: String },
    nickname: { type: String },
    hasdedPassword: { type: String },
    createdAt: { type: Date, default: new Date() },
});

AuthSchema.methods.setPassword = async function (password) {
    const hash = await bcrypt.hash(password, saltRounds);

    this.hasdedPassword = hash;
};

AuthSchema.methods.checkPassword = async function (password) {
    const result = await bcrypt.compare(password, this.hasdedPassword);

    return result;
};

AuthSchema.methods.serialize = function () {
    const data = this.toJSON();
    delete data.hasdedPassword;
    return data;
};

AuthSchema.methods.generateToken = function () {
    const token = jwt.sign(
        {
            userId: this._id,
            id: this.email || this.phoneNumber,
            nickname: this.nickname,
        },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return token;
};

AuthSchema.statics.findByIdentity = async function (id) {
    const emailSchema = Joi.string().email();
    const checkEmail = emailSchema.validate(id);

    const query = {
        ...(checkEmail.error ? { phoneNumber: id } : { email: id }),
    };

    return await this.findOne(query);
};

const Auth = mongoose.model("Auth", AuthSchema);
export default Auth;
