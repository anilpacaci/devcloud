define(['backbone', 'js/models/auth/organization.model'], function(Backbone, OrganizationModel) {
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
			affiliation : '',
			registrationTime : ''
		},
	});
	return UserModel;
});
