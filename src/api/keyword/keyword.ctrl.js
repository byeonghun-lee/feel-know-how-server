import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import db from "db";
import Keyword from "api/keyword/keyword";
import KeywordRelation from "api/keywordRelation/keywordRelation";
import KeywordScrapingLog from "api/keywordScrapingLog/keywordScrapingLog";
import DailyKeywordScraping from "api/dailyKeywordScraping/dailyKeywordScraping";

dayjs.locale("ko");

/*
POST /keywords
{
    keywords: [{
        keyword: "",
        blogList: [""]
    }]
}
*/
export const create = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        keywords: Joi.array().items(
            Joi.object({
                keyword: Joi.string().required(),
                blogList: Joi.array().items(Joi.string().uri()),
            })
        ),
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        console.log("error:");
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const userId = ctx.state.auth.userId;
    const { keywords } = ctx.request.body;
    const target = "naverBlog";
    const session = await mongoose.startSession();
    console.log("keywords:", JSON.stringify(keywords));

    try {
        await session.withTransaction(async () => {
            await Keyword.bulkWrite(
                keywords.map((item) => ({
                    updateOne: {
                        filter: {
                            name: item.keyword,
                            target,
                        },
                        update: {
                            name: item.keyword,
                            target,
                        },
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true,
                    },
                })),
                { session }
            );

            const savedKeywordList = await Keyword.find({
                name: { $in: keywords.map((item) => item.keyword) },
                target,
            })
                .session(session)
                .select(["_id", "name"]);
            console.log("savedKeywordList:", savedKeywordList);

            const existedRelationList = await KeywordRelation.find({
                userId,
                keyword: { $in: savedKeywordList.map((item) => item._id) },
                isDeleted: false,
            })
                .select("_id")
                .lean();

            const keywordListToAdded = savedKeywordList.filter(
                (keywordItem) =>
                    !existedRelationList.find(
                        (existedItem) =>
                            existedItem._id.toString() ===
                            keywordItem._id.toString()
                    )
            );
            console.log("keywordListToAdded:", keywordListToAdded);

            const newCreatedKeywordRelations = await KeywordRelation.create(
                keywordListToAdded.map((keyword) => ({
                    userId,
                    keyword: keyword._id,
                    blogList: keywords.find(
                        (item) => item.keyword === keyword.name
                    )?.blogList,
                    uuid: uuidv4(),
                })),
                { session }
            );

            console.log(
                "newCreatedKeywordRelations:",
                newCreatedKeywordRelations
            );

            await KeywordScrapingLog.create(
                newCreatedKeywordRelations.map((relation) => ({
                    keywordRelation: relation._id,
                    userId,
                    action: "create",
                })),
                { session }
            );
        });

        ctx.status = 200;
    } catch (error) {
        console.log("Create keyword error:", error);
        ctx.status = 500;
        ctx.body = error;
    } finally {
        await session.endSession();
        console.log("endSession");
    }
};

/*
GET /keywords
*/
export const getList = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const userId = ctx.state.auth.userId;
    const result = { totalCount: 0, list: [] };

    try {
        // todo
        // keywordRelation에 target이 없기 때문에 나중에 다른 타겟이 추가될 경우 aggregate로 변경해야할 거 같음

        // log와 블로그 리스트 추가해야함
        const keywordRelationList = await KeywordRelation.find({
            userId,
            isDeleted: false,
        })
            .slice("blogList", 3)
            .populate({ path: "keyword", select: ["name"] })
            .populate({
                path: "log",
                perDocumentLimit: 3,
                options: { sort: { _id: -1 } },
            })
            .sort({ _id: -1 })
            .lean();

        console.log(
            "keywordRelationList:",
            JSON.stringify(keywordRelationList)
        );

        // todo
        // keywordRealtion Count doc만들어서 관리하기

        result.totalCount = keywordRelationList.length;
        result.list = keywordRelationList.map((relationItem) => ({
            uuid: relationItem.uuid,
            name: relationItem.keyword.name,
            blogList: relationItem.blogList,
            logList: relationItem.log.map((log) => ({
                action: log.action,
                createdAt: log.createdAt,
            })),
        }));

        ctx.status = 200;
        ctx.body = result;
        return;
        [];
    } catch (error) {
        console.log("Get keyword list error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
GET /keywords/relations/:uuid/image
*/
export const getScrapingDetailImage = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const { uuid } = ctx.request.params;
    const { date } = ctx.request.query;

    console.log("uuid:", uuid);
    console.log("date:", date);

    const result = {};

    try {
        if (!uuid || !date) {
            throw new Error("Missing required params.");
        }

        const keywordRelation = await KeywordRelation.findOne({
            uuid,
            isDeleted: false,
        })
            .select(["keyword", "blogList"])
            .populate({ path: "keyword", select: ["name"] })
            .lean();

        if (!keywordRelation) {
            throw new Error("Not found keyword relations.");
        }

        const scrapingData = await DailyKeywordScraping.findOne({
            keyword: keywordRelation.keyword._id,
            createdAt: {
                $gte: dayjs(date).startOf("days").toDate(),
                $lt: dayjs(date).add(1, "days").startOf("days").toDate(),
            },
        }).lean();

        if (!scrapingData) {
            throw new Error("Not found scraping data.");
        }

        result.keyword = keywordRelation.keyword.name;
        result.screenshotUrl = scrapingData.screenShotUrl;

        if (keywordRelation.blogList?.length) {
            result.blogList = keywordRelation.blogList.map((blogUrl) => {
                const rank = scrapingData.textContent.findIndex(
                    (searchedBlog) =>
                        searchedBlog.userBlogUrl === blogUrl ||
                        searchedBlog.userBlogContentUrl === blogUrl
                );

                return {
                    url: blogUrl,
                    rank: rank >= 0 ? rank : null,
                    elementPosition: scrapingData.textContent[rank].element,
                };
            });
        }

        console.log("result:", result);
        ctx.status = 200;
        ctx.body = result;
        return;
    } catch (error) {
        console.log("Get scraping detail image error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};
