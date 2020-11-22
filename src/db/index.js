import mongoose from "mongoose";
import config from "config";

let cachedDb = null;

export default {
    connect: () => {
        console.log("=> Connect to Database.");

        if (cachedDb) {
            console.log("=> Useing cached database instance");
            return Promise.resolve(cachedDb);
        }

        return mongoose
            .connect(config.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then((res) => {
                console.log("=> Connect!");
                cachedDb = res;
            })
            .catch((err) => {
                console.log("=> Connect Error!");
                console.log("err:", err);
            });
    },
};
