define(['jquery', 'backbone', 'marionette', 'ace', 'text!templates/explorer/fuelux.tree.template.html', 'js/models/editor/file.model', 'js/views/editor/editor.view', 'fuelux_tree', 'jquery_cookie'], function($, Backbone, Marionette, ace, FueluxTreeTemplate, FileModel, EditorView) {
	var user;
	var DataSource = function(options) {
		this._formatter = options.formatter;
		this._columns = options.columns;
		this._data = options.data;
	};

	DataSource.prototype = {

		columns : function() {
			return this._columns;
		},

		data : function(options, callback) {
			var self = this;
			var path = user.get('email');
			if (options.additionalParameters) {
				path = options.additionalParameters.filePath;
			}
			$.ajax({
				type : 'POST',
				url : URL + 'fileExplorer',
				data : {
					path : path
				},
				success : function(response) {
					callback({
						data : response,
						start : 0,
						end : 0,
						count : 0,
						pages : 0,
						page : 0
					});
					return true;
				},
				error : function(e) {
					console.log(e);
				}
			});
		}
	};

	var FueluxTreeView = Marionette.ItemView.extend({
		template : FueluxTreeTemplate,
		className : '',
		initialize : function() {
			var self = this;
			user = this.options.user;
			this.bindTo(this.options.vent, 'explorer:open', function(filePath) {
				//self.openFile(filePath);
			});
		},
		events : {
			'click #uploadFile' : 'uploadFile',
			'contextmenu .tree-item' : 'rightClick',
			'contextmenu .tree-folder' : 'rightClick'
		},
		onRender : function() {
			var self = this;
			vent = this.options.vent;
			user = this.options.user;
			configuration = this.options.configuration;
			var treeDataSource = new DataSource({
				data : [{
					name : 'Test Folder 1',
					type : 'folder',
					additionalParameters : {
						id : 'F1'
					}
				}, {
					name : 'Test Folder 2',
					type : 'folder',
					additionalParameters : {
						id : 'F2'
					}
				}, {
					name : 'Test Item 1',
					type : 'item',
					additionalParameters : {
						id : 'I1'
					}
				}, {
					name : 'Test Item 2',
					type : 'item',
					additionalParameters : {
						id : 'I2'
					}
				}, {
					name : 'Test Item 3',
					type : 'item',
					additionalParameters : {
						id : 'I3'
					}
				}],
				delay : 400
			});
			this.$('#MyTree').tree({
				dataSource : treeDataSource
			});

			this.$('#MyTree').on('selected', function(evt, data) {
				var path = data.info[0].additionalParameters.filePath;
				if (data.info[0].type == 'item') {
					self.openFile(path);
				}
				selectedItems = self.$('#MyTree').tree('selectedItems');
				selectedFile = user.get('email');
				if (selectedItems[0] && selectedItems[0].additionalParameters) {
					selectedFile = selectedItems[0].additionalParameters.filePath;
				}
			});

		},
		openFile : function(filePath) {
			// this event is opens a file in new tab if filePath given properly
			this.options.vent.trigger('file:open', filePath);
		},
		uploadFile : function(e) {
			var self = this;
			selectedItems = this.$('#MyTree').tree('selectedItems');
			selectedFile = user.get('email');
			if (selectedItems[0] && selectedItems[0].additionalParameters) {
				selectedFile = selectedItems[0].additionalParameters.filePath;
			}

			// Check for the various File API support.
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				// handler when file selected
				$('#files').change(function(e) {
					var f = e.target.files[0];
					if (f) {
						var data = new FormData();
						data.append('file', f);
						data.append('path', selectedFile);
						$.ajax({
							url : URL + "file/upload",
							type : "POST",
							data : data,
							processData : false,
							contentType : false,
							complete : function() {
								self.render();
							}
						});
					} else {
						alert("Failed to load file");
					}
					self.$('#files').remove();
					self.$('.fuelux').append('<input type="file" id="files" name="file" style="visibility: hidden"/>');
					return true;
				});
				// trigger file browser window on button click
				$('#files').click();
			} else {
				alert('The File APIs are not fully supported in this browser.');
			}

		},
		rightClick : function(e) {
			//this.$('#MyTree').tree.selectItem(e.currentTarget);
			if(e.currentTarget.className == "tree-folder"){
				e.currentTarget.children[0].click();			
			} else {
				e.currentTarget.click();
			}
			selectedFile = e.currentTarget.attributes.path.nodeValue;
	        $('#contextMenu').css({
	            top: e.pageY+'px',
	            left: e.pageX+'px'
	        }).show();
	        return false;
	    }
	});
	return FueluxTreeView;
});
