import {
	InnerPaneSidebar,
	InnerPaneSidebarHeader,
	InnerPaneSidebarAddNew,
	InnerPaneSidebarContent,
	EmptyArea,
	Button,
} from '@getflywheel/local-components';

import React, { Component, Fragment } from 'react';
import Note from './Note';
import classnames from 'classnames';
import { ipcRenderer } from 'electron';
import { confirm } from '@getflywheel/local/renderer';
import path from 'path';

export default class Notes extends Component {

	constructor(props) {

		super(props);

		const notes = this.fetchSiteNotes();

		if( notes ) {
			for (const [noteIndex, note] of notes.entries()) {
				notes[noteIndex].editing = false;
			}
		}

		this.state = {
			promotePinned: false,
			notes: notes,
			textareaValue: '',
			addNewOpen: false,
		};

		this.textareaRef = React.createRef();

		this.onTextareaChange = this.onTextareaChange.bind(this);
		this.onTextareaKeyPress = this.onTextareaKeyPress.bind(this);
		this.openAddNew = this.openAddNew.bind(this);
		this.toggleAddNew = this.toggleAddNew.bind(this);

	}

	componentDidUpdate(previousProps) {

		if (previousProps.site.id !== this.props.site.id) {
			this.setState({
				notes: this.fetchSiteNotes(),
			});
		}

	}

	syncNotesToSite() {
		ipcRenderer.send('update-site-notes', this.props.site.id, this.state.notes);
	}

	fetchSiteNotes() {

		const notes = this.props.site.notes;

		if (!notes) {
			return [];
		}

		for (const [noteIndex, note] of notes.entries()) {
			if (note.date instanceof Date || !note.date) {
				continue;
			}

			notes[noteIndex].date = new Date(note.date);
		}

		return notes;

	}

	addNote(body) {

		const notes = this.state.notes.concat([{
			date: new Date(),
			body,
			pinned: false,
			editing: false,
		}]);

		this.setState({
			notes,
			textareaValue: '',
			addNewOpen: false,
		}, this.syncNotesToSite);

	}

	openAddNew() {

		this.setState({
			addNewOpen: true,
		}, () => {
			this.textareaRef.current.focus();
		});

	}

	toggleAddNew() {

		if (this.state.addNewOpen) {
			return this.setState({
				addNewOpen: false,
			});
		}

		this.openAddNew();

	}

	onTextareaChange(event) {
		this.setState({
			textareaValue: event.target.value,
		});
	}

	onTextareaKeyPress(event) {

		if (event.key !== 'Enter' || event.altKey || event.shiftKey) {
			return;
		}

		event.preventDefault();

		this.addNote(this.state.textareaValue);

	}

	onDeleteNote(note) {

		confirm({
			title: 'Are you sure you want to delete this note?',
			buttonText: 'Delete Note',
			topIconColor: 'Orange',
		}).then(() => {
			const notes = this.state.notes;
			const noteIndex = notes.indexOf(note);

			if (noteIndex === -1) {
				return;
			}

			notes.splice(noteIndex, 1);

			this.setState({
				notes,
			}, this.syncNotesToSite);
		});

	}

	onEditNote(note) {

		const notes = this.state.notes;
		const noteIndex = this.state.notes.indexOf(note);

		if (noteIndex === -1) {
			return;
		}

		// switch edit mode
		notes[noteIndex].editing = true;

		// todo set autofocus on textarea (like textareaRef)

		this.setState({
			notes,
		}, this.syncNotesToSite);

	}

	onSaveNote(note) {

		const notes = this.state.notes;
		const noteIndex = this.state.notes.indexOf(note);

		if (noteIndex === -1) {
			return;
		}

		// switch edit mode
		notes[noteIndex].editing = false;

		this.setState({
			notes,
		}, this.syncNotesToSite);

	}

	onChangeBodyNote(note, event) {

		const notes = this.state.notes;
		const noteIndex = this.state.notes.indexOf(note);

		if (noteIndex === -1) {
			return;
		}

		// switch edit mode
		notes[noteIndex].body = event.target.value;

	}

	onPinNote(note) {

		const notes = this.state.notes;
		const noteIndex = this.state.notes.indexOf(note);

		if (noteIndex === -1) {
			return;
		}

		notes[noteIndex].pinned = !this.state.notes[noteIndex].pinned;

		this.setState({
			notes,
		}, this.syncNotesToSite);

	}

	getNotesInOrder() {

		const notes = this.state.notes.slice(0);

		if (this.state.promotePinned) {
			return notes.sort((a, b) => {
				if (a.pinned && !b.pinned) {
					return -1;
				} else if (!a.pinned && b.pinned) {
					return 1;
				}

				return b.date - a.date;
			});
		}

		return notes.sort((a, b) => b.date - a.date);

	}

	renderNotes() {

		if (!this.state.notes || !this.state.notes.length) {
			return !this.state.addNewOpen && <EmptyArea border={false}>
				No notes added<br />
				to this site<br /><br />
				<Button className="--GrayOutline" onClick={this.openAddNew}>+ Add Note</Button>
			</EmptyArea>;
		}

		return this.getNotesInOrder().map((note) => (
			<Note key={note.date.toJSON()} date={note.date} body={note.body}
				pinned={note.pinned} onPin={() => this.onPinNote(note)}
				editing={note.editing} onEdit={() => this.onEditNote(note)} onSave={() => this.onSaveNote(note)}
				onChangeBody={(event) => this.onChangeBodyNote(note, event)} onDelete={() => this.onDeleteNote(note)} />
		));

	}

	pinnedNotesCount() {
		return this.state.notes.filter((note) => note.pinned).length;
	}

	renderButtons() {

		return <Fragment>
			<span onClick={() => this.setState({ promotePinned: !this.state.promotePinned })}
				className={classnames('PromotePinned', { '--Enabled': this.state.promotePinned })}>
				<svg>
					<use href={`file://${path.resolve(__filename, '../../assets/pin.svg')}#pin`} />
				</svg>
				{this.pinnedNotesCount() ? <strong>{this.pinnedNotesCount()}</strong> : ''}
			</span>

			<span onClick={this.toggleAddNew} className="InnerPaneSidebarHeaderButtons_Add">
				<svg viewBox="0 0 24 24">
					<use href={`file://${path.resolve(__filename, '../../assets/add.svg')}#add`} />
				</svg>
			</span>
		</Fragment>;

	}

	render() {

		return <InnerPaneSidebar className={classnames({ '__AddNewOpen': this.state.addNewOpen })}>
			<InnerPaneSidebarHeader title="Notes">
				{this.renderButtons()}
			</InnerPaneSidebarHeader>

			<InnerPaneSidebarAddNew>
				<textarea placeholder="Add a note..." value={this.state.textareaValue} onChange={this.onTextareaChange}
					ref={this.textareaRef}
					onKeyPress={this.onTextareaKeyPress} />

				<p className="FormattingHelp">
					<a href="https://en.wikipedia.org/wiki/Markdown#Example"><strong>Markdown</strong></a> supported
				</p>
			</InnerPaneSidebarAddNew>

			<InnerPaneSidebarContent>
				{this.renderNotes()}
			</InnerPaneSidebarContent>
		</InnerPaneSidebar>;

	}

}
