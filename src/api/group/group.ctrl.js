import Joi from "joi";
import Group from "api/group/group";
import db from "db";

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
        const createdGroup = await Group.create({ userId, name });

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
    try {
        return;
    } catch (error) {
        console.log("Get group list error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};
