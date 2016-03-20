// Where should these go? Here for testing

// Usage 1
tasksAll = new MysqlSubscription('tasks-mysql');

// Usage 2
tasksHideCompleted = new MysqlSubscription('tasks-hide-completed', false);
//tasksHideCompleted = new MysqlSubscription('tasks-hide-completed-params');

// Usage 3
tasksByOwner = new MysqlSubscription('tasks-by-owner');


// App component - represents the whole app
App = React.createClass({
	
	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],
	
	getInitialState() {
		return {
			hideCompleted: false
		}
	},

	componentDidMount() {
		if (Meteor.user() && tasksByOwner) {
			tasksByOwner.change(Meteor.userId().valueOf());
		}
	},

	// Loads items from the Tasks collection and puts them on this.data.tasks
	getMeteorData() {

		/*
			If comment out subscriptions at top and uncomment either of the following lines, we get:
			
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
		
		// Usage 2: 		
		//var tasksHideCompleted = new MysqlSubscription('tasks-hide-completed', this.state.hideCompleted);
		
		// Usage 3: 		
		//var tasksByOwner = new MysqlSubscription('tasks-by-owner', Meteor.user().username);

		return {
			// Usage 1: global tasksAll, which returns all rows. Works fine.
			tasks: tasksAll.reactive(),
			ready: tasksAll.ready(),

			// Usage 2: limit rows by completed/checked flag.
			tasksHideCompleted: tasksHideCompleted.reactive(),
			readyHideCompleted: tasksHideCompleted.ready(),
			
			// Usage 3: limit rows by meteor user
			tasksByOwner: tasksByOwner.reactive(),
			readyByOwner: tasksByOwner.ready(),

			currentUser: Meteor.user()
		};
	},

	renderTasks(tasks) {
		if (!tasks) {
			return "";
		}
		
		// Get tasks from this.data.tasks
		return tasks.map((task, index) => {
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
		
		// ISSUE: This works once, then won't toggle
		if (tasksHideCompleted) {
			tasksHideCompleted.change(hidden);
		}
		
		this.setState({
			hideCompleted: hidden
		});
	},

	render() {
		console.log(this.constructor.displayName, "render()", Meteor.userId(), this.data);
		
		// Usage 1
		var tasksAll = "";
		if (this.data.tasks) {
			tasksAll = (
				<div>
					<h4>All Tasks</h4>
					<ul>
						{this.renderTasks(this.data.tasks)}
					</ul>
				</div>
			);
		}

		// Usage 2
		var tasksFilteredByCompleteness = "";
		if (this.data.tasksHideCompleted) {
			tasksFilteredByCompleteness = (
				<div>
					<h4>Filtered by Completeness</h4>
					<ul>
						{this.renderTasks(this.data.tasksHideCompleted)}
					</ul>
				</div>
			);
		}

		// Usage 3
		var tasksFilteredByOwner = "";
		if (this.data.tasksByOwner) {
			tasksFilteredByOwner = (
				<div>
					<h4>Filtered by Owner</h4>
					<ul>
						{this.renderTasks(this.data.tasksByOwner)}
					</ul>
				</div>
			);
		}
		
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
 
				{tasksAll}
				{tasksFilteredByCompleteness}
				{tasksFilteredByOwner}
			</div>
		);
	}
});

