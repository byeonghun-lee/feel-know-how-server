import Joi from "joi";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import db from "db";
import WeatherAlarm from "api/weatherAlarm/weatherAlarm";

import { getNextClosestDay } from "lib/common";

dayjs.locale("ko");
dayjs.extend(utc);
dayjs.extend(timezone);

/*
POST /weather-alarms
{
    deviceId: "",
    dayOfTheWeek: [0],
    alertDaysBefore: 1,
    alertTime: "",
    location: "",
}
*/
export const create = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        deviceId: Joi.string().required(),
        specificDate: Joi.string(),
        dayOfTheWeek: Joi.array().items(
            Joi.number().valid(0, 1, 2, 3, 4, 5, 6)
        ),
        alertDaysBefore: Joi.number().valid(0, 1, 2),
        alertTime: Joi.string(),
        location: Joi.string().required(),
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        console.log("error:", result.error);
        ctx.throw(400, result.error);
        return;
    }

    const {
        deviceId,
        // type,
        dayOfTheWeek,
        specificDate,
        alertDaysBefore,
        alertTime,
        location,
    } = ctx.request.body;

    try {
        const newWeatherAlarm = {
            deviceId,
            alertDaysBefore,
            alertTime,
            location,
        };
        const alertHour = dayjs(alertTime).hour();
        const alertMin = dayjs(alertTime).minute();

        if (dayOfTheWeek?.length > 0) {
            newWeatherAlarm.type = "weekly";
            newWeatherAlarm.dayOfTheWeek = dayOfTheWeek;

            const nextAlertDayOfWeek = getNextClosestDay({
                days: dayOfTheWeek,
                alertDaysBefore,
                alertTime,
            });

            const diffDays =
                nextAlertDayOfWeek - dayjs().day() < 0
                    ? nextAlertDayOfWeek - dayjs().day() + 7
                    : nextAlertDayOfWeek - dayjs().day();

            newWeatherAlarm.nextAlertDate = dayjs()
                .add(diffDays - alertDaysBefore, "day")
                .hour(alertHour)
                .minute(alertMin)
                .startOf("second")
                .toDate();
        } else {
            const nextAlertDate = dayjs(specificDate)
                .subtract(alertDaysBefore, "day")
                .hour(alertHour)
                .minute(alertMin)
                .startOf("second");

            if (dayjs().isAfter(nextAlertDate)) {
                throw new Error("The set date is older than today.");
            }

            newWeatherAlarm.type = "specific";
            newWeatherAlarm.specificDate = specificDate;
            newWeatherAlarm.nextAlertDate = nextAlertDate.toDate();
        }

        console.log("newWeatherAlarm:", newWeatherAlarm);

        const weatherAlarm = await WeatherAlarm.create(newWeatherAlarm);

        ctx.status = 200;
        ctx.body = weatherAlarm;
        return;
    } catch (error) {
        console.log("Create Weather alarm error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};

/*
GET /weather-alarms
*/
export const getList = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const deviceId = ctx.request.header["device-id"];

    const result = { totalCount: 0, list: [] };

    try {
        const weatherAlarmList = await WeatherAlarm.find({
            deviceId,
            isDeleted: false,
        })
            .sort({ created: -1 })
            .lean();

        result.totalCount = weatherAlarmList.length;
        result.list = weatherAlarmList.map((item) => ({
            id: item._id,
            type: item.type,
            ...(item.dayOfTheWeek && { dayOfTheWeek: item.dayOfTheWeek }),
            ...(item.specificDate && { specificDate: item.specificDate }),
            alertDaysBefore: item.alertDaysBefore,
            alertTime: dayjs(item.alertTime).tz("Asia/Seoul").format("HH:mm"),
            isLiveUpdate: false,
            location: item.location,
            isActive: item.isActive,
            forecast24h: item.forecast24h,
        }));

        ctx.status = 200;
        ctx.body = result;
        return;
    } catch (error) {
        console.log("Get weather alarms list error:", error);
        ctx.throw(500, error.message);
        return;
    }
};

/*
PATCH /weather-alarms/:id/toggle
{
    active: true
}
*/
export const setAlarmStatus = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const deviceId = ctx.request.header["device-id"];
    const { id } = ctx.request.params;
    const { active } = ctx.request.body;

    console.log(`ID: ${id}, ACTIVE: ${active}`);

    try {
        await WeatherAlarm.updateOne(
            { deviceId, _id: id, isActive: !active },
            { isActive: active }
        );

        ctx.status = 204;
        return;
    } catch (error) {
        console.log("Set status of weather alarms error:", error);
        ctx.throw(500, error.message);
        return;
    }
};

