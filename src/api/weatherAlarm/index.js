import Router from "koa-router";
import * as weatherAlarmCtrl from "api/weatherAlarm/weatherAlarm.ctrl";

const weatherAlarm = new Router();

weatherAlarm.post("/", weatherAlarmCtrl.create);
weatherAlarm.get("/", weatherAlarmCtrl.getList);

export default weatherAlarm;
