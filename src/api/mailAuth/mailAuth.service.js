import MailAuth from "api/mailAuth/mailAuth";
import { makeRandomId } from "lib/common";
import db from "db";
import { sendEmail } from "aws/ses.service";

export const createMailAuth = async ({ ctx, email, isFolica = false }) => {
    if (!email) {
        throw new Error("Email is required.");
    }

    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const mailAuth = await MailAuth.findOne({ email })
        .select("expireAt")
        .lean();

    if (mailAuth && Day(mailAuth.expireAt).diff(Day(), "m") > 8) {
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

            subject: `${isFolica ? "Folica" : "Purrgil Pin"} 인증 코드 입니다.`,
            message: [
                `안녕하세요. ${
                    isFolica ? "Folica" : "Purrgil Pin"
                } 인증 코드 안내 메일 입니다.`,
                "",
                "아래 인증 코드를 복사해서 회원 가입 페이지 [인증 코드]란에 붙여 넣어주세요.",
                "감사합니다",
                "",
                "",
                `인증 코드: ${verifyCode}`,
            ].join("\n"),
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
