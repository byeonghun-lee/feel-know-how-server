import jwt from "jsonwebtoken";
import config from "config";
import db from "db";
import Auth from "api/auth/auth";
import { getCookieOptions } from "lib/common";

const jwtMiddleware = async (ctx, next) => {
    const token = ctx.cookies.get("access_token");
    console.log("TOKEN:", token);

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        console.log("decoded", decoded);
        ctx.state.auth = {
            userId: decoded.userId,
            id: decoded.id,
            nickname: decoded.nickname,
        };

        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
            ctx.callbackWaitsForEmptyEventLoop = false;
            await db.connect();

            const auth = await Auth.findByIdentity({ email: decoded._id });
            const token = auth.generateToken();

            const cookieOptions = getCookieOptions();
            console.log("cookieOptions:", cookieOptions);

            ctx.cookies.set("access_toekn", token, cookieOptions);
        }
        return next();
    } catch (error) {
        console.log("jwtMiddleware error:", error);
        return next();
    }
};

export default jwtMiddleware;
