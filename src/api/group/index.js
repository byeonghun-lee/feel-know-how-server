import Router from "koa-router";
import * as groupCtrl from "api/group/group.ctrl";
import checkedLogin from "lib/checkedLogin";

const group = new Router();

group.post("/", checkedLogin, groupCtrl.create);
group.get("/", checkedLogin, groupCtrl.getList);
group.patch("/:groupId/follows", checkedLogin, groupCtrl.addFollows);

export default group;
