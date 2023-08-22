import Joi from "joi";
import db from "db";
import ReadingList from "api/readingList/readingList";
import Card from "api/card/card";

/*
GET /reading-lists
*/
export const getList = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const userId = ctx.state.auth.userId;

    try {
        await ReadingList.updateMany(
            { userId, createdAt: Day().subtract(2, "day") },
            { isExpired: true }
        );

        const list = await ReadingList.find({ userId })
            .populate("cardId")
            .sort({ createdAt: -1 })
            .lean();

        ctx.status = 200;
        ctx.body = list;
        return;
    } catch (error) {
        console.log("Get reading list error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
POST /reading-lists
*/
export const addReadingList = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        cardId: Joi.string().required(),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { cardId } = ctx.request.body;
    const userId = ctx.state.auth.userId;

    try {
        const checkIsMine = await Card.findOne({ _id: cardId, userId })
            .select("_id")
            .lean();

        if (!checkIsMine) {
            throw new Error("Card is not mine.");
        }

        const isExisted = await ReadingList.findOne({
            cardId,
            userId,
            isExpired: false,
        })
            .select("_id")
            .lean();

        if (isExisted) {
            throw new Error("Already exist in reading list.");
        }

        await ReadingList.create({
            cardId,
            userId,
        });

        ctx.status = 200;
        return;
    } catch (error) {
        console.log("Add Reading List error:", error);
    }
};
