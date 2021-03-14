import Router from "koa-router";
import auth from "api/auth";
import drawer from "api/drawer";

const api = new Router();

api.use("/auth", auth.routes());
api.use("/drawer", drawer.routes());

export default api;
