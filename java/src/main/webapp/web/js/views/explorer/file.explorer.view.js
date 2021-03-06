define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/explorer/file.explorer.template.html', 'js/models/editor/file.model', 'js/views/editor/editor.view', 'filetree', 'jquery_cookie'], function($, Backbone, Marionette, ace, FileExplorerTemplate, FileModel, EditorView) {
	var FileExplorerView = Marionette.ItemView.extend({
		template : FileExplorerTemplate,
		className : '',
		initialize : function() {
			var self = this;
			this.bindTo(this.options.vent, 'explorer:open', function(filePath) {
				//self.openFile(filePath);
			});
		},
		onRender : function() {
			vent = this.options.vent;
			user = this.options.user;
			configuration = this.options.configuration;
			this.$('#fileTree').fileTree({
				root : user.get('email'),
				script : URL + 'fileExplorer',
				expandSpeed : 500,
				collapseSpeed : 1000,
				multiFolder : false
			}, this.openFile);

		},
		openFile : function(filePath) {

				file = new FileModel({
					path : filePath
				});
				file.fetch({
					async : false
				});
				fileName = file.get('fileName').split('.')[0];

				if ($('#editorRegion' + fileName).size() == 0) {
					$('#tabs').append('<li class><a href="#editorRegion' + fileName + '" data-toggle="tab">' + file.get('fileName') + ' <i class="icon-remove"></i></a></li>');
					$('#tab_content').append('<div class="tab-pane fade" id="editorRegion' + fileName + '"></div>');

					var editorView = new EditorView({
						vent : vent,
						user : user,
						configuration : configuration,
						model : file,
						socket : socket
					});
					editorView.render();
					$('#editorRegion' + fileName).append(editorView.el);
					$('#tabs a:last').tab('show');
				}
			}
	});
	return FileExplorerView;
});
