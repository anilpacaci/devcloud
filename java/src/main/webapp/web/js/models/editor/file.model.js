define(['jquery', 'backbone', 'ace'], function($, Backbone, Ace) {
	var FileModel = Backbone.Model.extend({
		defaults : {
			fileName : '',
			content : '',
			path : '',
			uuid : ''
		},
		url : function() {
			return URL + "fileResource?path=" + this.get('path');
		},
		initialize : function() {
			var array = this.get('path').split('/');
			this.set('fileName', array[array.length - 1]);
		}
	});

	return FileModel;
});

