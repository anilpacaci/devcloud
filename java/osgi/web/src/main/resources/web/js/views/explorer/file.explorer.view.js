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
				alert('click');
				alert(filePath);

				file = new FileModel({
					fileName : filePath
				});
				file.fetch();

				$('#tabs').append('<li class><a href="#terminalRegion' + file.get('fileName') + '" data-toggle="tab">' + file.get('fileName') + '</a></li>');
				$('#tab_content').append('<div class="tab-pane fade" id="terminalRegion' + file.get('fileName') + '"></div>');

				var editorView = new Editorview({
					vent : vent,
					user : user,
					model : file,
				});
				editorView.render();
				$('#terminalRegion' + file.get('fileName')).append(editorView.el);
			});

		}
	});
	return FileExplorerView;
});
