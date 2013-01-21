define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/explorer/file.explorer.template.html', 'js/models/editor/file.model', 'js/views/editor/editor.view', 'filetree', 'jquery_cookie'], function($, Backbone, Marionette, ace, FileExplorerTemplate, FileModel, EditorView) {
	var FileExplorerView = Marionette.ItemView.extend({
		template : FileExplorerTemplate,
		className : '',
		onRender : function() {
			vent = this.options.vent;
			user = this.options.user;
			this.$('#fileTree').fileTree({
				root : user.get('email'),
				script : 'http://localhost:8080/devcloud/fileExplorer',
				expandSpeed : 1000,
				collapseSpeed : 1000,
				multiFolder : false
			}, function(filePath) {

				file = new FileModel({
					path : filePath
				});
				file.fetch({
					async : false
				});
				fileName = file.get('fileName').split('.')[0];

				if ($('#terminalRegion' + fileName).size() == 0) {
					$('#tabs').append('<li class><a href="#terminalRegion' + fileName + '" data-toggle="tab">' + file.get('fileName') + '<i class="icon-remove"></i></a></li>');
					$('#tab_content').append('<div class="tab-pane fade" id="terminalRegion' + fileName + '"></div>');

					var editorView = new EditorView({
						vent : vent,
						user : user,
						model : file,
					});
					editorView.render();
					$('#terminalRegion' + fileName).append(editorView.el);
				}
			});

		}
	});
	return FileExplorerView;
});
