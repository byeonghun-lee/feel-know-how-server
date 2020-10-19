const serverless = require("serverless-http");
const db = require("./src/db");
const Koa = require("koa");
const app = new Koa();

app.use(async ctx => {
    await db.connect();
    ctx.body = "Hello world!";
});

module.exports.handler = serverless(app);