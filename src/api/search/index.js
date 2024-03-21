import Router from "koa-router";
import * as searchCtrl from "api/search/search.ctrl";

const search = new Router();

search.get("/", searchCtrl.search);
search.get("/youtube-channel", searchCtrl.searchYouTubeChannel);
search.get("/sns-profiles", searchCtrl.searchSnsProfileAndGroup);
search.get("/sns-profiles/histories", searchCtrl.getHistoryForSnsProfile);

export default search;
