import { InnerPaneSidebarContentItem } from 'local-components';
import React, {Component, Fragment} from 'react';
import {  MarkdownPreview  } from 'react-marked-markdown';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import classnames from 'classnames';

export default class Note extends Component {

	static propTypes = {
		date: PropTypes.any,
		body: PropTypes.string,
		pinned: PropTypes.bool,
		onPin: PropTypes.func,
		onDelete: PropTypes.func,
	};

	renderButtons () {

		return <div className="NoteButtons">
			<span className="Pin" onClick={this.props.onPin}>
				<svg><use href={`file://${path.resolve(__filename, '../../assets/pin.svg')}#pin`}/></svg>
			</span>

			<span className="Trash" onClick={this.props.onDelete}>
				<svg><use href={`file://${path.resolve(__filename, '../../assets/trash.svg')}#trash`}/></svg>
			</span>
		</div>;

	}

	render() {

		return <InnerPaneSidebarContentItem className={classnames('Note', { '--Pinned': this.props.pinned })}>
				<h5 className="Date">{dateFormat(this.props.date, 'mmmm dS, yyyy')}</h5>

				{this.renderButtons()}

				<MarkdownPreview value={this.props.body} />
			</InnerPaneSidebarContentItem>;

	}

}

