import Router from "koa-router";
import auth from "api/auth";

const api = new Router();

api.use("/auth", auth.routes());

export default api;