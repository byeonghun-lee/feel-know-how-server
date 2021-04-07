import Router from "koa-router";
import auth from "api/auth";
import drawer from "api/drawer";
import card from "api/card";

const api = new Router();

api.use("/auth", auth.routes());
api.use("/drawers", drawer.routes());
api.use("/cards", card.routes());

export default api;
