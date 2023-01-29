import Router from "koa-router";
import * as searchCtrl from "api/search/search.ctrl";

const search = new Router();

search.get("/", searchCtrl.search);

export default search;
