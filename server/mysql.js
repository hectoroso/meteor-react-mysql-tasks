var liveDb = new LiveMysql(Meteor.settings.mysql);

var closeAndExit = function() {
	liveDb.end();
	process.exit();
};

// Close connections on hot code push
process.on('SIGTERM', closeAndExit);

// Close connections on exit (ctrl + c)
process.on('SIGINT', closeAndExit);

Meteor.publish('tasks-mysql', function(){
	return liveDb.select(
		'SELECT * FROM tasks',
		[ { table: 'tasks' } ]
	);
});

Meteor.publish('tasks-by-owner', function(owner) {
	return liveDb.select(
		'SELECT * FROM tasks WHERE owner = ' + liveDb.db.escape(owner),
		[
			{ 
				table: 'tasks',
				condition: function(row, newRow) {
					return row.owner === owner || (newRow && newRow.owner === owner);
				}
			} 
		]
	);
});

Meteor.publish('tasks-hide-completed', function(hide) {
	console.log("mysql.js", "tasks-hide-completed()", hide);
	var query = 'SELECT * FROM tasks';
	
	if (hide) {
		query += ' WHERE checked != 1';
	}
	
	return liveDb.select(
		query,
		[
			{ 
				table: 'tasks'
			} 
		]
	);
});

Meteor.publish('tasks-hide-completed-params', function(hide) {
	console.log("mysql.js", "tasks-hide-completed-params()", hide);
	
	var checked = hide ? 0 : 1;
	
	// This just toggles between completed and not at this point, 
	// just trying to get queries to work before getting the logic down
	return liveDb.select(
		'SELECT * FROM tasks WHERE checked != ' + liveDb.db.escape(checked),
		[
			{ 
				table: 'tasks' ,
				condition: function(row, newRow) {
					return row.checked === checked || (newRow && newRow.checked === checked);
				}
			} 
		]
	);
});

Meteor.methods({
	addTaskMysql(text, username, owner) {
		console.log("mysql.js", "addTaskMysql()", text, username, owner);
		/*
		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		*/
		liveDb.db.query('insert into tasks (text, username, owner, createdAt) values (?, ?, ?, ?)', [text, username, owner, new Date()]);
	},
	
	removeTaskMysql(taskId) {
		/*
		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can delete it
			throw new Meteor.Error("not-authorized");
		}
		*/
		liveDb.db.query('delete from tasks where id = ?', [taskId]);
	},

	setCheckedMysql(taskId, setChecked) {
		/*
		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can check it off
			throw new Meteor.Error("not-authorized");
		}
		*/
		liveDb.db.query('update tasks set checked = ? where id = ?', [(setChecked ? 1 : 0), taskId]);
	},
	
	setPrivateMysql(taskId, setToPrivate) {
		/*
		const task = Tasks.findOne(taskId);
		// Make sure only the task owner can make a task private
		if (task.owner !== Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		*/
		liveDb.db.query('update tasks set private = ? where id = ?', [(setToPrivate ? 1 : 0), taskId]);
	}
});
