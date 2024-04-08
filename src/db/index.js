import mongoose from "mongoose";
import config from "config";
import Keyword from "api/keyword/keyword";
import KeywordRelation from "api/keywordRelation/keywordRelation";

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
                useCreateIndex: true,
                useFindAndModify: false,
            })
            .then(async (res) => {
                console.log("=> Connect!");
                await Keyword.createIndexes();
                await KeywordRelation.createIndexes();
                cachedDb = res;
            })
            .catch((err) => {
                console.log("=> Connect Error!");
                console.log("err:", err);
            });
    },
};
