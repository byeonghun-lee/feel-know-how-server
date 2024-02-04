import Joi from "joi";
import db from "db";
import config from "config";
import SnsAccount from "api/snsAccount/snsAccount";
import Auth from "api/auth/auth";
import { sendEmail } from "aws/ses.service";

/*
POST /sns-accounts
{
    instagramPath: "",
    youtubePath: ""
}
*/
export const upsert = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        instagramPath: Joi.string(),
        youtubePath: Joi.string(),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { userId, id } = ctx.state.auth;
    const { instagramPath, youtubePath } = ctx.request.body;
    let resultBody;

    const vanillaPath = {
        instagram: null,
        youtube: null,
    };

    if (instagramPath) {
        let instagramUrl = instagramPath;
        console.log("instagramPath:", instagramPath);

        if (instagramPath.indexOf("instagram.com") >= 0) {
            const match = instagramPath.match(
                /https:\/\/(www\.)?instagram\.com\/([^/?]+)/
            );

            if (match?.length > 2) {
                instagramUrl = match[2];
            }
        }

        vanillaPath.instagram = instagramUrl;
    }
    if (youtubePath) {
        let youtubeUrl = youtubePath;
        console.log("youtubePath:", youtubePath);

        if (youtubePath.indexOf("youtube.com") >= 0) {
            const match = youtubePath.match(/\/([a-zA-Z0-9_]+)$/);

            if (match?.length > 1) {
                youtubeUrl = match[1];
            }
        }

        vanillaPath.youtube = youtubeUrl;
    }

    console.log("vanillaPath:", vanillaPath);

    try {
        const snsAccount = await SnsAccount.findOne({ userId });

        if (snsAccount) {
            if (instagram) {
                snsAccount.instagram.path = vanillaPath.instagram;
            }
            if (youtube) {
                snsAccount.youtube.path = vanillaPath.youtube;
            }

            resultBody = await snsAccount.save();
        } else {
            resultBody = await SnsAccount.create({
                userId,
                ...(instagramPath && {
                    instagram: {
                        path: vanillaPath.instagram,
                        status: "request",
                    },
                }),
                ...(youtubePath && {
                    youtube: { path: vanillaPath.youtube, status: "request" },
                }),
            });

            const message = [`유저 이메일: ${id}`];

            if (vanillaPath.instagram) {
                message.push(`인스타그램: ${vanillaPath.instagram || "-"}`);
            }
            if (vanillaPath.youtube) {
                message.push(`유튜브: ${vanillaPath.youtube || "-"}`);
            }

            await sendEmail({
                toAddress: config.ADMIN_EMAIL,
                subject: "새로운 등록 요청이 들어왔음.",
                message: message.join("\n"),
            });
        }

        ctx.status = 200;
        ctx.body = resultBody;
        return;
    } catch (error) {
        console.log(`Upsert sns account error: ${error}`);
        return ctx.throw(500, error);
    }
};
