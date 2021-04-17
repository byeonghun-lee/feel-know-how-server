import Router from "koa-router";
import * as authCtrl from "api/auth/auth.ctrl";

const auth = new Router();

auth.post("/register", authCtrl.register);
auth.post("/login", authCtrl.login);
auth.post("/logout", authCtrl.logout);
auth.get("/check", authCtrl.check);
auth.post("/verify-email", authCtrl.sendVerifyEmailCode);

export default auth;