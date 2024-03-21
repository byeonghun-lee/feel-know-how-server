import Router from "koa-router";
import * as searchCtrl from "api/search/search.ctrl";
import checkedLogin from "lib/checkedLogin";

const search = new Router();

search.get("/", searchCtrl.search);
search.get("/youtube-channel", searchCtrl.searchYouTubeChannel);
search.get("/sns-profiles", checkedLogin, searchCtrl.searchSnsProfileAndGroup);
search.get(
    "/sns-profiles/histories",
    checkedLogin,
    searchCtrl.getHistoryForSnsProfile
);

export default search;
