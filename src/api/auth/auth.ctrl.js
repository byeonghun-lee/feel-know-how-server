import Joi from "joi";
import db from "db";
import Auth from "api/auth/auth";
import * as AuthService from "api/auth/auth.service";
import { createMailAuth, checkMailAuth } from "api/mailAuth/mailAuth.service";

/*
POST /auth/register
{
    email: "hun08@feelknowhow.com",
    passowrd: "feelknowhow"
}

or {
    phoneNumber: "01099633421",
    password: "feelknowhow"
}
*/

export const register = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        email: Joi.string(),
        phoneNumber: Joi.string(),
        password: Joi.string().required(),
        nickname: Joi.string().max(10).required(),
    }).or("email", "phoneNumber");
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { email, phoneNumber, password, nickname } = ctx.request.body;

    try {
        const exists = await Auth.findByIdentity(email || phoneNumber);

        if (exists) {
            ctx.status = 409;
            return;
        }

        const auth = new Auth({ email, phoneNumber, password, nickname });
        await auth.setPassword(password);
        await auth.save();
        await AuthService.JobOfInitRegister(auth);

        ctx.body = auth.serialize();

        const token = auth.generateToken();
        ctx.cookies.set("access_token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
        });

        return;
    } catch (error) {
        console.log("Register Error:", error);
        ctx.throw(500, e);
    }
};

/*
POST /auth/login
{
    email: "hun08@feelknowhow.com",
    passowrd: "feelknowhow"
}

or {
    phoneNumber: "01099633421",
    password: "feelknowhow"
}
*/

export const login = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        id: Joi.string(),
        password: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { id, password } = ctx.request.body;

    const auth = await Auth.findByIdentity(id);
    if (!auth) {
        ctx.status = 401;
        return;
    }

    const valid = await auth.checkPassword(password);

    if (!valid) {
        ctx.status = 401;
        return;
    }

    ctx.body = auth.serialize();

    const token = auth.generateToken();
    ctx.cookies.set("access_token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    });

    return;
};

/*
GET /auth/check
*/

export const check = async (ctx) => {
    console.log("check");
    const { auth } = ctx.state;
    if (!auth) {
        ctx.status = 401;
        return;
    }

    ctx.body = auth;
};

/*
POST /auth/logout
*/

export const logout = async (ctx) => {
    ctx.cookies.set("access_token");
    ctx.status = 204;
};

/*
POST /auth/verify-email
*/

export const sendVerifyEmailCode = async (ctx) => {
    const { email } = ctx.request.body;
    console.log("Email:", email);

    // todo
    // joi 추가
    if (!email) {
        ctx.status = 400;
        return;
    }

    try {
        await AuthService.checkExistUser({ ctx, email });
        await createMailAuth({ ctx, email });
        ctx.status = 200;
        ctx.body = "ok";
    } catch (error) {
        console.log("sendVerifyEmailCode Error:", error);

        ctx.body = error.message;

        if (
            error.message.indexOf("Exist") >= 0 ||
            error.message.indexOf("many") >= 0
        ) {
            ctx.staus = 200;
            return;
        }

        ctx.statu = 500;
        return;
    }
};

/*
POST /auth/verification-code
*/

export const checkVerificationCode = async (ctx) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        code: Joi.string().required(),
    });

    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { email, code } = ctx.request.body;

    try {
        await checkMailAuth({ ctx, email, code });
        ctx.status = 200;
        ctx.body = "ok";
        return;
    } catch (error) {
        console.error("checkVerificationCode error:", error);

        ctx.body = error.message;

        if (error.message.indexOf("found") >= 0) {
            ctx.staus = 200;
            return;
        }
    }
};

/*
GET /auth/nickname
*/

export const checkNickname = async (ctx) => {
    const schema = Joi.object({
        value: Joi.string().required(),
    });

    const result = schema.validate(ctx.request.query);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const { value } = ctx.request.query;

    try {
        const user = await Auth.findOne({ nickname: value })
            .select("_id")
            .lean();
        ctx.status = 200;
        ctx.body = user ? "exists" : "notExists";
        return;
    } catch (error) {
        console.log("Get nickname error", error);
        ctx.body = error.message;
        ctx.status = 500;
        return;
    }
};
