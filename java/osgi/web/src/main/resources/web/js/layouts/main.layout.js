define(['jquery', 'backbone', 'marionette', 'text!templates/main/main.template.html', 'js/views/editor/editor.view', 'js/views/console/console.view', 'js/views/explorer/file.explorer.view'], function($, Backbone, Marionette, MainTemplate, EditorView, ConsoleView, FileExplorerView) {
	MainLayout = Backbone.Marionette.Layout.extend({
		template : MainTemplate,

		regions : {
			editor : "#editorRegion",
			terminal : "#terminalRegion",
			menu : "#menu",
			fileTree : '#fileTreeRegion'
		},

		onRender : function() {
			vent = this.options.vent;
			user = this.options.user;
			this.fileTree.show(new FileExplorerView({
				vent : vent,
				user : user
			}));
			this.editor.show(new EditorView({
				vent : vent
			}));
			//this.terminal.show(new ConsoleView());
		}
	});

	return MainLayout;
});
