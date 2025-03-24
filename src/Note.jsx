import { InnerPaneSidebarContentItem, Markdown } from '@getflywheel/local-components';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import path from 'path';

export default class Note extends Component {
    state = {
        formattedDate: null,
        isLoading: true
    };

    static propTypes = {
        date: PropTypes.any,
        body: PropTypes.string,
        pinned: PropTypes.bool,
        onPin: PropTypes.func,
        onDelete: PropTypes.func,
        onEdit: PropTypes.func,
    };

    renderButtons() {
        return (
            <div className="NoteButtons">
                <span className="Pin" onClick={this.props.onPin}>
                    <svg key="pin"><use href={`file://${path.resolve(__filename, '../../assets/pin.svg')}#pin`} /></svg>
                </span>
                <span className="Edit" onClick={this.props.onEdit}>
                    <svg key="edit"><use href={`file://${path.resolve(__filename, '../../assets/edit.svg')}#edit`} /></svg>
                </span>
                <span className="Trash" onClick={this.props.onDelete}>
                    <svg key="trash"><use href={`file://${path.resolve(__filename, '../../assets/trash.svg')}#trash`} /></svg>
                </span>
            </div>
        );
    }

    async componentDidMount() {
        try {
            const dateFormat = await import('dateformat');
            const dateObj = new Date(this.props.date);
            this.setState({
                formattedDate: dateFormat.default(dateObj, 'mmmm d, yyyy'),
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to load dateformat:', error);
            const dateObj = new Date(this.props.date);
            this.setState({
                formattedDate: dateObj.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }),
                isLoading: false
            });
        }
    }

    render() {
        const { formattedDate, isLoading } = this.state;

        return (
            <InnerPaneSidebarContentItem className={classnames('Note', { '__Pinned': this.props.pinned })}>
                <h5 className="Date hideOnSpectron">
                    {isLoading ? 'Loading...' : formattedDate}
                </h5>
                {this.renderButtons()}
                <Markdown src={this.props.body} />
            </InnerPaneSidebarContentItem>
        );
    }
}