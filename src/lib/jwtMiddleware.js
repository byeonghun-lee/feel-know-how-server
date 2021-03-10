import jwt from "jsonwebtoken";
import config from "config";
import db from "db";
import Auth from "api/auth/auth";

const jwtMiddleware = async (ctx, next) => {
    const token = ctx.cookies.get("access_token");

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        console.log("decoded",decoded);
        ctx.state.auth = {
            _id: decoded._id,
            nickname: decoded.nickname
        };

        const now = Math.floor(Date.now() / 1000);
        if(decoded.exp - now < 60 *60*24*3.5) {
            ctx.callbackWaitsForEmptyEventLoop = false;
            await db.connect();

            const auth = await Auth.findByIdentity(decoded._id);
            const token = auth.generateToken();

            ctx.cookies.set("access_toekn", token, {
                maxAge: 1000 *60*60*24*7,
                httpOnly: true
            })
        }
        console.log("test");
        return next();
    } catch (e) {
        return next();
    }
};

export default jwtMiddleware;
