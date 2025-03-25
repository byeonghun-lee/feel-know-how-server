import Router from "koa-router";
import * as weatherForecastCtrl from "api/weatherForecast/weatherForecast.ctrl";

const weatherForecast = new Router();

weatherForecast.get("/", weatherForecastCtrl.getList);

export default weatherForecast;
