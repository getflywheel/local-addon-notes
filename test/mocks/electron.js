// Minimal stand-in for the `electron` module, exposing just enough of
// `ipcMain` / `ipcRenderer` for the add-on and letting specs assert on IPC.
const ipcMainHandlers = new Map();
const ipcRendererSend = jest.fn();

const ipcMain = {
	on: jest.fn((channel, handler) => {
		ipcMainHandlers.set(channel, handler);
	}),
	removeListener: jest.fn(),
	__handlers: ipcMainHandlers,
};

const ipcRenderer = {
	send: ipcRendererSend,
	on: jest.fn(),
	removeListener: jest.fn(),
};

module.exports = { ipcMain, ipcRenderer };
