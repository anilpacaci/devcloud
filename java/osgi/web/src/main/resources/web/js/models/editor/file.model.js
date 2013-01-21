define(['jquery', 'backbone', 'ace'], function($, Backbone, Ace) {
	var FileModel = Backbone.Model.extend({
		defaults : {
			fileName : '',
			content : ''
		},
		url : function() {
			return "http://localhost:8080/devcloud/fileResource"
		}
	});

	return FileModel;
});
