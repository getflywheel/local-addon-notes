// Stand-in for `@getflywheel/local/renderer`. The add-on imports `confirm` from
// here for the delete-note dialog.
const confirm = jest.fn(() => Promise.resolve());

const HooksRenderer = {
	addContent: jest.fn(),
	doContent: jest.fn(),
};

module.exports = { confirm, HooksRenderer };
