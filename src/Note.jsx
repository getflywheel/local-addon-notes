import { InnerPaneSidebarContentItem, Markdown } from '@getflywheel/local-components';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import classnames from 'classnames';
import path from 'path';

export default class Note extends Component {

	static propTypes = {
		date: PropTypes.any,
		body: PropTypes.string,
		pinned: PropTypes.bool,
		onPin: PropTypes.func,
		onDelete: PropTypes.func,
		onEdit: PropTypes.func,
	};

	renderButtons() {

		return <div className="NoteButtons">
			<span className="Pin" onClick={this.props.onPin}>
				<svg><use href={`file://${path.resolve(__filename, '../../assets/pin.svg')}#pin`} /></svg>
			</span>

			<span className="Edit" onClick={this.props.onEdit}>
				<svg><use href={`file://${path.resolve(__filename, '../../assets/edit.svg')}#edit`} /></svg>
			</span>

			<span className="Trash" onClick={this.props.onDelete}>
				<svg><use href={`file://${path.resolve(__filename, '../../assets/trash.svg')}#trash`} /></svg>
			</span>
		</div>;

	}

	render() {

		return <InnerPaneSidebarContentItem className={classnames('Note', { '__Pinned': this.props.pinned })}>
			<h5 className="Date hideOnSpectron">{dateFormat(this.props.date, 'mmmm dS, yyyy')}</h5>

			{this.renderButtons()}

			<Markdown src={this.props.body} />
		</InnerPaneSidebarContentItem>;

	}

}

