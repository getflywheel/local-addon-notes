/**
 * E2E test for the add-on's compiled renderer entry point (lib/renderer.js).
 *
 * The real `@getflywheel/local-components` and React are rendered into jsdom;
 * only the Local app runtime and Electron are mocked. This catches dependency
 * bumps that break hook registration, component rendering or IPC syncing.
 */
const React = require('react');
const { render, screen, fireEvent, cleanup } = require('@testing-library/react');
const electron = require('electron');
const registerRenderer = require('../lib/renderer.js').default;

function createHooks() {
	const registered = {};

	return {
		registered,
		addContent(hook, callback) {
			(registered[hook] = registered[hook] || []).push(callback);
		},
	};
}

function renderSiteOverview(site) {
	const hooks = createHooks();
	registerRenderer({ React, hooks });

	const siteInfoOverview = hooks.registered.SiteInfoOverview[0];
	return render(siteInfoOverview(site));
}

afterEach(cleanup);

describe('renderer process (built lib/renderer.js)', () => {
	it('registers the stylesheet and SiteInfoOverview hooks', () => {
		const hooks = createHooks();

		registerRenderer({ React, hooks });

		expect(hooks.registered.stylesheets).toHaveLength(1);
		expect(hooks.registered.SiteInfoOverview).toHaveLength(1);
	});

	it('renders the empty notes sidebar for a site', () => {
		renderSiteOverview({ id: 'site-1', notes: [] });

		expect(screen.getByText('Notes')).toBeTruthy();
		expect(screen.getByText('+ Add Note')).toBeTruthy();
	});

	it('renders existing notes for a site', () => {
		const date = new Date('2024-01-01T00:00:00Z');

		renderSiteOverview({
			id: 'site-1',
			notes: [{ body: 'Existing note body', date, pinned: false }],
		});

		expect(screen.getByText('Existing note body')).toBeTruthy();
	});

	it('adds a note and syncs it to the main process over IPC', () => {
		renderSiteOverview({ id: 'site-1', notes: [] });

		fireEvent.click(screen.getByText('+ Add Note'));

		const textarea = screen.getByPlaceholderText('Add a note...');
		fireEvent.change(textarea, { target: { value: 'My first note' } });
		fireEvent.keyPress(textarea, { key: 'Enter', charCode: 13, keyCode: 13 });

		expect(electron.ipcRenderer.send).toHaveBeenCalledTimes(1);

		const [channel, siteId, notes] = electron.ipcRenderer.send.mock.calls[0];
		expect(channel).toBe('update-site-notes');
		expect(siteId).toBe('site-1');
		expect(notes).toHaveLength(1);
		expect(notes[0]).toMatchObject({ body: 'My first note', pinned: false });
	});
});
