import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

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

AuthScema.statics.findByIdentity = async function ({ email, phoneNumber }) {
    const query = {};

    if (email) {
        query.email = email;
    } else {
        query.phoneNumber = phoneNumber;
    }

    return await this.findOne(query).lean();
};

const Auth = mongoose.model("Auth", AuthScema);
export default Auth;
