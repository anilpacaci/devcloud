require.config({
	baseUrl : '',
	paths : {
		jquery : 'js/libs/jquery/jquery-1.8.2.min',
		jquery_cookie : 'js/libs/jquery/jquery.cookie',
		underscore : 'js/libs/underscore/underscore',
		backbone : 'js/libs/backbone/backbone',
		marionette : 'js/libs/backbone/backbone.marionette',
		text : 'js/libs/require/text',
		ace : 'js/libs/ace/ace',
		socketio : 'js/libs/socket.io/socket.io',
		term : 'js/libs/term/term',
		bootstrap : 'js/libs/bootstrap/bootstrap',
		filetree : 'js/libs/jquery/jqueryFileTree'
	},

	shim : {
		'jquery' : {
			exports : '$'
		},
		'jquery_cookie' : {
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
		'filetree' : {
			deps : ['jquery'],
			exports : '$'
		}
	}
});
var URL = 'http://localhost:8080/devcloud/';
require(['js/app/editor.app', 'jquery', 'underscore', 'backbone', 'marionette', 'bootstrap'], function(EditorApp) {
	EditorApp.start();
}); 