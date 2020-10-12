const serverless = require("serverless-http");
const Koa = require("koa");
const app = new Koa();

app.use(async ctx => {
    ctx.body = "Hello world!";
});

module.exports.handler = serverless(app);