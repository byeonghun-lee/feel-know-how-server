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
        title: Joi.string().allow("", null),
        desc: Joi.string().max(140).allow("", null),
        url: Joi.string().required(),
        drawerId: Joi.string().allow("", null),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error.message;
        return;
    }

    const { title, desc, url, drawerId } = ctx.request.body;

    try {
        const card = await Card.create({
            title,
            desc,
            url,
            drawerId,
            userId: ctx.state.auth.userId,
            ...(!drawerId && { status: "inBox" }),
        });

        if (drawerId) {
            await Drawer.updateOne(
                { _id: drawerId },
                {
                    $push: {
                        history: {
                            userId: ctx.state.auth.userId,
                            target: "card",
                            targetId: card._id,
                            action: "create",
                        },
                    },
                }
            );
        }

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
        const isOwner =
            ctx.state.auth &&
            ctx.state.auth.userId.toString() === drawer.userId.toString();

        if (!drawer.allPublic && !isOwner) {
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
            isOwner: !!isOwner,
            allPublic: drawer.allPublic,
            cardList,
        };
    } catch (error) {
        console.log("Get cards error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
PATCH /cards/:cardId/read-status
*/
export const updateReadStatus = async (ctx) => {
    const { cardId } = ctx.request.params;
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    try {
        const card = await Card.findOne({
            _id: cardId,
            userId: ctx.state.auth.userId,
        });
        if (!card) {
            ctx.status = 401;
            return;
        }

        card.isRead = !card.isRead;
        await card.save();

        if (card.drawerId) {
            await Drawer.updateOne(
                { _id: card.drawerId },
                {
                    $push: {
                        history: {
                            userId: ctx.state.auth.userId,
                            message: card.isRead ? "read" : "unRead",
                            target: "card",
                            targetId: card._id,
                            action: "update",
                        },
                    },
                }
            );
        }

        ctx.status = 200;
        ctx.body = {
            _id: card._id,
            isRead: card.isRead,
        };
        return;
    } catch (error) {
        console.log("UpdateReadStatus Error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};
