import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const weatherAlarmSchema = new Schema({
    deviceId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    type: { type: String, enum: ["weekly", "specific"], required: true },
    specificDate: { type: Date },
    dayOfTheWeek: {
        type: [Number],
        validate: [
            {
                validator: function (value) {
                    return value.every((day) =>
                        [0, 1, 2, 3, 4, 5, 6].includes(day)
                    );
                },
                message: (props) =>
                    `Invalid days provided: ${props.value}. Must be between 0 and 6.`,
            },
            {
                validator: function (value) {
                    return value.length <= 7;
                },
                message: () => "dayOfTheWeek cannot have more than 7 days.",
            },
            {
                validator: function (value) {
                    const uniqueValues = new Set(value);
                    return uniqueValues.size === value.length;
                },
                message: () => "dayOfTheWeek cannot contain duplicate values.",
            },
        ],
    },
    alertDaysBefore: { type: Number, enum: [0, 1, 2] },
    alertTime: { type: String },
    nextAlertDate: { type: Date },
    location: { type: String, required: true },
    locationCoordinates: {
        x: { type: Number },
        y: { type: Number },
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number] },
        },
    },
    forecast24h: [
        {
            _id: false,
            time: { type: Date },
            temperature: { type: Number },
            weather: { type: String },
            precipitationProbability: { type: Number },
        },
    ],
    createdAt: { type: Date, default: () => dayjs().toDate() },
});

weatherAlarmSchema.index({ deviceId: 1 });

const WeatherAlarm = mongoose.model("WeatherAlarm", weatherAlarmSchema);
export default WeatherAlarm;
