import Router from "koa-router";
import auth from "api/auth";
import drawer from "api/drawer";
import card from "api/card";
import search from "api/search";
import readingList from "api/readingList";
import followRelation from "api/followRelation";
import snsAccount from "api/snsAccount";
import group from "api/group";
import keyword from "api/keyword";
import weatherAlarm from "api/weatherAlarm";
import weatherForecast from "api/weatherForecast";

const api = new Router();

api.use("/auth", auth.routes());
api.use("/drawers", drawer.routes());
api.use("/cards", card.routes());
api.use("/search", search.routes());
api.use("/reading-lists", readingList.routes());
api.use("/follow-relations", followRelation.routes());
api.use("/sns-accounts", snsAccount.routes());
api.use("/groups", group.routes());
api.use("/keywords", keyword.routes());
api.use("/weather-alarms", weatherAlarm.routes());
api.use("/weather-forecasts", weatherForecast.routes());

export default api;
