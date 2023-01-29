import db from "db";
import Drawer from "api/drawer/drawer";
import Card from "api/card/card";

export const search = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const keyword = decodeURIComponent(ctx.request.query.keyword);
    console.log("keyword:", keyword);

    const drawerMatchQuery = ctx.state.auth
        ? { $or: [{ allPublic: true }, { userId: ctx.state.auth.userId }] }
        : { allPublic: true };

    const drawerMatchQueryInsideCard = ctx.state.auth
        ? {
              $or: [
                  { "drawers.allPublic": true },
                  { "drawers.userId": ctx.state.auth.userId },
              ],
          }
        : { "drawers.allPublic": true };

    try {
        const drawerList = await Drawer.aggregate()
            .search({
                index: "drawerSearch",
                text: {
                    query: keyword,
                    path: ["name", "desc", "tags"],
                },
            })
            .match(drawerMatchQuery)
            .lookup({
                from: "auths",
                localField: "userId",
                foreignField: "_id",
                as: "users",
            })
            .unwind({ path: "$users", preserveNullAndEmptyArrays: true })
            .project({
                name: 1,
                desc: 1,
                tags: 1,
                allPublic: 1,
                forkList: 1,
                likeList: 1,
                "users.nickname": 1,
            })
            .limit(3);

        const cardList = await Card.aggregate()
            .search({
                index: "cardSearch",
                text: {
                    query: keyword,
                    path: ["title", "desc"],
                },
            })
            // .lookup({
            //     from: "drawers",
            //     let: { parentDrawerId: { $toObjectId: "$_id" } },
            //     pipeline: [
            //         {
            //             $match: {
            //                 $expr: [{ drawerId: "$$parentDrawerId" }],
            //                 // {

            //                 //     // $eq: [
            //                 //     //     "$drawerId",
            //                 //     //     "$$parentDrawerId",
            //                 //     //     // ObjectId("$$parentDrawerId"),
            //                 //     //     // { $toObjectId: "$$parentDrawerId" },
            //                 //     // ],
            //                 // },
            //             },
            //         },
            //     ],
            //     // localField: "drawerId",
            //     // foreignField: "_id",
            //     as: "drawers",
            // })
            .lookup({
                from: "drawers",
                localField: "drawerId",
                foreignField: "_id",
                as: "drawers",
            })
            .unwind({ path: "$drawers", preserveNullAndEmptyArrays: true })
            .match(drawerMatchQueryInsideCard)
            .project({
                title: 1,
                desc: 1,
                url: 1,
                isRead: 1,
                "drawers.allPublic": 1,
            })
            .limit(3);

        ctx.body = {
            drawerList: drawerList.map((drawer) => ({
                id: drawer._id,
                name: drawer.name,
                desc: drawer.desc,
                userNickname: drawer.users.nickname,
                link: `/@${drawer.users.nickname}/${drawer.name}`,
                forkCounts: drawer.forkList ? drawer.forkList.length : 0,
                likeCounts: drawer.likeList ? drawer.likeList.length : 0,
            })),
            cardList,
        };
    } catch (error) {
        console.log("Error:", error);
    }
};
