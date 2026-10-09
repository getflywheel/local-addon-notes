// Stand-in for `@getflywheel/local/main`. `getServiceContainer().cradle.siteData`
// is how the add-on persists notes, so specs can assert directly against it.
const siteData = {
	updateSite: jest.fn(),
};

const getServiceContainer = jest.fn(() => ({
	cradle: { siteData },
}));

module.exports = { getServiceContainer, siteData };
