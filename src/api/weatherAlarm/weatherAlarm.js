import mongoose, { Schema } from "mongoose";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

const weatherAlarmSchema = new Schema({
    owner: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    type: { type: String, enum: ["weekly", "specific"], required: true },
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
    alertDaysBefore: { type: Number, enum: [1, 2, 3] },
    alertTime: { type: String },
    nextAlertDate: { type: Date },
    location: { type: String, required: true },
    createdAt: { type: Date, default: () => dayjs().toDate() },
});

const WeatherAlarm = mongoose.model("WeatherAlarm", weatherAlarmSchema);
export default WeatherAlarm;
