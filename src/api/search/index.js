import Router from "koa-router";
import * as searchCtrl from "api/search/search.ctrl";

const search = new Router();

search.get("/", searchCtrl.search);
search.get("/youtube-channel", searchCtrl.searchYouTubeChannel);
search.get("/sns-profiles", searchCtrl.searchSnsProfileAndGroup);

export default search;
