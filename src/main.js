import siteData from 'local/helpers/site-data';

export default function (context) {

	const { electron } = context;
	const { ipcMain } = electron;

	ipcMain.on('update-site-notes', (event, siteId, notes) => {
		siteData.updateSite(siteId, {
			notes,
		});
	})

}
