/**
 * E2E test for the add-on's compiled main-process entry point (lib/main.js).
 *
 * It drives the exact artifact that ships to Local: loading it against a mocked
 * Local runtime and asserting that the `update-site-notes` IPC channel is wired
 * up and persists notes through `siteData.updateSite`.
 */
const electron = require('electron');
const { siteData } = require('./mocks/local-main.js');
const registerMain = require('../lib/main.js').default;

describe('main process (built lib/main.js)', () => {
	it('registers the update-site-notes IPC handler on load', () => {
		registerMain({ electron });

		expect(electron.ipcMain.on).toHaveBeenCalledWith(
			'update-site-notes',
			expect.any(Function),
		);
	});

	it('persists incoming notes to the site', () => {
		registerMain({ electron });

		const handler = electron.ipcMain.__handlers.get('update-site-notes');
		const notes = [{ body: 'Remember this', date: new Date().toISOString(), pinned: false }];

		handler({}, 'site-123', notes);

		expect(siteData.updateSite).toHaveBeenCalledWith('site-123', {
			id: 'site-123',
			notes,
		});
	});
});
