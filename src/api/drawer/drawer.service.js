import Drawer from "api/drawer/drawer";
import { makeRandomId } from "lib/common";

export const getUniqueNameForUser = async ({ name, userId }) => {
    if (!name || !userId) {
        throw new Error("Missing required params.");
    }

    let uniqueName = name;

    const drawerWithDuplicateName = await Drawer.findOne({
        name: name.charAt(0).toUpperCase() + name.slice(1, name.length),
        userId,
    })
        .select("_id")
        .lean();

    if (drawerWithDuplicateName) {
        uniqueName = `${name}-${makeRandomId(7)}`;
    }

    return uniqueName;
};
