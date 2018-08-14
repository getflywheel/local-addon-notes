import Notes from './Notes';
import path from 'path';

export default function (context) {

	const { React, hooks } = context;
	const stylesheetPath = path.resolve(__dirname, '../style.css');

	hooks.addContent('stylesheets', () => {
		return <link rel="stylesheet" href={stylesheetPath}/>;
	});

	hooks.addContent('siteInfoSetup', (site) => {
		return <Notes key="notes" site={site} />
	});

}
