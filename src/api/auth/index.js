import Router from "koa-router";
import * as authCtrl from "api/auth/auth.ctrl";

const auth = new Router();

auth.post("/register", authCtrl.register);
auth.post("/login", authCtrl.login);
auth.post("/logout", authCtrl.logout);
auth.get("/check", authCtrl.check);

export default auth;