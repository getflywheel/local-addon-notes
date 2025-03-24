import { InnerPaneSidebarContentItem, Markdown } from '@getflywheel/local-components';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import path from 'path';

export default class Note extends Component {
	state = {
        formattedDate: null,
    };

	static propTypes = {
		date: PropTypes.any,
		body: PropTypes.string,
		pinned: PropTypes.bool,
		onPin: PropTypes.func,
		onDelete: PropTypes.func,
		onEdit: PropTypes.func,
	};

	async componentDidMount() {
        const date = new Date(this.props.date);
		this.setState({
			formattedDate: date.toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			}),
			isLoading: false
		});
    }

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
		const { formattedDate } = this.state
		return <InnerPaneSidebarContentItem className={classnames('Note', { '__Pinned': this.props.pinned })}>
			<h5 className="Date hideOnSpectron">{ formattedDate }</h5>

			{this.renderButtons()}

			<Markdown src={this.props.body} />
		</InnerPaneSidebarContentItem>;

	}

}
