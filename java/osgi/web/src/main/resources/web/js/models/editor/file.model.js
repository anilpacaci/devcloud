define(['jquery', 'backbone', 'ace'], function($, Backbone, Ace) {
	var FileModel = Backbone.Model.extend({
		defaults : {
			fileName : '',
			content : '',
			path : ''
		},
		url : function() {
			return "http://localhost:8080/devcloud/fileResource?path=" + this.get('path');
		},
		initialize : function() {
			var array = this.get('path').split('/');
			this.set('fileName', array[array.length - 1]);
		}
	});

	return FileModel;
});
