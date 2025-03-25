import dayjs from "dayjs";
import "dayjs/locale/ko";

import db from "db";
import WeatherUser from "api/weatherUser/weatherUser";

/*
PUT /weather-users
{
    token: "",
    deviceId: ""
}
*/
export const update = async (ctx) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    const { token, deviceId } = ctx.request.body;

    console.log("token:", token);
    console.log("deviceId:", deviceId);
    try {
        await WeatherUser.updateOne(
            {
                deviceId,
                isDeleted: false,
            },
            {
                $set: { token },
                $setOnInsert: {
                    deviceId,
                    isDeleted: false,
                    createdAt: dayjs().toDate(),
                },
            },
            { upsert: true }
        );

        ctx.status = 204;
        return;
    } catch (error) {
        console.log("Update Weather user error:", error);
        ctx.status = 500;
        ctx.body = error;
        return;
    }
};
