import Joi from "joi";
import FollowRelation from "api/followRelation/followRelation";
import SnsAccount from "api/snsAccount/snsAccount";
import db from "db";

/*
GET /follow-relations/:snsName
*/
export const getList = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const { snsName } = ctx.request.params;
    const userId = ctx.state.auth.userId;
    const result = { accountStatus: null, list: [] };

    try {
        const snsAccount = await SnsAccount.findOne({ userId })
            .select(["userId", snsName])
            .lean();

        if (!snsAccount) {
            result.accountStatus = "empty";
        } else if (["request", "pending"].indexOf(snsAccount.status) >= 0) {
            result.accountStatus = "pending";
        } else {
            result.accountStatus = "complete";
            const list = await FollowRelation.find({ userId, snsName })
                .populate({
                    path: "followId",
                    select: ["path", "name", "desc", "lastUploadedAt"],
                })
                .sort({ _id: -1 })
                .lean();

            result.list = list;
        }

        ctx.status = 200;
        ctx.body = result;
        return;
    } catch (error) {
        console.log("Get follow relation list error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};
