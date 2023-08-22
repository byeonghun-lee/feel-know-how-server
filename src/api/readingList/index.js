import Router from "koa-router";
import * as readingListCtrl from "api/readingList/readingList.ctrl";
import checkedLogin from "lib/checkedLogin";

const readingList = new Router();

readingList.get("/", checkedLogin, readingListCtrl.getList);
readingList.post("/", checkedLogin, readingListCtrl.addReadingList);

export default readingList;
