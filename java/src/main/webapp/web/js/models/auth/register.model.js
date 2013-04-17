define(['backbone'], function(Backbone) {
	var RegisterModel = Backbone.Model.extend({
		defaults: {
			firstName: "",
			lastName: "",
			email: "",
			password: ""
		}
	});
	return RegisterModel;
});