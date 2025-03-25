import Router from "koa-router";
import * as weatherUserCtrl from "api/weatherUser/weatherUser.ctrl";

const weatherUser = new Router();

weatherUser.put("/", weatherUserCtrl.update);

export default weatherUser;
