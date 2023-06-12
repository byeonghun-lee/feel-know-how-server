import db from "db";
import Drawer from "api/drawer/drawer";
import Card from "api/card/card";
import mongoose from "mongoose";
import axios from "axios";
import { google } from "googleapis";
import config from "config";

export const search = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const keyword = decodeURIComponent(ctx.request.query.keyword);

    const drawerMatchQuery = ctx.state.auth
        ? {
              $or: [
                  { allPublic: true },
                  { userId: mongoose.Types.ObjectId(ctx.state.auth.userId) },
              ],
          }
        : { allPublic: true };

    const drawerMatchQueryInsideCard = ctx.state.auth
        ? {
              $or: [
                  { "drawers.allPublic": true },
                  {
                      "drawers.userId": mongoose.Types.ObjectId(
                          ctx.state.auth.userId
                      ),
                      "drawers.allPublic": false,
                  },
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
        return;
    } catch (error) {
        console.log("Error:", error);
        return ctx.throw(500, error);
    }
};

export const searchYouTubeChannel = async (ctx) => {
    // todo
    // ip 확인 후 요청 많으면 제한
    ctx.callbackWaitsForEmptyEventLoop = false;

    const channelUrl = ctx.request.query["channel-url"];
    console.log("channelUrl:", channelUrl);

    try {
        const youtube = google.youtube({
            version: "v3",
            auth: config.YOUTUBE_API_KEY,
        });

        const html = await (
            await axios.get(`https://www.youtube.com/@${channelUrl}`)
        ).data;
        const channelIdReg = /https:\/\/www.youtube.com\/feeds\/videos.xml\?channel_id(.*?)(?=\"\>)/;
        const channelIdUrl = html.match(channelIdReg)[0];
        console.log("channelIdUrl", channelIdUrl);
        const channelId = channelIdUrl.split("channel_id=")[1];
        console.log("channelId:", channelId);

        if (!channelId) {
            ctx.status = 400;
            return;
        }

        const searchedResult = await youtube.channels.list({
            part: "snippet, brandingSettings, statistics",
            id: channelId,
        });
        const searchedYouTubeChannelInfo = searchedResult.data?.items?.[0];
        console.log(
            "searchedYouTubeChannelInfo:",
            JSON.stringify(searchedYouTubeChannelInfo)
        );

        ctx.body = {
            id: channelId,
            title: searchedYouTubeChannelInfo?.snippet?.title || "-",
            description:
                searchedYouTubeChannelInfo?.snippet?.description || "-",
            customUrl: searchedYouTubeChannelInfo?.snippet?.customUrl || "-",
            thumbnails:
                searchedYouTubeChannelInfo?.snippet?.thumbnails?.medium?.url ||
                "-",
            country: searchedYouTubeChannelInfo?.snippet.country || "-",
            subscriberCount:
                searchedYouTubeChannelInfo?.statistics.subscriberCount || "-",
            viewCount: searchedYouTubeChannelInfo?.statistics.viewCount || "-",
            videoCount:
                searchedYouTubeChannelInfo?.statistics.videoCount || "-",
            keywords:
                searchedYouTubeChannelInfo?.brandingSettings.channel.keywords ||
                "-",
        };
        return;
    } catch (error) {
        console.log("ERROR:", error);
        return ctx.throw(500, error);
    }
};
