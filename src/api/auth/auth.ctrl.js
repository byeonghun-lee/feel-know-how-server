import Joi from "joi";
import db from "db";
import Auth from "api/auth/auth";
import * as AuthService from "api/auth/auth.service";
import { createMailAuth, checkMailAuth } from "api/mailAuth/mailAuth.service";
import { getCookieOptions } from "lib/common";

/*
POST /auth/register
{
    email: "hun08@feelknowhow.com",
    passowrd: "feelknowhow",
    nickname: "hun08",
    verificationCode: "ASD1234"
}
*/

export const register = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        nickname: Joi.string().max(10).required(),
        verificationCode: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { email, password, nickname, verificationCode } = ctx.request.body;

    try {
        const exists = await Auth.findByIdentity({ email, nickname });

        if (exists) {
            ctx.status = 409;
            return;
        }

        await checkMailAuth({
            ctx,
            email,
            code: verificationCode,
        });

        const auth = new Auth({ email, password, nickname });
        await auth.setPassword(password);
        await auth.save();
        await AuthService.JobOfInitRegister(auth);

        ctx.body = auth.serialize();

        const token = auth.generateToken();
        ctx.cookies.set("access_token", token, getCookieOptions());

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
*/

export const login = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { email, password } = ctx.request.body;

    const auth = await Auth.findByIdentity({ email });
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
    ctx.cookies.set("access_token", token, getCookieOptions());

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
    const { email, isFolica } = ctx.request.body;
    console.log("Email:", email);

    // todo
    // joi 추가
    if (!email) {
        ctx.status = 400;
        return;
    }

    try {
        await AuthService.checkExistUser({ ctx, email });
        await createMailAuth({ ctx, email, isFolica });
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
