// jsdom is missing a few browser/Node APIs that @getflywheel/local-components
// and its transitive deps touch on import / render. Providing inert stubs keeps
// the harness focused on the add-on itself.
const { TextDecoder, TextEncoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = TextDecoder;
}

if (typeof window !== 'undefined') {
	if (!window.matchMedia) {
		window.matchMedia = () => ({
			matches: false,
			media: '',
			onchange: null,
			addListener() {},
			removeListener() {},
			addEventListener() {},
			removeEventListener() {},
			dispatchEvent() {
				return false;
			},
		});
	}

	if (!window.ResizeObserver) {
		window.ResizeObserver = class ResizeObserver {
			observe() {}

			unobserve() {}

			disconnect() {}
		};
	}
}
