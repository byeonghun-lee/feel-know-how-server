import Joi from "joi";
import dayjs from "dayjs";
import mongoose from "mongoose";
import db from "db";
import Sentence from "api/sentence/sentence";

/*
POST /sentences/sync
{
    sentences: [
        {
            localId: "클라이언트 로컬 ID",
            text: "문장 내용",
            author: "지은이",
            book: "책 제목",
            createdAt: "2026-03-10T12:00:00Z"
        }
    ]
}
응답: [{ localId, id }]
*/

export const sync = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        sentences: Joi.array()
            .items(
                Joi.object({
                    localId: Joi.string().required(),
                    text: Joi.string().required(),
                    author: Joi.string().allow("").default(""),
                    book: Joi.string().allow("").default(""),
                    createdAt: Joi.date().default(() => dayjs().toDate()),
                }),
            )
            .min(1)
            .required(),
    });

    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { userId } = ctx.state.auth;
    const { sentences } = result.value;
    const now = dayjs().toDate();

    const docs = sentences.map((s) => ({
        _id: new mongoose.Types.ObjectId(),
        userId,
        text: s.text,
        author: s.author,
        book: s.book,
        createdAt: s.createdAt,
        syncedAt: now,
    }));

    const idMap = sentences.map((s, i) => ({
        localId: s.localId,
        id: docs[i]._id,
    }));

    try {
        await Sentence.insertMany(docs, { ordered: false });

        ctx.status = 200;
        ctx.body = idMap;
    } catch (error) {
        if (error.code === 11000) {
            const insertedIds = new Set(
                (error.insertedDocs ?? []).map((d) => d._id.toString()),
            );
            ctx.status = 200;
            ctx.body = idMap.filter((m) => insertedIds.has(m.id.toString()));
            return;
        }

        console.error("Sentence sync error:", error);
        ctx.throw(500, error);
    }
};

/*
GET /sentences
*/

export const list = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const { userId } = ctx.state.auth;

    try {
        const sentences = await Sentence.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        ctx.status = 200;
        ctx.body = sentences;
    } catch (error) {
        console.error("Sentence list error:", error);
        ctx.throw(500, error);
    }
};

/*
DELETE /sentences/:id
*/

export const remove = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const { userId } = ctx.state.auth;
    const { id } = ctx.params;

    try {
        const result = await Sentence.deleteOne({ _id: id, userId });

        if (result.deletedCount === 0) {
            ctx.status = 404;
            return;
        }

        ctx.status = 204;
    } catch (error) {
        console.error("Sentence remove error:", error);
        ctx.throw(500, error);
    }
};
