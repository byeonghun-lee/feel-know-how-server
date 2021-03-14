import Router from "koa-router";
import * as drawerCtrl from "api/drawer/drawer.ctrl";
import checkedLogin from "lib/checkedLogin";

const drawer = new Router();

// drawer.get("/drawers", drawerCtrl.getDrawers);
drawer.post("/", checkedLogin, drawerCtrl.createDrawer);

export default drawer;