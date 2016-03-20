App = React.createClass({
	
	mixins: [ReactMeteorData],
	
	getInitialState() {
		return {
			hideCompleted: false
		}
	},

	componentDidMount() {
		
		// Is this the right place in the lifecycle to do this, 
		// for when user has already logged in?
		if (Meteor.user()) {
			tasks.change(Meteor.userId().valueOf(), this.state.hideCompleted);
		}
	},

	getMeteorData() {

		// If I uncomment the following line, an exception results, see below. Does this belong in this method?
		// If not, where do I pass parameters to the subscription? With Mongo it would be here.

		//var tasks = new MysqlSubscription('tasks', Meteor.userId().valueOf(), this.state.hideCompleted);

		/*
			Exception from Tracker recompute function:
			debug.js:41 Error: Subscription failed!
			    at Array.MysqlSubscription (MysqlSubscription.js:40)
			    at React.createClass.getMeteorData (app.jsx:19)
			    at meteor-data-mixin.jsx:89
			    at Tracker.Computation._compute (tracker.js:323)
			    at new Tracker.Computation (tracker.js:211)
			    at Object.Tracker.autorun (tracker.js:562)
			    at meteor-data-mixin.jsx:76
			    at Object.Tracker.nonreactive (tracker.js:589)
			    at MeteorDataManager.calculateData (meteor-data-mixin.jsx:75)
			    at ReactMeteorData.componentWillUpdate (meteor-data-mixin.jsx:22)
			    
			I'm unclear as to where MysqlSubscription should go in a React app
		*/
		
		return {
			tasks: tasks.reactive(),
			ready: tasks.ready(),

			currentUser: Meteor.user()
		};
	},

	renderTasks(tasks) {
		if (!this.data.tasks) {
			return "";
		}
		
		return this.data.tasks.map((task, index) => {
			const currentUserId = this.data.currentUser && this.data.currentUser._id;
			const showPrivateButton = task.owner === currentUserId;

			return <Task 
				key={index} 
				task={task} 
				showPrivateButton={showPrivateButton} />;
		});
	},
	
	handleSubmit(event) {
		event.preventDefault();
		
		// Find the text field via the React ref
		var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
		
		console.log(this.constructor.displayName, "handleSubmit()", text, Meteor.user().username, Meteor.userId().valueOf());

		Meteor.call("addTaskMysql", text, Meteor.user().username, Meteor.userId().valueOf());

		// Clear form
		ReactDOM.findDOMNode(this.refs.textInput).value = "";
	},

	toggleHideCompleted() {
		var hidden = !this.state.hideCompleted;
		console.log(this.constructor.displayName, "toggleHideCompleted()", hidden);
		
		tasks.change(Meteor.userId().valueOf(), hidden);
		
		this.setState({
			hideCompleted: hidden
		});
	},

	render() {
		console.log(this.constructor.displayName, "render()", Meteor.userId(), this.data);
		
		return (
			<div className="container">
				<header>
					<h1>Todo Lists ({this.data.incompleteCount ? this.data.incompleteCount : 0})</h1>

					<label className="hide-completed">
						<input 
							type="checkbox" 
							readOnly={true} 
							checked={this.state.hideCompleted} 
							onClick={this.toggleHideCompleted} />
						Hide Completed Tasks
					</label>

					<AccountsUIWrapper />
					
					{ this.data.currentUser ?
						<form className="new-task" onSubmit={this.handleSubmit} >
							<input 
								type="text" 
								ref="textInput" 
								placeholder="Type to add new tasks" />
						</form> : ''
					}
				</header>
 
				{this.renderTasks()}
			</div>
		);
	}
});

