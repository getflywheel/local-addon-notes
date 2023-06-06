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

/**
 * @typedef {{
*   body: string,
*   date: Date,
*   editing: boolean,
*   pinned: boolean,
* }} NoteData
* */

// The Note editor can be in these states...
const EDITOR_STATES = {
	IDLE: 'idle',
	ADDING_NEW: 'adding-new',
	EDITING_EXISTING: 'editing-existing',
};

export default class Notes extends Component {

	constructor(props) {

		super(props);

		/** @type {NoteData[]} */
		const notes = this.fetchSiteNotes();

		this.state = {
			promotePinned: false,
			notes,
			textareaValue: '',
			editorState: EDITOR_STATES.IDLE,
			editingNoteIndex: null,
		};

		this.textareaRef = React.createRef();

		this.onTextareaChange = this.onTextareaChange.bind(this);
		this.onTextareaKeyPress = this.onTextareaKeyPress.bind(this);
		this.onAddNoteOrCloseEditorClick = this.onAddNoteOrCloseEditorClick.bind(this);
		this.onEditNoteClick = this.onEditNoteClick.bind(this);

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
		}]);

		this.setState({
			notes,
			textareaValue: '',
			editorState: EDITOR_STATES.IDLE,
		}, this.syncNotesToSite);

	}

	updateNote(body) {

		const /** @type {number} */ editingNoteIndex = this.state.editingNoteIndex;
		const notes = this.state.notes.map((note, i) => {
			if (i !== editingNoteIndex) return note;
			return {
				...note,
				body,
			};
		});

		this.setState({
			notes,
			textareaValue: '',
			editorState: EDITOR_STATES.IDLE,
		}, this.syncNotesToSite);

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

		if (this.state.editorState === EDITOR_STATES.ADDING_NEW) {
			this.addNote(this.state.textareaValue);
			return;
		}

		if (this.state.editorState === EDITOR_STATES.EDITING_EXISTING) {
			this.updateNote(this.state.textareaValue);
			return;
		}

		console.log('Unexpected - User clicked Enter while note editor is open and previous code has not handled this case.');
		console.log({ state: this.state, event });
		console.log('-----\n');


	}

	onAddNoteOrCloseEditorClick() {
		// NOTE:
		// In the UI the "Add New Note" button and the "Cancel Editing Note" are the same
		// DOM node, and on click this function is invoke.
		// TODO: migrate to two separate button if possible

		// if was open and adding new...
		if (this.state.editorState === EDITOR_STATES.ADDING_NEW) {
			this.setState({
				editorState: EDITOR_STATES.IDLE,
			});
			return;
		}

		// if was open and editing existing...
		if (this.state.editorState === EDITOR_STATES.EDITING_EXISTING) {
			this.setState({
				editorState: EDITOR_STATES.IDLE,
				textareaValue: '',
			});
			return;
		}

		// otherwsise...
		this.setState({
			editorState: EDITOR_STATES.ADDING_NEW,
		}, () => {
			this.textareaRef.current.focus();
		});
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

	onEditNoteClick(/** @type {NoteData} */ note) {

		const noteIndex = this.state.notes.findIndex(n => n.date === note.date);
		if (noteIndex === -1) {
			throw new Error('Unexpected - User clikcke on "Edit" Note but the note is not in the app state! Plase inpsect the code! This must never happens!');
		}

		this.setState({
			editorState: EDITOR_STATES.EDITING_EXISTING,
			editingNoteIndex: noteIndex,
			textareaValue: note.body ?? '',
		});
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
			if (this.state.editorState === EDITOR_STATES.IDLE) return (
				<EmptyArea border={false}>
					No notes added<br />
					to this site<br /><br />
					<Button className="--GrayOutline" onClick={this.onAddNoteOrCloseEditorClick}>+ Add Note</Button>
				</EmptyArea>
			);
		}

		return this.getNotesInOrder().map((note) => (
			<Note
				key={note.date.toJSON()}
				date={note.date}
				body={note.body}
				pinned={note.pinned}
				onDelete={() => this.onDeleteNote(note)}
				onPin={() => this.onPinNote(note)}
				onEdit={() => this.onEditNoteClick(note)}
			/>
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

			<span onClick={this.onAddNoteOrCloseEditorClick} className="InnerPaneSidebarHeaderButtons_Add">
				<svg viewBox="0 0 24 24">
					<use href={`file://${path.resolve(__filename, '../../assets/add.svg')}#add`} />
				</svg>
			</span>
		</Fragment>;

	}

	renderEditor() {
		return (
			<Fragment>
				<textarea
					placeholder="Add a note..."
					value={this.state.textareaValue}
					onChange={this.onTextareaChange}
					ref={this.textareaRef}
					onKeyPress={this.onTextareaKeyPress}
				/>

				<p className="FormattingHelp">
					<a href="https://en.wikipedia.org/wiki/Markdown#Example"><strong>Markdown</strong></a> supported
				</p>
			</Fragment>
		);
	}

	render() {

		return <InnerPaneSidebar className={classnames({ '__AddNewOpen': this.state.editorState !== EDITOR_STATES.IDLE })}>
			<InnerPaneSidebarHeader title="Notes">
				{this.renderButtons()}
			</InnerPaneSidebarHeader>

			<InnerPaneSidebarAddNew>
				{this.renderEditor()}
			</InnerPaneSidebarAddNew>

			<InnerPaneSidebarContent>
				{this.renderNotes()}
			</InnerPaneSidebarContent>
		</InnerPaneSidebar>;

	}

}
