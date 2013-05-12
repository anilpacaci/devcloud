require.config({
	baseUrl : '',
	paths : {
		jquery : 'js/libs/jquery/jquery-1.9.1',
		jquery_cookie : 'js/libs/jquery/jquery.cookie',
		jquery_ui  : 'js/libs/jquery/jquery-ui-1.10.2.custom',
		underscore : 'js/libs/underscore/underscore',
		backbone : 'js/libs/backbone/backbone',
		marionette : 'js/libs/backbone/backbone.marionette',
		text : 'js/libs/require/text',
		ace : 'js/libs/ace/ace',
		socketio : 'js/libs/socket.io/socket.io',
		term : 'js/libs/term/term',
		bootstrap : 'js/libs/bootstrap/bootstrap',
		bootbox : 'js/libs/bootstrap/bootbox',
		filetree : 'js/libs/jquery/jqueryFileTree',
		validate : 'js/libs/jquery/jqueryValidate'
	},

	shim : {
		'jquery' : {
			exports : '$'
		},
		'jquery_cookie' : {
			deps : ['jquery'],
			exports : '$'
		},
		'jquery_ui' : {
			deps : ['jquery'],
			exports : '$'
		},
		'underscore' : {
			deps : ['jquery'],
			exports : '_'
		},
		'backbone' : {
			deps : ['underscore', 'jquery'],
			exports : 'Backbone'
		},
		'marionette' : {
			deps : ['backbone'],
			exports : 'Backbone.Marionette'
		},
		'ace' : {
			deps : ['jquery'],
			exports : 'ace'
		},
		'socketio' : {
			deps : [],
			exports : 'io'
		},
		'term' : {
			deps : [],
			exports : 'Terminal'
		},
		'bootstrap' : {
			deps : ['jquery']
		},
		'bootbox' : {
			deps : ['jquery', 'bootstrap'],
			exports : 'bootbox'
		},
		'filetree' : {
			deps : ['jquery'],
			exports : '$'
		},
		'validate' : {
			deps : ['jquery'],
			exports : '$'
		}
	}
});
var URL = '../devcloud/';
var currentTab = null;
var selectedFile = null;

require(['js/app/editor.app', 'jquery', 'underscore', 'backbone', 'marionette', 'bootstrap'], function(EditorApp) {
	EditorApp.start();
}); 
