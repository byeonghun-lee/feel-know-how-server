import Router from "koa-router";
import * as keywordCtrl from "api/keyword/keyword.ctrl";
import checkedLogin from "lib/checkedLogin";

const keyword = new Router();

keyword.post("/", checkedLogin, keywordCtrl.create);
keyword.get("/", checkedLogin, keywordCtrl.getList);
keyword.get("/relations/:uuid", checkedLogin, keywordCtrl.getKeywordDetail);
keyword.get("/relations/:uuid/image", keywordCtrl.getScrapingDetailImage);
keyword.delete(
    "/relations/:uuid",
    checkedLogin,
    keywordCtrl.deleteKeywordRelations
);
keyword.patch(
    "/relations/:uuid/blog-list",
    checkedLogin,
    keywordCtrl.updateBlogList
);

export default keyword;
