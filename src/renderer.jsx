import Notes from './Notes';
import path from 'path';
import React from 'react';

export default function (context) {

	const { React, hooks } = context;
	const stylesheetPath = path.resolve(__dirname, '../style.css');

	hooks.addContent('stylesheets', () => <link rel="stylesheet" key="notes-addon-styleesheet" href={stylesheetPath}/>);

	hooks.addContent('SiteInfoOverview', (site) => <Notes key="notes" site={site} />);

}
