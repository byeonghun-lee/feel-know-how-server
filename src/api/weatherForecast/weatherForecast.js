import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

// 현재는 중복이 있더라도 weatherAlarm 하나에 한번씩 예보를 가져오지만
// 회원이 많아지면 중복된 지역이 있을 수 있으니 그때는 지역별로 예보를 주기적으로 가져오고
// noti할 때 이전에 가져온 예보를 보내면 될 듯
const weatherForecastSchema = new Schema(
    {
        deviceId: { type: String, required: true },
        weatherAlarm: { type: mongoose.Types.ObjectId, ref: "WeatherAlarm" },
        location: {
            type: String,
            required: true,
        },
        forecastDate: {
            type: Date,
            required: true,
        },
        temperature: {
            min: { type: Number }, // 최저 기온 (°C)
            max: { type: Number }, // 최고 기온 (°C)
        },
        weather: {
            am: { type: String },
            pm: { type: String },
        },
        precipitationProbability: {
            am: { type: Number },
            pm: { type: Number },
        },
        source: {
            type: String, // 데이터 출처
            required: true,
        },
    },
    { timestamps: true } // createdAt, updatedAt 자동 생성
);

const WeatherForecast = mongoose.model(
    "WeatherForecast",
    weatherForecastSchema
);

export default WeatherForecast;
