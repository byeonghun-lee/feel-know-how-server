import Joi from "joi";
import Drawer from "api/drawer/drawer";
import db from "db";
import { getUniqueNameForUser } from "api/drawer/drawer.service";

/*
POST /drawers
{
    name: "개발자 관련 링크",
    desc: "개발자 취업 관련 링크를 모았습니다.",
    allPublic: false,
    tags: ["developer", "development"]
}
*/

export const createDrawer = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        name: Joi.string().required(),
        desc: Joi.string().max(140).allow("", null),
        tags: Joi.array().items(Joi.string()).allow("", null),
        allPublic: Joi.boolean(),
    });
    const result = schema.validate(ctx.request.body);
    const userId = ctx.state.auth.userId;

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { name, desc, allPublic, tags } = ctx.request.body;

    try {
        const uniqueNameForUser = await getUniqueNameForUser({ name, userId });

        await Drawer.create({
            name,
            uniqueNameForUser,
            desc,
            ...(allPublic !== undefined && { allPublic }),
            userId,
            ...(tags && tags.length > 0 && { tags }),
            history: [
                {
                    userId,
                    target: "drawer",
                    action: "create",
                },
            ],
        });

        ctx.status = 201;
        return;
    } catch (error) {
        console.log("Create Drawer Error:", error);
        ctx.throw(500, error);
    }
};

/*
GET /drawers
*/

export const getDrawers = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    try {
        const DrawerList = await Drawer.find({
            userId: ctx.state.auth.userId,
        })
            .select(["_id", "name", "uniqueNameForUser", "allPublic"])
            .sort({ createdAt: -1 })
            .lean();

        ctx.status = 200;
        ctx.body = DrawerList;

        return;
    } catch (error) {
        console.log("Get Drawers error");
        return ctx.throw(500, error);
    }
};

/*
GET /drawers/public
*/

export const getPublicDrawers = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const { skip = 0 } = ctx.request.query;

    try {
        const drawers = await Drawer.findPublicDrawers({ skip: Number(skip) });

        console.log("drawer:", drawers);
        ctx.status = 200;
        ctx.body = drawers;
        return;
    } catch (error) {
        console.log("get public drawers error", error);
        return ctx.throw(500, error);
    }
};
