import serverless from "serverless-http";
import Koa from "koa";
import bodyParser from "koa-bodyparser"
import api from "api";

const app = new Koa();

app.use(bodyParser());
app.use(api.routes());

if(process.env.APP_ENV === "local") {
    app.listen(4000, (err) => {
        if(err) {
            console.log("err:", err);
        }
    
        console.log("server running!");
    });
}

export const handler = serverless(app);