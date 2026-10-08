// E2E harness for the built add-on.
//
// The `@getflywheel/local` runtime only exists inside the Local desktop app, so
// we map it (and `electron`) to lightweight mocks and load the *compiled* add-on
// from `lib/`. The real `@getflywheel/local-components`, `react` and `react-dom`
// are exercised, which is what makes this useful as a dependency-bump gate: if a
// bump breaks the add-on's build, imports, rendering or IPC wiring, it fails.
module.exports = {
	testEnvironment: 'jsdom',
	testMatch: ['<rootDir>/test/**/*.test.js'],
	// The compiled output is plain CommonJS; no transforms are needed, which
	// keeps the suite fast and dependency-free.
	transform: {},
	clearMocks: true,
	setupFiles: ['<rootDir>/test/setup.js'],
	moduleNameMapper: {
		'^electron$': '<rootDir>/test/mocks/electron.js',
		'^@getflywheel/local$': '<rootDir>/test/mocks/local.js',
		'^@getflywheel/local/renderer$': '<rootDir>/test/mocks/local-renderer.js',
		'^@getflywheel/local/main$': '<rootDir>/test/mocks/local-main.js',
	},
};
