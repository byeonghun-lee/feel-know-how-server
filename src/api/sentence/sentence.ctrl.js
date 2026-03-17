import Joi from "joi";
import dayjs from "dayjs";
import mongoose from "mongoose";
import axios from "axios";
import db from "db";
import config from "config";
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
GET /sentences/books?title=검색어
*/

export const books = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;

    const schema = Joi.object({
        title: Joi.string().required(),
    });

    const result = schema.validate(ctx.query);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { title } = result.value;

    try {
        const response = await axios.get(
            "https://www.googleapis.com/books/v1/volumes",
            {
                params: {
                    q: `intitle:${title}`,
                    key: config.GOOGLE_BOOK_API_KEY,
                },
            },
        );

        const items = response.data.items || [];

        ctx.status = 200;
        ctx.body = items.map((item) => {
            const info = item.volumeInfo || {};
            return {
                title: info.title || "",
                authors: info.authors || [],
                thumbnail: info.imageLinks?.thumbnail || "",
                publishedDate: info.publishedDate || "",
            };
        });
    } catch (error) {
        console.error("Books search error:", error);
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

/*
PATCH /sentences/:id
{
    text: "수정된 문장",
    author: "지은이",
    book: "책 제목"
}
*/

export const update = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        text: Joi.string(),
        author: Joi.string().allow(""),
        book: Joi.string().allow(""),
    }).min(1);

    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { userId } = ctx.state.auth;
    const { id } = ctx.params;

    try {
        const sentence = await Sentence.findOneAndUpdate(
            { _id: id, userId },
            { $set: result.value },
            { new: true },
        );

        if (!sentence) {
            ctx.status = 404;
            return;
        }

        ctx.status = 200;
        ctx.body = sentence;
    } catch (error) {
        console.error("Sentence update error:", error);
        ctx.throw(500, error);
    }
};
