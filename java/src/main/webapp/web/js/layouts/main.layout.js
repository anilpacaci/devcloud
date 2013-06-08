define(['jquery', 'backbone', 'marionette', 'text!templates/main/main.template.html', 'js/models/editor/file.model', 'js/views/editor/editor.view', 'js/views/console/console.view', 'js/views/explorer/fuelux.tree.view', 'js/views/global/global.view'], function($, Backbone, Marionette, MainTemplate, FileModel, EditorView, ConsoleView, FueluxTreeView, GlobalView) {
	MainLayout = Backbone.Marionette.Layout.extend({
		template : MainTemplate,

		regions : {
			editor : "#editorRegion",
			// terminal : "#terminalRegion",
			//		menu : "#menu",
			fileTree : '#fileTreeRegion',
			//		topMenu : "#menu"
			// tabs : '#tabs'
		},

		events : {
			'shown a[data-toggle="tab"]' : 'tabShown',
			'click a[id="new_terminal_button"]' : 'addNewTerminal',
			'click .icon-remove' : 'removeTab',
			'click .icon-check' : 'saveFile',
			'click #menuNewFile' : 'newFile',
			//	'click #menuNewFile' : 'testAlert',
			'click #menuSave' : 'saveFile',
			'click #menuSaveAll' : 'saveAllFiles',
			'click #menuClose' : 'menuRemoveTab',
			'click #sidebarChange a' : 'sidebarChange',
			'click #menuUndo' : 'menuUndo',
			'click #menuRedo' : 'menuRedo',
			'click #menuCut' : 'menuCut',
			'click #menuCopy' : 'menuCopy',
			'click #menuPaste' : 'menuPaste',
			'click #menuFindReplace' : 'menuFindReplace',
			'click #menuFindReplaceAll' : 'menuFindReplaceAll',
			'click #menuOpenNewTerminal' : 'addNewTerminal',
			'click #menuRun' : 'run',
			'click #saveOptionsButton' : 'saveOptions',
			'change #themeSelector' : 'themeSelected',
			'click #menuDebug' : 'debug',
			'click #menuClone' : 'menuClone',
			'click #menuPull' : 'menuPull',
			'click #menuPush' : 'menuPush',
			'click #menuCommit' : 'menuCommit',
			'click #menuCheckout' : 'menuCheckout'

		},

		onRender : function() {
			vent = this.options.vent;
			user = this.options.user;
			configuration = this.options.configuration;
			socket = this.options.socket;
			this.fileTree.show(new FueluxTreeView({
				vent : vent,
				configuration : configuration,
				user : user,
				socket : socket
			}));
			/*this.editor.show(new EditorView({
			 vent : vent,
			 configuration : configuration,
			 socket : socket,
			 user : user
			 }));*/
			/*			this.menu.show(new TopMenuView({
			 vent : vent,
			 user : user,
			 socket : socket
			 }));
			 */
			this.terminal_count = 0;
			this.editor_count = 0;

			this.bindTo(vent, 'main:logout', function() {
				vent.trigger('terminal:unfocused');
				vent.trigger('process:unfocused');
				vent.trigger('process:destroy');
				vent.trigger('terminal:destroy');
			});

			var self = this;
			this.bindTo(this.options.vent, 'explorer:refresh', function(filePath) {
				self.fileTree.show(new FueluxTreeView({
					vent : vent,
					configuration : configuration,
					user : user,
					socket : socket
				}));
				self.options.vent.trigger('explorer:open', filePath);
			});
			//this event gets the file path, open this file in new editor
			this.bindTo(this.options.vent, 'file:open', function(filePath) {
				var uuid = randomUUID();
				file = new FileModel({
					path : filePath,
					uuid : uuid
				});
				file.fetch({
					async : false
				});
				fileName = file.get('fileName').split('.')[0];

				if ($('#editorRegion' + fileName).size() == 0) {
					$('#tabs').append('<li class><a href="#editorRegion' + fileName + '" data-toggle="tab" path="' + filePath + '" uuid="' + uuid + '">' + file.get('fileName') + ' <i class="icon-remove"></i></a></li>');
					$('#tab_content').append('<div class="tab-pane fade" id="editorRegion' + fileName + '" path="' + filePath + '"></div>');

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
			});
		},

		tabShown : function(e) {
			var path = $(e.target).attr('path');
			if (path) {
				// when path is changed, global update shoud be called
				this.options.vent.trigger('global:update', path);
			}
			if (e.target.hash.slice(0, e.target.hash.length - 1) == '#terminalRegion') {
				this.options.vent.trigger('terminal:focused', e.target.hash[e.target.hash.length - 1]);
				//type navigator should change to file explorer
				var mode = $('#sidebarChange a').text();
				if (mode == "Show Workspace Explorer") {
					//simulate trigger so that workspace explorer is shown
					$('#sidebarChange a').click();
				}
			} else {
				this.options.vent.trigger('terminal:unfocused');
			}
		},

		addNewTerminal : function(e) {
			if (!socket || !socket.socket.connected)
				return;
			if (this.terminal_count < 5) {
				$('#tabs').append('<li class><a href="#terminalRegion' + this.terminal_count + '" data-toggle="tab">Terminal ' + this.terminal_count + '<i class="icon-remove"></i></a></li>');
				$('#tab_content').append('<div class="tab-pane fade" id="terminalRegion' + this.terminal_count + '"></div>');

				var consoleView = new ConsoleView({
					vent : vent,
					user : user,
					socket : socket,
					id : this.terminal_count
				});
				consoleView.render();
				$('#terminalRegion' + this.terminal_count).append(consoleView.el);
				$('#tabs a:last').tab('show');
				this.terminal_count++;
			} else {
				alert("You can not create more than 5 terminals.")
			}
		},
		menuClone : function() {
			if (!selectedFile) {
				bootbox.alert("You need to select a directory to clone");
				return;
			}

			if (!socket || !socket.socket.connected)
				return;

			bootbox.prompt('Give the url to be cloned', function(url) {
				socket.emit('git:clone', {
					'path' : selectedFile,
					'url' : url
				});
				$('body').append('<div id="loading-image" class="waiting">Project is cloning to your workspace<img src="img/custom/loading.gif"></div>');
			});

			socket.on('git_finished', function(data) {
				vent.trigger('explorer:refresh', selectedFile);
				$('#loading-image').html(data.stdout + data.stderr);
				$('#loading-image').click(function() {
					$('#loading-image').fadeOut('slow', function() {
						$('#loading-image').remove();
					});
				});
			});
		},
		menuPull : function() {
			if (!selectedFile) {
				bootbox.alert("You need to select a directory to pull");
				return;
			}

			if (!socket || !socket.socket.connected)
				return;

			socket.emit('git:pull', {
				'path' : selectedFile
			});
			$('body').append('<div id="loading-image" class="waiting">Project is pulling to your workspace<img src="img/custom/loading.gif"></div>');

			socket.on('git_finished', function(data) {
				vent.trigger('explorer:refresh', selectedFile);
				$('#loading-image').html(data.stdout + data.stderr);
				$('#loading-image').click(function() {
					$('#loading-image').fadeOut('slow', function() {
						$('#loading-image').remove();
					});
				});
			});
		},
		menuPush : function() {
			if (!selectedFile) {
				bootbox.alert("You need to select a directory to push");
				return;
			}

			if (!socket || !socket.socket.connected)
				return;

			bootbox.prompt('Git-Hub Username: ', function(username) {
				bootbox.prompt('Git-Hub Password: ', function(password) {
					socket.emit('git:push', {
						'path' : selectedFile,
						'username' : username,
						'password' : password
					});
					$('body').append('<div id="loading-image" class="waiting">Changes are pushing to the server<img src="img/custom/loading.gif"></div>');
				});
			});

			socket.on('git_finished', function(data) {
				vent.trigger('explorer:refresh', selectedFile);
				$('#loading-image').html(data.stdout + data.stderr);
				$('#loading-image').click(function() {
					$('#loading-image').fadeOut('slow', function() {
						$('#loading-image').remove();
					});
				});
			});
		},
		menuCommit : function() {
			if (!selectedFile) {
				bootbox.alert("You need to select a directory to commit");
				return;
			}

			if (!socket || !socket.socket.connected)
				return;

			bootbox.prompt('Message for commit: ', function(message) {
				socket.emit('git:commit', {
					'path' : selectedFile,
					'message' : message
				});
				$('body').append('<div id="loading-image" class="waiting">Changes are commiting...<img src="img/custom/loading.gif"></div>');
			});

			socket.on('git_finished', function(data) {
				vent.trigger('explorer:refresh', selectedFile);
				$('#loading-image').html(data.stdout + data.stderr);
				$('#loading-image').click(function() {
					$('#loading-image').fadeOut('slow', function() {
						$('#loading-image').remove();
					});
				});
			});
		},
		menuCheckout : function() {
			if (!selectedFile) {
				bootbox.alert("You need to select a directory to checkout");
				return;
			}

			if (!socket || !socket.socket.connected)
				return;

			bootbox.confirm('Your local changes will be lost. Do you want to continue?', function() {
				socket.emit('git:checkout', {
					'path' : selectedFile
				});
				$('body').append('<div id="loading-image" class="waiting">Wait for checkout...<img src="img/custom/loading.gif"></div>');
			});

			socket.on('git_finished', function(data) {
				vent.trigger('explorer:refresh', selectedFile);
				$('#loading-image').html(data.stdout + data.stderr);
				if ($('#loading-image').html() == "") {
					$('#loading-image').html("Project is checked out successfully");
				}
				$('#loading-image').click(function() {
					$('#loading-image').fadeOut('slow', function() {
						$('#loading-image').remove();
					});
				});
			});
		},
		newFile : function(e) {
			var uuid = randomUUID();
			$('#tabs').append('<li class><a href="#editorRegion' + this.editor_count + '" data-toggle="tab">Untitled File ' + this.editor_count + '<i class="icon-remove"></i></a></li>');
			$('#tab_content').append('<div class="tab-pane fade" id="editorRegion' + this.editor_count + '"></div>');
			
			var file = new FileModel();
			file.set('uuid',uuid);
			
			var newEditor = new EditorView({
				vent : vent,
				configuration : configuration,
				socket : socket,
				user : user,
				model : file
			});
			newEditor.render();
			$('#editorRegion' + this.editor_count).append(newEditor.el);
			$('#tabs a:last').tab('show');
			this.editor_count++;
		},
		removeTab : function(e) {
			var id = $(e.currentTarget).parent().attr('href');
			if (id.substring(0, id.length - 1) == '#terminalRegion') {
				var terminal_id = id.substring(id.length - 1, id.length);
				this.options.vent.trigger('terminal:unfocused');
				this.options.vent.trigger('terminal:destroy', terminal_id);
				this.terminal_count--;
			} else if (id.substring(0, 'processRegion'.length + 1) == '#processRegion') {
				var process_id = id.substring('processRegion'.length + 1, id.length);
				this.options.vent.trigger('process:unfocused');
				this.options.vent.trigger('process:destroy', process_id);
			} else {
				// editor region is closed, send necessary events
				var uuid = $(e.currentTarget).parent().attr('uuid');
				this.options.vent.trigger('file:close', uuid);
			}
			$(e.currentTarget).parent().remove();
			$(id).remove();
			$('#tabs a:last').tab('show');
		},
		menuRemoveTab : function(e) {
			var id = $("ul#tabs li.active a").attr('href');
			if (id.substring(0, id.length - 1) == '#terminalRegion') {
				var terminal_id = id.substring(id.length - 1, id.length);
				this.options.vent.trigger('terminal:unfocused');
				this.options.vent.trigger('terminal:destroy', terminal_id);
			} else if (id.substring(0, 'processRegion'.length + 1) == '#processRegion') {
				var process_id = id.substring('processRegion'.length + 1, id.length);
				this.options.vent.trigger('process:unfocused');
				this.options.vent.trigger('process:destroy', process_id);
			} else {
				// editor region is closed, send necessary events
				var uuid = $("ul#tabs li.active a").attr('uuid');
				this.options.vent.trigger('file:close', uuid);
			}
			$("ul#tabs li.active").remove();
			$(id).remove();
		},
		saveFile : function(e) {
			var activeTab = $("ul#tabs li.active a").attr('uuid');
			var v = this.options.vent;
			v.trigger('file:save', activeTab);
		},
		saveAllFiles : function(e) {
			var v = this.options.vent;
			v.trigger('file:saveAll');
		},
		run : function(e) {
			var activeTab = $("ul#tabs li.active a").attr('uuid');
			var v = this.options.vent;
			v.trigger('file:run', activeTab);
		},
		debug : function(e) {
			var activeTab = $("ul#tabs li.active a").attr('uuid');
			var v = this.options.vent;
			v.trigger('file:debug', activeTab);
		},
		themeSelected : function(e) {
			this.selectedTheme = e.currentTarget.value;
		},
		saveOptions : function(e) {
			this.options.configuration.set("themeName", this.selectedTheme);
			var self = this;
			$.ajax({
				type : 'PUT',
				url : URL + 'configuration/',
				headers : {
					"Content-Type" : "application/json"
				},
				data : JSON.stringify(self.options.configuration.toJSON()),
				success : function(response) {
					$("#optionsModal").modal("hide");
				},
				error : function(error) {

				}
			});
		},
		sidebarChange : function(e) {
			var self = this;
			var mode = $(e.target).text();
			var configuration = this.options.configuration;
			if (mode == "Show Type Navigator") {
				$(e.target).text('Show Workspace Explorer');
				self.fileTree.show(new GlobalView({
					vent : vent,
					configuration : configuration,
					user : user,
					socket : socket
				}));
			} else {
				$(e.target).text('Show Type Navigator');
				self.fileTree.show(new FueluxTreeView({
					vent : vent,
					configuration : configuration,
					user : user,
					socket : socket
				}));
			}
		},
		menuUndo : function(e) {
			var v = this.options.vent;
			v.trigger('menu:undo');
		},
		menuRedo : function(e) {
			var v = this.options.vent;
			v.trigger('menu:redo');
		},
		menuCut : function(e) {
			var v = this.options.vent;
			v.trigger('menu:cut');
		},
		menuCopy : function(e) {
			var v = this.options.vent;
			v.trigger('menu:copy');
		},
		menuPaste : function(e) {
			var v = this.options.vent;
			v.trigger('menu:paste');
		},
		menuFindReplace : function(e) {
			var v = this.options.vent;
			v.trigger('menu:findReplace');
		},
		menuFindReplaceAll : function(e) {
			var v = this.options.vent;
			v.trigger('menu:findReplaceAll');
		}
	});

	return MainLayout;
});
