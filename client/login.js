Accounts.onLogin(function(result) {
	console.log("onLogin", Meteor.user(), result);

	if (tasksByOwner) {
		tasksByOwner.change(Meteor.userId().valueOf());
	}
});
