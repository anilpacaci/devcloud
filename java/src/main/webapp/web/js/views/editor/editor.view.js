define(['jquery', 'backbone', 'marionette', 'ace', 'bootbox', 'text!templates/editor/editor.template.html', 'js/models/editor/file.model', 'js/views/execution/run.view'], function($, Backbone, Marionette, ace, bootbox, EditorTemplate, FileModel, RunView) {
	var EditorView = Marionette.ItemView.extend({
		template : EditorTemplate,
		className : '',
		events : {
			'click a[id="save_button"]' : 'saveButton',
			'click a[id="run_button"]' : 'runButton',
			'click a[id="addExpression"]' : 'addExpression',
			'click a[class="removeExpression"]' : 'removeExpression',
			'dblclick .ace_gutter-cell' : 'setBreakpoint'
		},
		initialize : function() {
			vent = this.options.vent;
			this.breakpoints = [];

			this.bindTo(vent, 'editor:open', function(file) {
				//alert(file);
				this.model = file;
				//	currentTab = this;
			});

			var self = this;

			this.bindTo(vent, 'file:save', function(tabName) {
				var tabNameSplitted = tabName.split(' ');
				if (tabName.trim() == self.model.get('fileName') || self.el.parentElement.id == 'editorRegion' + tabNameSplitted[tabNameSplitted.length - 1]) {
					self.save(self.model);
				}
			});

			this.bindTo(vent, 'file:saveAll', function() {
				self.save(self.model);
			});

			this.bindTo(vent, 'file:run', function(tabName) {
				if (tabName.trim() == self.model.get('fileName')) {
					self.run(self.model);
				}
			});

			this.bindTo(vent, 'file:debug', function(tabName) {
				if (tabName.trim() == self.model.get('fileName')) {
					self.debug(self.model);
				}
			});
			this.bindTo(vent, 'menu:undo', function() {
				self.undo(self.editor);
			});
			this.bindTo(vent, 'menu:redo', function() {
				self.redo(self.editor);
			});
			this.bindTo(vent, 'menu:cut', function() {
				self.cut(self.editor);
			});
			this.bindTo(vent, 'menu:copy', function() {
				self.copy(self.editor);
			});
			this.bindTo(vent, 'menu:paste', function() {
				self.paste(self.editor);
			});
			this.bindTo(vent, 'menu:findReplace', function() {
				self.findReplace(self.editor);
			});
			this.bindTo(vent, 'menu:findReplaceAll', function() {
				self.findReplaceAll(self.editor);
			});
		},
		modelEvents : {
			"change" : "modelChanged"
		},
		setBreakpoint : function(e) {
			var self = this;
			bpList = this.breakpoints;
			e.stopPropagation();
			e.preventDefault();
			var id = $(e.target).text();
			if ($(e.target).hasClass('ace_breakpoint')) {
				bpList.splice($.inArray(id, bpList), 1);
				$(e.target).removeClass('ace_breakpoint');
				if (!self.inDebug) {
					socket.emit('debugger:remove_breakpoint', {
						'file' : self.model.get('fileName'),
						'line' : id,
						'id' : self.debugID
					});
				}
			} else {
				bpList.push(id);
				$(e.target).addClass('ace_breakpoint');
				if (self.inDebug) {
					socket.emit('debugger:set_breakpoint', {
						'file' : self.model.get('fileName'),
						'line' : id,
						'id' : self.debugID
					});
				}
			}
		},
		onRender : function() {

			if (!this.model) {
				this.model = new FileModel();
			}

			vent = this.options.vent;
			configuration = this.options.configuration;
			this.editor = ace.edit(this.$('#editor').get(0));
			if (configuration) {
				this.editor.setTheme(configuration.get("themeName"));
			} else {
				this.editor.setTheme("ace/theme/monokai");
			}
			this.editor.getSession().setMode("ace/mode/c_cpp");
			this.editor.setValue(this.model.get('content'));

			// keybinding for auto completion
			var self = this;

			self.editor.commands.addCommand({
				name : 'saveFile',
				bindKey : {},
				exec : function(editor) {
					self.save(self.model);
				},
				readOnly : true
			});
			self.editor.commands.addCommand({
				name : 'myCommand',
				bindKey : {
					win : 'Ctrl-Space',
					mac : 'Command-Space'
				},
				exec : function(editor) {
					$('#fakeAutoComplete').offset($('.active .ace_cursor').offset());
					var cursorPosition = editor.getCursorPosition();
					var range = editor.selection.getWordRange(editor.selection.getSelectionLead());
					range.end = cursorPosition;

					var suggestionList = editor.getValue().split(/[^\w]+/);
					suggestionList = suggestionList.filter(function(elem, pos, self) {
						return self.indexOf(elem) == pos;
					});
					suggestionList = suggestionList.filter(function(e) {
						return e
					});
					var toComplete = editor.session.getTextRange(range);
					$('#fakeAutoComplete').autocomplete({
						autoFocus : true,
						source : suggestionList,
						focus : function() {
							$('#fakeAutoComplete').text('');
						},
						open : function() {
							$('.ui-menu').focus();
							$('.ui-menu').keydown(function(e) {
								if (e.keyCode == 27) {
									$('#fakeAutoComplete').autocomplete('close');
								}
							});
						},
						select : function(event, ui) {
							editor.session.replace(range, ui.item.value);
						},
						close : function() {
							$('#fakeAutoComplete').text('');
							$('.ace_text-input').focus();
						}
					});
					$('#fakeAutoComplete').autocomplete('search', toComplete);
					$('.ui-menu').css('width', '');
				},
				readOnly : true // false if this command should not apply in readOnly mode
			});

			//currentTab = this;//.model;

		},
		modelChanged : function() {
			this.editor.setValue(this.model.get('content'));
		},
		saveButton : function(e) {
			this.save(this.model);
		},
		save : function(file) {
			var self = this;
			var newFile = false;

			var tempFunction = function(self, file, newFile) {
				file.set('content', self.editor.getValue());
				$.ajax({
					type : "POST",
					url : URL + 'fileResource',
					data : {
						path : file.get('path'),
						content : file.get('content')
					},
					success : function(absPath) {
						if (newFile) {
							file.set('path', absPath);

							var pathElements = file.get('path').split("/");
							var fileName = pathElements[pathElements.length-1].split('.')[0];
							var v = self.options.vent;

							self.model = file;

							var editorRegionId = $("ul#tabs li.active")[0].children[0].href.split('#')[1];
							$("ul#tabs li.active")[0].children[0].href = '#editorRegion' + fileName;
							$('#' + editorRegionId)[0].id = 'editorRegion' + fileName;
							$("ul#tabs li.active")[0].children[0].innerHTML = pathElements[pathElements.length - 1] + " <i class='icon-remove'></i>"
							v.trigger('explorer:refresh', file.get('path'));
						}
					},
					error : function() {
						bootbox.alert("An error occured");
					}
				});
			};

			if (!file.get('fileName')) {
				bootbox.prompt('Enter path to save file:', function(path) {
					path = self.options.user.get('email') + '/' + path;
					file = new FileModel({
						path : path
					});
					newFile = true;
					tempFunction(self, file, newFile);
				});

			} else {
				tempFunction(self, file, newFile);
			}

		},
		runButton : function(e) {
			this.run(this.model);
		},
		run : function(file) {
			if (!file)
				return;
			var path = file.get('path');
			if (path == '' || path.substring(path.length - 2, path.length) != '.c') {
				bootbox.alert('This file type is not supported currently.');
				return;
			}
			if (!socket || !socket.socket.connected)
				return;
			var runView = new RunView({
				vent : vent,
				user : user,
				socket : socket,
				path : path
			});
			runView.render();

		},
		debug : function(file) {
			if (this.inDebug) {
				return;
			};
			var self = this;
			var executableName = bootbox.prompt("Enter executable name:", function(executableName) {
				if (!executableName)
					return;
				if (!file)
					return;
				var path = file.get('path');
				if (path == '' || path.substring(path.length - 2, path.length) != '.c') {
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
					self.inDebug = true;

					for ( i = 0; i < breakpoints.length; i++) {
						socket.emit('debugger:set_breakpoint', {
							'file' : self.model.get('fileName'),
							'line' : breakpoints[i],
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

				});

				$('#mainMenu').append('<li id="nextButton"><a href="#" class="btn btn-primary"><i class="icon-play"></i></a></li>').append('<li id="continueButton"><a href="#" class="btn btn-primary"><i class="icon-step-forward"></i></a></li>').append('<li id="closeDebugButton"><a href="#" class="btn btn-primary"><i class="icon-remove"></i></a></li>');

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
					self.inDebug = false;
				});

				$('#debug_div').append('<table id="debugExpressions" class="table table-striped table-bordered table-condensed"><tr><th>Expression</th><th>Value</th><th><a href="#" id="addExpression">+</a></th></tr></table>');

			});
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
		highlight : function(row) {
			this.editor.gotoLine(row, 0, true);
		},
		undo : function(editor) {
			editor.undo();
		},
		redo : function(editor) {
			editor.redo();
		},
		findReplace : function(editor) {
			bootbox.prompt('Find', function(needle) {
				if (needle) {
					bootbox.prompt('Replacement', function(replacement) {
						if (replacement) {
							editor.replace(replacement, {
								needle : needle
							});
						} else {
							return;
						}
					})
				} else {
					bootbox.alert('Not a valid search string!');
				}
			});
		},
		findReplaceAll : function(editor) {
			bootbox.prompt('Find', function(needle) {
				if (needle) {
					bootbox.prompt('Replacement', function(replacement) {
						if (replacement) {
							editor.replaceAll(replacement, {
								needle : needle
							});
						} else {
							return;
						}
					})
				} else {
					bootbox.alert('Not a valid search string!');
				}
			});
		}
	});
	return EditorView;
});
