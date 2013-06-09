define(['jquery', 'backbone', 'marionette', 'text!templates/main/main.template.html', 'js/models/editor/file.model', 'js/views/editor/editor.view', 'js/views/console/console.view', 'js/views/explorer/fuelux.tree.view', 'js/views/global/global.view'], function($, Backbone, Marionette, MainTemplate, FileModel, EditorView, ConsoleView, FueluxTreeView, GlobalView) {
	MainLayout = Backbone.Marionette.Layout.extend({
		template : MainTemplate,
		initialize : function() {
			this.breakpoints = [];
		},
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
			'click #menuCheckout' : 'menuCheckout',

			'click' : 'closeContextMenu',
			'click #contextMenu' : 'closeContextMenu',
			'click #contextMenuNewFolder' : 'contextMenuNewFolder',
			'click #contextMenuNewFile' : 'contextMenuNewFile',
			'click #contextMenuRemove' : 'contextMenuRemove',
			'click #contextMenuRename' : 'contextMenuRename',
			'click #contextMenuCommit' : 'menuCommit',
			'click #contextMenuCheckout' : 'menuCheckout',
			'click #contextMenuBuild' : 'contextMenuBuild',

			'dblclick .ace_gutter-cell' : 'setBreakpoint',
			'click a[id="addExpression"]' : 'addExpression',
			'click a[class="removeExpression"]' : 'removeExpression'
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
			this.bindTo(this.options.vent, 'file:open', function(filePath, line, breakpointList) {
				var uuid = randomUUID();
				file = new FileModel({
					path : filePath,
					uuid : uuid
				});
				file.fetch({
					async : false
				});
				fileName = file.get('fileName').split('.')[0];
				if(file.get('fileName').indexOf('.') == -1) {
					// do not open because not a valid text file
					console.log('Not a valid text file');
					return;
				}
				if ($('#tabs a[path="' + filePath + '"]').size() == 0) {
					$('#tabs').append('<li class><a href="#editorRegion' + fileName + '" data-toggle="tab" path="' + filePath + '" uuid="' + uuid + '">' + file.get('fileName') + ' <i class="icon-remove"></i></a></li>');
					$('#tab_content').append('<div class="tab-pane fade" id="editorRegion' + fileName + '" path="' + filePath + '"></div>');

					var editorView = new EditorView({
						vent : vent,
						user : user,
						configuration : configuration,
						model : file,
						socket : socket,
						line : line,
						breakpointList : breakpointList
					});
					editorView.render();
					$('#editorRegion' + fileName).append(editorView.el);
					$('#tabs a:last').tab('show');
				} else {
					// if file is already open
					$('#tabs a[path="' + filePath + '"]').tab('show');
					vent.trigger('editor:gotoLine', filePath, line);
				}
			});
		},

		tabShown : function(e) {
			var path = $(e.target).attr('path');
			var uuid = $(e.target).attr('uuid');
			// determines if an editor opened, and if so, saves active file path
			if (uuid) {
				activeFileUUID = uuid;
			} else {
				activeFileUUID = null;
			}
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
			var uuid = randomUUID();
			if (!socket || !socket.socket.connected)
				return;
			if (this.terminal_count < 5) {
				$('#tabs').append('<li class><a href="#terminalRegion' + uuid + '" data-toggle="tab">Terminal<i class="icon-remove"></i></a></li>');
				$('#tab_content').append('<div class="tab-pane fade" id="terminalRegion' + uuid + '"></div>');

				var consoleView = new ConsoleView({
					vent : vent,
					user : user,
					socket : socket,
					id : uuid
				});
				consoleView.render();
				$('#terminalRegion' + uuid).append(consoleView.el);
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
			file.set('uuid', uuid);

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
			if (id.substring(0, 'terminalRegion'.length + 1) == '#terminalRegion') {
				var terminal_id = id.substring('#termainalRegion'.length);
				this.options.vent.trigger('terminal:unfocused');
				this.options.vent.trigger('terminal:destroy', terminal_id);
				this.terminal_count--;
			} else if (id.substring(0, 'processRegion'.length + 1) == '#processRegion') {
				var process_id = id.substring('#processRegion'.length);
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
			if (id.substring(0, 'terminalRegion'.length + 1) == '#terminalRegion') {
				var terminal_id = id.substring('#termainalRegion'.length);
				this.options.vent.trigger('terminal:unfocused');
				this.options.vent.trigger('terminal:destroy', terminal_id);
			} else if (id.substring(0, 'processRegion'.length + 1) == '#processRegion') {
				var process_id = id.substring('#processRegion'.length);
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
		debug : function() {
			if (inDebug) {
				return;
			};
			var self = this;
			var path = selectedFile;
			var executableName = path.substring(path.lastIndexOf('/') + 1);
			if (!executableName)
				return;
			if (!file)
				return;
			if (executableName.lastIndexOf('.') != -1) {
				// which means its not an executable
				bootbox.alert('This file type is not supported currently.');
				return;
			}
			if (!socket || !socket.socket.connected)
				return;

			var pathArray = path.split('/');
			pathArray.pop();
			pathArray.push(executableName);
			path = pathArray.join('/');
			socket.emit('debugger:create', {
				'executable' : path
			});

			var breakpoints = self.breakpoints;
			socket.on('debugger:create_response', function(data) {
				socket.debugger_id = data.id;
				self.debugID = data.id;
				inDebug = true;

				for ( i = 0; i < breakpoints.length; i++) {
					socket.emit('debugger:set_breakpoint', {
						'file' : breakpoints[i].fileName,
						'line' : breakpoints[i].line,
						'id' : self.debugID
					});
				}

				socket.emit('debugger:run', {
					id : self.debugID
				});
			});

			socket.on('debugger:set_current_state', function(data) {
				//alert(JSON.stringify(data));
				expressions = data['expressions'];
				$('#debugExpressions').html('<tr><th>Expression</th><th>Value</th><th><a href="#" id="addExpression">+</a></th></tr>');
				for (var expr in expressions) {
					$('#debugExpressions').append("<tr><td>" + expr + "</td><td>" + expressions[expr] + "</td><td><a href=\"#\" class=\"removeExpression\" name=\"" + expr + "\">-</a></td></tr>")
				}
				self.options.vent.trigger('file:open', data.file, data.line, breakpoints);

			});
			
			socket.on('debugger:closed', function(data) {
				//debugger interface should be closed
				// simulate close debug button
				$('#closeDebugButton').click();
			});

			$('#mainMenu').append('<li id="nextButton"><a href="#" class="btn btn-primary" title="Next"><i class="icon-play"></i></a></li>').append('<li id="continueButton"><a href="#" class="btn btn-primary" title="Continue"><i class="icon-step-forward"></i></a></li>').append('<li id="closeDebugButton"><a href="#" class="btn btn-primary" title="Close Debug Mode"><i class="icon-remove"></i></a></li>');

			$('#nextButton').click(function(e) {
				socket.emit('debugger:next', {
					id : self.debugID
				});
			});
			$('#continueButton').click(function(e) {
				socket.emit('debugger:continue', {
					id : self.debugID
				});
			});
			$('#closeDebugButton').click(function(e) {
				$('#nextButton').remove();
				$('#continueButton').remove();
				$('#closeDebugButton').remove();
				$('#debugExpressions').remove();
				inDebug = false;
			});

			$('#debug_div').append('<table id="debugExpressions" class="table table-striped table-bordered table-condensed"><tr><th>Expression</th><th>Value</th><th><a href="#" id="addExpression">+</a></th></tr></table>');

		},
		setBreakpoint : function(e) {
			var self = this;
			var fileName = $('#tabs .active a').text().trim();
			bpList = this.breakpoints;
			e.stopPropagation();
			e.preventDefault();
			var id = $(e.target).text();
			var breakpoint = {
				fileName : fileName,
				line : id
			};
			if ($.grep(bpList, function(e) {
				return e.fileName == fileName && e.line == id
			}).length != 0) {
				bpList = $.grep(bpList, function(e) {
					return e.fileName != fileName || e.line != id
				});
				$(e.target).removeClass('ace_breakpoint');
				if (inDebug) {
					socket.emit('debugger:remove_breakpoint', {
						'file' : fileName,
						'line' : id,
						'id' : self.debugID
					});
				}
			} else {
				bpList.push(breakpoint);
				$(e.target).addClass('ace_breakpoint');
				if (inDebug) {
					socket.emit('debugger:set_breakpoint', {
						'file' : fileName,
						'line' : id,
						'id' : self.debugID
					});
				}
			}
		},
		addExpression : function() {
			bootbox.prompt('Enter an expression', function(expression) {
				if (expression) {
					$('#debugExpressions').append("<tr><td>" + expression + "</td><td>...</td><td><a href=\"#\" class=\"removeExpression\" name=\"" + expression + "\">-</a></td></tr>")
					socket.emit('debugger:add_expression', {
						id : socket.debugger_id,
						expression : expression
					});
				} else {
					bootbox.alert('Not a valid expression');
				}
			});
		},
		removeExpression : function(e) {
			var expr = e.target.name;
			$(e.target).parent().parent().remove();
			socket.emit('debugger:remove_expression', {
				id : socket.debugger_id,
				expression : expr
			});
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
			v.trigger('menu:findReplace', activeFileUUID);
		},
		menuFindReplaceAll : function(e) {
			var v = this.options.vent;
			v.trigger('menu:findReplaceAll', activeFileUUID);
		},
		closeContextMenu : function() {
			$('#contextMenu').hide();
		},
		contextMenuNewFolder : function() {
			alert(selectedFile);
		},
		contextMenuNewFile : function() {
			alert(selectedFile);
		},
		contextMenuRemove : function() {
			alert(selectedFile);
		},
		contextMenuRename : function() {
			alert(selectedFile);
		},
		contextMenuBuild : function() {
			alert(selectedFile);
		}
	});

	return MainLayout;
});
