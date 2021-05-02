import serverless from "serverless-http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import api from "api";
import cors from "@koa/cors";
import jwtMiddleware from "lib/jwtMiddleware";
import { initAws } from "aws";
import dayjs from "dayjs";
import "dayjs/locale/ko";

const app = new Koa();

// const corsOptions = {
//     origin:
//         process.env.APP_ENV === "local"
//             ? "http://localhost:3001"
//             : "https://www.ohmydrawer.com",
//     credentials: true,
// };

initAws();
dayjs.locale("ko");
global.Day = dayjs;

app.use(
    cors({
        origin: (ctx) => ctx.request.header.origin,
        credentials: (ctx) => true,
    })
);
app.use(bodyParser());
app.use(jwtMiddleware);
app.use(api.routes());

if (process.env.APP_ENV === "local") {
    app.listen(4000, (err) => {
        if (err) {
            console.log("err:", err);
        }

        console.log("server running!");
    });
}

export const handler = serverless(app);
