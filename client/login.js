Accounts.onLogin(function(result) {
	tasks.change(Meteor.userId().valueOf(), false);
});
