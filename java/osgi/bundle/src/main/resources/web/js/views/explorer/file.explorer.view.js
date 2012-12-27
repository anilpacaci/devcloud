define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/explorer/file.explorer.template.html', 'filetree', 'jquery_cookie'], function($, Backbone, Marionette, ace, FileExplorerTemplate) {
	var FileExplorerView = Marionette.ItemView.extend({
		template : FileExplorerTemplate,
		className : '',
		onRender : function() {
			vent = this.options.vent;
			this.$('#fileTree').fileTree({
				root : $.cookie('username'),
				script : 'http://localhost:8080/devcloud/fileExplorer',
				expandSpeed : 1000,
				collapseSpeed : 1000,
				multiFolder : false
			}, function(file) {
				alert('click');
				alert(file);
			});

		}
	});
	return FileExplorerView;
});
