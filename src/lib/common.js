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
