import Router from "koa-router";
import * as weatherAlarmCtrl from "api/weatherAlarm/weatherAlarm.ctrl";

const weatherAlarm = new Router();

weatherAlarm.post("/", weatherAlarmCtrl.create);
weatherAlarm.get("/", weatherAlarmCtrl.getList);
weatherAlarm.patch("/:id/toggle", weatherAlarmCtrl.setAlarmStatus);
weatherAlarm.patch("/:id", weatherAlarmCtrl.update);
weatherAlarm.delete("/:id", weatherAlarmCtrl.remove);

export default weatherAlarm;
