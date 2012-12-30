define(['backbone'], function(Backbone) {
	var UserModel = Backbone.Model.extend({
		url : URL + 'auth',
		defaults : {
			id : '',
			email : '',
			password : '',
			title : '',
			name : '',
			surname : '',
			accessLevel : '',
			registrationTime : ''
		},
	});
	return UserModel;
});
