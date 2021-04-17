import Box from "api/box/box";
import db from "db";
import Auth from "api/auth/auth";

export const JobOfInitRegister = async (auth) => {
    await Box.insertMany([
        { name: "inbox", userId: auth._id },
        { name: "trash", userId: auth._id },
    ]);
};

export const checkExistUser = async ({ ctx, email }) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    if (!email) {
        throw new Error("Email is required.");
    }

    const user = await Auth.findOne({ email }).select("_id").lean();

    if (user) {
        throw new Error("Exist email.");
    } else {
        return;
    }
};

export const preRegister = async ({ ctx, chekedEmail }) => {
    ctx.callbackWaitsForEmptyEventLoop = false;
    await db.connect();

    await Auth.create({
        email: chekedEmail,
        nickname: `preUser${Day().format("MMDDHHmmss")}`,
        expireAt: Day().add(10, "m"),
    });

    return;
};
