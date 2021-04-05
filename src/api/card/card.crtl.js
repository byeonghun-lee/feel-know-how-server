import Joi from "joi";
import Card from "api/card/card";
import db from "db";
import axios from "axios";

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
        title: Joi.string().required(),
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
GET /cards?nickname=hun&drawerName=asldjal
*/

export const getCards = async (ctx) => {
    const { nickname, drawerName } = ctx.request.query;

    try {
        const user = await Auth.findOne({ nickname }).select("_id").lean();
        const drawer = await Drawer.findOne({
            userId: user._id,
            name: drawerName,
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

        if (!drawer.allPublic && ctx.state.auth.userId !== drawer.userId) {
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
            cardList,
        };
    } catch (error) {
        console.log("Get cards error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};