/*
PATCH /weather-alarms/:id
{
    deviceId: "",
    dayOfTheWeek: [0],
    alertDaysBefore: 1,
    alertTime: "",
    location: ""
}
*/
export const update = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const schema = Joi.object({
        deviceId: Joi.string().required(),
        specificDate: Joi.string(),
        dayOfTheWeek: Joi.array().items(
            Joi.number().valid(0, 1, 2, 3, 4, 5, 6)
        ),
        alertDaysBefore: Joi.number().valid(0, 1, 2),
        alertTime: Joi.string(),
        location: Joi.string().required(),
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        console.log("error:", result.error);
        ctx.throw(400, result.error);
        return;
    }

    const {
        deviceId,
        dayOfTheWeek,
        specificDate,
        alertDaysBefore,
        alertTime,
        location,
    } = ctx.request.body;
    const alarmId = ctx.request.params.id;

    try {
        const newWeatherAlarm = {
            alertDaysBefore,
            alertTime,
            location,
        };
        const alertHour = dayjs(alertTime).hour();
        const alertMin = dayjs(alertTime).minute();

        if (dayOfTheWeek?.length > 0) {
            newWeatherAlarm.type = "weekly";
            newWeatherAlarm.dayOfTheWeek = dayOfTheWeek;

            const nextAlertDayOfWeek = getNextClosestDay({
                days: dayOfTheWeek,
                alertDaysBefore,
                alertTime,
            });

            const diffDays =
                nextAlertDayOfWeek - dayjs().day() < 0
                    ? nextAlertDayOfWeek - dayjs().day() + 7
                    : nextAlertDayOfWeek - dayjs().day();

            newWeatherAlarm.nextAlertDate = dayjs()
                .add(diffDays - alertDaysBefore, "day")
                .hour(alertHour)
                .minute(alertMin)
                .startOf("second")
                .toDate();
        } else {
            const nextAlertDate = dayjs(specificDate)
                .subtract(alertDaysBefore, "day")
                .hour(alertHour)
                .minute(alertMin)
                .startOf("second");

            if (dayjs().isAfter(nextAlertDate)) {
                throw new Error("The set date is older than today.");
            }

            newWeatherAlarm.type = "specific";
            newWeatherAlarm.specificDate = specificDate;
            newWeatherAlarm.nextAlertDate = nextAlertDate.toDate();
        }

        console.log("updateWeatherAlarm:", newWeatherAlarm);

        const weatherAlarm = await WeatherAlarm.findOneAndUpdate(
            {
                _id: alarmId,
                deviceId,
            },
            newWeatherAlarm,
            { new: true }
        );

        ctx.status = 200;
        ctx.body = weatherAlarm;
        return;
    } catch (error) {
        console.log("Update Weather alarm error:", error);
        ctx.throw(500, error.message);
        return;
    }
};

/*
DELETE /weather-alarms/:id
*/
export const remove = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const deviceId = ctx.request.header["device-id"];
    const { id } = ctx.request.params;

    try {
        await WeatherAlarm.updateOne(
            { _id: id, deviceId, isDeleted: false },
            { isDeleted: true }
        );

        ctx.status = 204;
        return;
    } catch (error) {
        console.log("Delete Weather alarm error:", error);
        ctx.throw(500, error.message);
        return;
    }
};
