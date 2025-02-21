import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

export const makeRandomId = (length) => {
    const result = [];
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result.push(
            characters.charAt(Math.floor(Math.random() * charactersLength))
        );
    }

    return result.join("");
};

export const getCookieOptions = () => {
    const cookieOptions = {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "None",
        secure: true,
    };

    if (process.env.APP_ENV === "local") {
        delete cookieOptions.sameSite;
        delete cookieOptions.secure;
    }

    return cookieOptions;
};

export const getNextClosestDay = ({ days, alertDaysBefore, alertTime }) => {
    const today = dayjs();
    const todayDayOfWeek = today.day();

    const sortedDays = [...days].sort((a, b) => a - b);

    for (let day of sortedDays) {
        const alertDay = (day - alertDaysBefore + 7) % 7;

        if (
            alertDay > todayDayOfWeek ||
            (alertDay === todayDayOfWeek &&
                today.hour() < dayjs(alertTime).hour())
        ) {
            return day;
        }
    }

    return sortedDays[0];
};
