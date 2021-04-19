import MailAuth from "api/mailAuth/mailAuth";
import { makeRandomId } from "lib/common";
import db from "db";
import { sendEmail } from "aws/ses.service";

export const createMailAuth = async ({ ctx, email }) => {
    if (!email) {
        throw new Error("Email is required.");
    }

    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const mailAuth = await MailAuth.findOne({ email })
        .select("expireAt")
        .lean();

    if (mailAuth && Day().diff(Day(mailAuth.expireAt), "s") < 30) {
        throw new Error("Too many request.");
    }

    const verifyCode = makeRandomId(7);

    try {
        await MailAuth.updateOne(
            {
                email,
            },
            { email, code: verifyCode, expireAt: Day().add(10, "m") },
            { upsert: true }
        );

        await sendEmail({
            toAddress: email,
            subject: "ohMyDrawer verification code.",
            message: `Your verification code is ${verifyCode}`,
        });
        return;
    } catch (error) {
        throw new Error(error);
    }
};

export const checkMailAuth = async ({ ctx, email, code }) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    if (!code) {
        throw new Error("Code is required.");
    }

    const mailAuth = await MailAuth.findOne({ email, code }).lean();

    if (mailAuth) {
        return { email };
    } else {
        throw new Error("Not found.");
    }
};
