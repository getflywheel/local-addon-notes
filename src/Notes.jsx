import {
	InnerPaneSidebar,
	InnerPaneSidebarHeader,
	InnerPaneSidebarAddNew,
	InnerPaneSidebarContent
} from 'local/renderer/components/InnerPaneSidebar';

import EmptyArea from 'local/renderer/components/EmptyArea';
import Button from 'local/renderer/components/Button';
import React, {Component, Fragment} from 'local/node_modules/react';
import Note from './Note';
import classnames from 'classnames';
import {ipcRenderer} from 'electron';

export default class Notes extends Component {

	constructor(props) {

		super(props);

		this.state = {
			promotePinned: false,
			notes: this.fetchSiteNotes(),
			textareaValue: '',
			addNewOpen: false,
		};

		this.textareaRef = React.createRef();

		this.onTextareaChange = this.onTextareaChange.bind(this);
		this.onTextareaKeyPress = this.onTextareaKeyPress.bind(this);
		this.openAddNew = this.openAddNew.bind(this);
		this.toggleAddNew = this.toggleAddNew.bind(this);

	}

	componentWillReceiveProps(previousProps) {

		if (previousProps.site.id !== this.props.site.id) {
			this.setState({
				notes: this.fetchSiteNotes(),
			});
		}

	}

	syncNotesToSite() {
		ipcRenderer.send('update-site-notes', this.props.site.id, this.state.notes);
	}

	fetchSiteNotes () {

		const notes = this.props.site.notes;

		if (!notes) {
			return [];
		}

		for ( const [noteIndex, note] of notes.entries() ) {
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

	toggleAddNew () {

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

		const notes = this.state.notes;
		const noteIndex = notes.indexOf(note);

		if (noteIndex === -1) {
			return;
		}

		notes.splice(noteIndex, 1);

		this.setState({
			notes,
		}, this.syncNotesToSite);

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

		return notes.sort((a, b) => {
			return b.date - a.date;
		});

	}

	renderNotes() {

		if (!this.state.notes || !this.state.notes.length) {
			return !this.state.addNewOpen && <EmptyArea border={false}>
				No notes added<br/>
				to this site<br/><br/>
				<Button className="--GrayOutline" onClick={this.openAddNew}>+ Add Note</Button>
			</EmptyArea>;
		}

		return this.getNotesInOrder().map((note) => (
			<Note key={note.date.toJSON()} date={note.date} body={note.body}
				  pinned={note.pinned} onDelete={() => this.onDeleteNote(note)} onPin={() => this.onPinNote(note)}/>
		));

	}

	pinnedNotesCount() {
		return this.state.notes.filter((note) => note.pinned).length;
	}

	renderButtons() {

		return <Fragment>
			<span onClick={() => this.setState({promotePinned: !this.state.promotePinned})}
				  className={classnames('PromotePinned', {'--Enabled': this.state.promotePinned})}>
				<svg>
					<use href={`file://${path.resolve(__filename, '../../assets/pin.svg')}#pin`}/>
				</svg>
				{this.pinnedNotesCount() ? <strong>{this.pinnedNotesCount()}</strong> : ''}
			</span>

			<span onClick={this.toggleAddNew} className="Add">
				<svg viewBox="0 0 24 24">
					<use href={`file://${path.resolve(__filename, '../../assets/add.svg')}#add`}/>
				</svg>
			</span>
		</Fragment>;

	}

	render() {

		return <InnerPaneSidebar className={classnames({ '--AddNewOpen': this.state.addNewOpen })}>
			<InnerPaneSidebarHeader title="Notes">
				{this.renderButtons()}
			</InnerPaneSidebarHeader>

			<InnerPaneSidebarAddNew>
				<textarea placeholder="Add a note..." value={this.state.textareaValue} onChange={this.onTextareaChange}
						  ref={this.textareaRef}
						  onKeyPress={this.onTextareaKeyPress}/>

				<p className="FormattingHelp">
					<a href="#"><strong>Markdown</strong></a> supported
				</p>
			</InnerPaneSidebarAddNew>

			<InnerPaneSidebarContent>
				{this.renderNotes()}
			</InnerPaneSidebarContent>
		</InnerPaneSidebar>;

	}

}

