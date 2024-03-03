import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import Group from "api/group/group";
import FollowRelation from "api/followRelation/followRelation";
import GroupRelation from "api/groupRelation/groupRelation";
import db from "db";
import "dayjs/locale/ko";

dayjs.locale("ko");

/*
POST /groups
{
    name: ""
}
*/
export const create = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        name: Joi.string(),
    });

    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const userId = ctx.state.auth.userId;
    const { name } = ctx.request.body;
    try {
        const createdGroup = await Group.create({
            userId,
            name,
            uuid: uuidv4(),
        });

        ctx.status = 200;
        ctx.body = createdGroup;
        return;
    } catch (error) {
        console.log("Create group error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
GET /groups
*/
export const getList = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const userId = ctx.state.auth.userId;
    try {
        // todo
        // totalCount, limit, skip 추가 필요
        const groupList = await Group.find({ userId }).sort({ _id: -1 }).lean();

        ctx.status = 200;
        ctx.body = groupList;
        return;
    } catch (error) {
        console.log("Get group list error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
PATCH /groups/:groupId/follows
{
    followIds: []
}
*/
export const addFollows = async (ctx) => {
    const { groupId } = ctx.request.params;
    const userId = ctx.state.auth.userId;
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        followIds: Joi.array().items(Joi.string()).allow("", null),
    });

    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { followIds } = ctx.request.body;

    try {
        const group = await Group.findOne({ _id: groupId, userId })
            .select("_id")
            .lean();

        if (!group) {
            throw new Error("Not found group.");
        }

        const followRelationList = await FollowRelation.find({
            userId,
            followId: { $in: followIds },
        })
            .select("_id")
            .lean();

        await GroupRelation.bulkWrite(
            followRelationList.map((followRelationItem) => ({
                updateOne: {
                    filter: {
                        followRelationId: followRelationItem._id,
                        groupId: group._id,
                    },
                    update: {
                        followRelationId: followRelationItem._id,
                        groupId: group._id,
                        createdAt: dayjs().toDate(),
                    },
                    upsert: true,
                },
            }))
        );

        ctx.status = 200;
        return;
    } catch (error) {
        console.log("Get group list error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
GET /groups/:uuid
*/
export const getGroupItemList = async (ctx) => {
    const { uuid } = ctx.request.params;
    const userId = ctx.state.auth.userId;
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    try {
        const group = await Group.findOne({ uuid, userId }).lean();

        if (!group) {
            ctx.status = 404;
            return;
        }

        const groupItemList = await GroupRelation.find({ groupId: group._id })
            .populate({
                path: "followRelationId",
                select: ["followId", "snsName"],
                populate: {
                    path: "followId",
                    select: ["path", "name", "desc", "imageUrl"],
                },
            })
            .sort({ _id: -1 })
            .lean();

        ctx.status = 200;
        ctx.body = groupItemList;
    } catch (error) {
        console.log("Get group item list error:", error);
    }
};
