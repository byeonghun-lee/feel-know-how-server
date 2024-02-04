import Router from "koa-router";
import auth from "api/auth";
import drawer from "api/drawer";
import card from "api/card";
import search from "api/search";
import readingList from "api/readingList";
import followRelation from "api/followRelation";
import snsAccount from "api/snsAccount";

const api = new Router();

api.use("/auth", auth.routes());
api.use("/drawers", drawer.routes());
api.use("/cards", card.routes());
api.use("/search", search.routes());
api.use("/reading-lists", readingList.routes());
api.use("/follow-relations", followRelation.routes());
api.use("/sns-accounts", snsAccount.routes());

export default api;
