define(['jquery', 'backbone', 'marionette', 'text!templates/main/main.template.html', 'js/views/editor/editor.view', 'js/views/console/console.view', 'js/views/explorer/file.explorer.view'], function($, Backbone, Marionette, MainTemplate, EditorView, ConsoleView, FileExplorerView) {
	MainLayout = Backbone.Marionette.Layout.extend({
		template : MainTemplate,

		regions : {
			editor : "#editorRegion",
			// terminal : "#terminalRegion",
			menu : "#menu",
			fileTree : '#fileTreeRegion',
			// tabs : '#tabs'
		},

		events : {
			'shown a[data-toggle="tab"]' : 'tabShown',
			'click a[id="new_terminal_button"]' : 'addNewTerminal',
			'click .icon-remove' : 'removeTab'
		},

		onRender : function() {
			vent = this.options.vent;
			user = this.options.user;
			socket = this.options.socket;
			this.fileTree.show(new FileExplorerView({
				vent : vent,
				user : user
			}));
			this.editor.show(new EditorView({
				vent : vent
			}));
			this.terminal_count = 0;

			this.bindTo(vent, 'main:logout', function() {
				vent.trigger('terminal:unfocused');
				vent.trigger('terminal:destroy');
			})
			// this.terminal.show(new ConsoleView({
			// 	vent : vent,
			// 	user : user,
			// 	socket : socket
			// }));
		},

		tabShown : function(e) {
			if (e.target.hash.slice(0, e.target.hash.length - 1) == '#terminalRegion') {
				this.options.vent.trigger('terminal:focused', e.target.hash[e.target.hash.length - 1]);
			} else {
				this.options.vent.trigger('terminal:unfocused');
			}
		},

		addNewTerminal : function(e) {
			if (this.terminal_count < 5) {
				$('#tabs').append('<li class><a href="#terminalRegion' + this.terminal_count + '" data-toggle="tab">Terminal ' + this.terminal_count + '</a></li>');
				$('#tab_content').append('<div class="tab-pane fade" id="terminalRegion' + this.terminal_count + '"></div>');

				var consoleView = new ConsoleView({
					vent : vent,
					user : user,
					socket : socket,
					id : this.terminal_count
				});
				consoleView.render();
				$('#terminalRegion' + this.terminal_count).append(consoleView.el);
				this.terminal_count++;
			} else {
				alert("You can not create more than 5 terminals.")
			}
		},
		removeTab : function(e) {
			var id = $(e.currentTarget).parent().attr('href');
			$(e.currentTarget).parent().remove();
			$('#' + id).remove();
		}
	});

	return MainLayout;
});
