import * as Local from "@getflywheel/local";
import { getServiceContainer } from "@getflywheel/local/main";

export default function (context) {
	const { electron } = context;

	const siteData = getServiceContainer().cradle.siteData;

	electron.ipcMain.on("update-site-notes", (event, siteId, notes) => {
		siteData.updateSite(siteId, {
			id: siteId,
			notes,
		} as Partial<Local.SiteJSON>);
	});
}
