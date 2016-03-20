var liveDb = new LiveMysql(Meteor.settings.mysql);

var closeAndExit = function() {
	liveDb.end();
	process.exit();
};

// Close connections on hot code push
process.on('SIGTERM', closeAndExit);

// Close connections on exit (ctrl + c)
process.on('SIGINT', closeAndExit);

Meteor.publish('tasks', function(owner, hide) {
	var query = 'SELECT * FROM tasks WHERE (private != 1 OR owner = ' + liveDb.db.escape(owner) + ")";
	
	if (hide) {
		query += ' AND checked != 1';
	}
	
	return liveDb.select(
		query,
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

Meteor.methods({
	addTaskMysql(text, username, owner) {
		console.log("mysql.js", "addTaskMysql()", text, username, owner);
		// Make sure the user is logged in before inserting a task
		if (! Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}
		
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
