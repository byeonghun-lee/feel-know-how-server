import Joi from "joi";
import Drawer from "api/drawer/drawer";
import db from "db";

/*
POST /drawers
{
    name: "개발자 관련 링크",
    desc: "개발자 취업 관련 링크를 모았습니다.",
    allPublic: false
}
*/

export const createDrawer = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        name: Joi.string().required(),
        desc: Joi.string().max(140),
        allPublic: Joi.boolean(),
    });
    const result = schema.validate(ctx.request.body);

    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { name, desc, allPublic } = ctx.request.body;

    try {
        await Drawer.create({
            name,
            desc,
            ...(allPublic !== undefined && { allPublic }),
            userId: ctx.state.auth.userId,
        });

        ctx.status = 201;
        return;
    } catch (error) {
        console.log("Create Drawer Error:", error);
        ctx.throw(500, error);
    }
};
