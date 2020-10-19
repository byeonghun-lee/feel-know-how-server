const mongoose = require("mongoose");
const config = require("../config");

console.log("config", config);

module.exports.connect = () => {
    return mongoose
        .connect(config.mongoUrl, { useNewUrlParser: true })
        .then((res) => {
            console.log("Connect!");
            console.log("res: ", res);
        })
        .catch((err) => {
            console.log("Connect Error!");
            console.log("err:", err);
        });
};
