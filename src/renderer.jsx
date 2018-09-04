import Notes from './Notes';
import path from 'path';
import React, {Component, Fragment} from 'react';

export default function (context) {

	const { React, hooks } = context;
	const stylesheetPath = path.resolve(__dirname, '../style.css');

	hooks.addContent('stylesheets', () => {
		return <link rel="stylesheet" key="notes-addon-styleesheet" href={stylesheetPath}/>;
	});

	hooks.addContent('SiteInfoOverview', (site) => {
		return <Notes key="notes" site={site} />
	});

}
