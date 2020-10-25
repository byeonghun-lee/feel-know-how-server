import serverless from "serverless-http";
import Koa from "koa";
import db from "db";
import api from "api";

const app = new Koa();

app.use(async ctx => {
    console.log("db", db);
    await db.connect();
    ctx.body = "Hello world!";
});
app.use(api.routes);

if(process.env.APP_ENV === "local") {
    app.listen(4000, (err) => {
        if(err) {
            console.log("err:", err);
        }
    
        console.log("server running!");
    });
}

export const handler = serverless(app);