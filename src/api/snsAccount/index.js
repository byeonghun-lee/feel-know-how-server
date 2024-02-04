import Router from "koa-router";
import * as snsAccountCtrl from "api/snsAccount/snsAccount.ctrl";
import checkedLogin from "lib/checkedLogin";

const snsAccount = new Router();

snsAccount.post("/", checkedLogin, snsAccountCtrl.upsert);

export default snsAccount;
