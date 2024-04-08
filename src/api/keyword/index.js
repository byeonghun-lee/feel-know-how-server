import Router from "koa-router";
import * as keywordCtrl from "api/keyword/keyword.ctrl";
import checkedLogin from "lib/checkedLogin";

const keyword = new Router();

keyword.post("/", checkedLogin, keywordCtrl.create);
keyword.get("/", checkedLogin, keywordCtrl.getList);

export default keyword;
