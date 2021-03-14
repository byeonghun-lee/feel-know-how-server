import Box from "api/box/box";

export const JobOfInitRegister = async (auth) => {
    await Box.insertMany([
        { name: "inbox", userId: auth._id },
        { name: "trash", userId: auth._id },
    ]);
};
