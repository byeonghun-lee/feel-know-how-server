import MailAuth from "api/mailAuth/mailAuth";
import { makeRandomId } from "lib/common";
import db from "db";

export const createMailAuth = async ({ ctx, email }) => {
    if (!email) {
        throw new Error("Email is required.");
    }

    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const verifyCode = makeRandomId(7);

    try {
        await MailAuth.updateOne(
            {
                email,
            },
            { email, code: verifyCode, expireAt: Day().add(3, "m") },
            { upsert: true }
        );
    } catch (error) {
        throw new Error(error);
    }
};
