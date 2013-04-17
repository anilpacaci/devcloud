define(['backbone'], function(Backbone) {
	var ConfigurationModel = Backbone.Model.extend({
		url : URL + 'configuration',
		defaults : {
			id : '',
			themeName : ''
		},
	});
	return ConfigurationModel;
});
