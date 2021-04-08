import Joi from "joi";
import Card from "api/card/card";
import Drawer from "api/drawer/drawer";
import Auth from "api/auth/auth";
import db from "db";

/*
POST /cards
{
    title: "기술뉴스",
    desc: "21년3월 개발 뉴스 - 볼만한 링크 보기"
    url: "https://blog.outsider.ne.kr/1536",
    drawerId: ""
}
*/

export const createCard = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        title: Joi.string(),
        desc: Joi.string().max(140),
        url: Joi.string().required(),
        drawerId: Joi.string(),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { title, desc, url, drawerId } = ctx.request.body;

    try {
        await Card.create({
            title,
            desc,
            url,
            drawerId,
            userId: ctx.state.auth.userId,
            ...(!drawerId && { status: "inBox" }),
        });

        ctx.status = 200;
        return;
    } catch (error) {
        console.log("Create Card Error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
GET /cards?nickname=hun&drawername=asldjal
*/

export const getCards = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        nickname: Joi.string().required(),
        drawername: Joi.string().required(),
    });

    const result = schema.validate(ctx.request.query);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { nickname, drawername } = ctx.request.query;

    try {
        const user = await Auth.findOne({ nickname }).select("_id").lean();

        const drawer = await Drawer.findOne({
            userId: user._id,
            name: drawername,
        })
            .select([
                "_id",
                "name",
                "userId",
                "desc",
                "allPublic",
                "contributors",
                "tags",
                "likeList",
            ])
            .lean();

        if (!drawer) {
            ctx.status = 404;
            return;
        }

        if (
            !drawer.allPublic &&
            ctx.state.auth.userId.toString() !== drawer.userId.toString()
        ) {
            ctx.status = 403;
            return;
        }

        const cardList = await Card.find({
            drawerId: drawer._id,
        }).lean();

        ctx.status = 200;
        ctx.body = {
            drawerName: drawer.name,
            drawerDesc: drawer.desc,
            tagList: drawer.tags,
            cardList,
        };
    } catch (error) {
        console.log("Get cards error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};
