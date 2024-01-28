import Router from "koa-router";
import * as followRelationCtrl from "api/followRelation/followRelation.ctrl";
import checkedLogin from "lib/checkedLogin";

const followRelation = new Router();

followRelation.get("/:snsName", checkedLogin, followRelationCtrl.getList);

export default followRelation;
