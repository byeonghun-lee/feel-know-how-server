import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import Keyword from "api/keyword/keyword";
import KeywordRelation from "api/keywordRelation/keywordRelation";
import KeywordScrapingLog from "api/keywordScrapingLog/keywordScrapingLog";
import DailyKeywordScraping from "api/dailyKeywordScraping/dailyKeywordScraping";
import db from "db";
import mongoose from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

/*
POST /keywords
{
    keyword: ""
}
*/
export const create = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        keyword: Joi.string(),
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const userId = ctx.state.auth.userId;
    const { keyword } = ctx.request.body;
    const target = "naverBlog";
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const savedKeyword = await Keyword.findOneAndUpdate(
                {
                    name: keyword,
                    target,
                },
                { name: keyword, target },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            ).session(session);
            console.log("savedKeyword:", savedKeyword);

            const keywordRelation = await KeywordRelation.findOneAndUpdate(
                {
                    userId,
                    keyword: savedKeyword._id,
                    isDeleted: false,
                },
                { userId, keyword: savedKeyword, uuid: uuidv4() },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            ).session(session);

            await KeywordScrapingLog.create(
                [
                    {
                        keywordRelation: keywordRelation._id,
                        userId,
                        action: "create",
                    },
                ],
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
            _id: relationItem._id,
            name: relationItem.keyword.name,
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
