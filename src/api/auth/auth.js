import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";
import Joi from "joi";

const saltRounds = 10;

const AuthScema = new Schema({
    email: { type: String },
    phoneNumber: { type: String },
    hasdedPassword: { type: String },
});

AuthScema.methods.setPassword = async function (password) {
    const hash = await bcrypt.hash(password, saltRounds);

    this.hasdedPassword = hash;
};

AuthScema.methods.checkPassword = async function (password) {
    const result = await bcrypt.compare(password, this.hasdedPassword);

    return result;
};

AuthScema.methods.serialize = function () {
    const data = this.toJSON();
    delete data.hasdedPassword;
    return data;
};

AuthScema.methods.generateToken = function () {
    const token = jwt.sign(
        {
            _id: this.email || this.phoneNumber,
        },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return token;
};

AuthScema.statics.findByIdentity = async function (id) {
    const emailSchema = Joi.string().email();
    const checkEmail = emailSchema.validate(id);

    const query = {
        ...(checkEmail.error ? { phoneNumber: id } : { email: id }),
    };

    return await this.findOne(query);
};

const Auth = mongoose.model("Auth", AuthScema);
export default Auth;
