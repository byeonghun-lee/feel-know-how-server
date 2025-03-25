import dayjs from "dayjs";
import "dayjs/locale/ko";

import db from "db";
import WeatherForecast from "api/weatherForecast/weatherForecast";

/*
GET /weather-forecasts
*/
export const getList = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const deviceId = ctx.request.header["device-id"];

    const result = { totalCount: 0, list: [] };
    try {
        const weatherForecastList = await WeatherForecast.find({
            deviceId,
            forecastDate: { $lte: dayjs().toDate() },
        })
            .sort({ _id: -1 })
            .limit(10)
            .lean();

        result.totalCount = weatherForecastList.length;
        result.list = weatherForecastList;

        ctx.status = 200;
        ctx.body = result;
        return;
    } catch (error) {
        console.log("Get weather forcast list error:", error);
        ctx.throw(500, error.message);
        return;
    }
};
