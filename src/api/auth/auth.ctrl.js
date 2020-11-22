import Joi from "joi";
import Auth from "./auth";
import db from "db";

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
    }).or("email", "phoneNumber");
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { email, phoneNumber, password } = ctx.request.body;

    try {
        const exists = await Auth.findByIdentity(email || phoneNumber);

        if (exists) {
            ctx.status = 409;
            return;
        }

        const auth = new Auth({ email, phoneNumber, password });
        await auth.setPassword(password);
        await auth.save();

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

export const logout = async ctx => {
    ctx.cookies.set("access_token");
    ctx.status = 204;
};