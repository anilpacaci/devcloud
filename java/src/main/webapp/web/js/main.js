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
		validate : 'js/libs/jquery/jqueryValidate',
		fuelux_tree : 'fuelux/tree'
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
		},
		'fuelux_tree' : {
			deps : ['jquery'],
			exports : 'fuelux_tree'
		}
	}
});
var URL = '../devcloud/';
var activeFileUUID = null;
var selectedFile;
var inDebug = false;

require(['js/app/editor.app', 'jquery', 'underscore', 'backbone', 'marionette', 'bootstrap'], function(EditorApp) {
	EditorApp.start();
}); 

/* randomUUID.js - Version 1.0
*
* Copyright 2008, Robert Kieffer
*
* This software is made available under the terms of the Open Software License
* v3.0 (available here: http://www.opensource.org/licenses/osl-3.0.php )
*
* The latest version of this file can be found at:
* http://www.broofa.com/Tools/randomUUID.js
*
* For more information, or to comment on this, please go to:
* http://www.broofa.com/blog/?p=151
*/

/**
 * Create and return a "version 4" RFC-4122 UUID string.
 */
function randomUUID() {
	var s = [], itoh = '0123456789ABCDEF';

	// Make array of random hex digits. The UUID only has 32 digits in it, but we
	// allocate an extra items to make room for the '-'s we'll be inserting.
	for (var i = 0; i < 36; i++)
		s[i] = Math.floor(Math.random() * 0x10);

	// Conform to RFC-4122, section 4.4
	s[14] = 4;
	// Set 4 high bits of time_high field to version
	s[19] = (s[19] & 0x3) | 0x8;
	// Specify 2 high bits of clock sequence

	// Convert to hex chars
	for (var i = 0; i < 36; i++)
		s[i] = itoh[s[i]];

	// Insert '-'s
	s[8] = s[13] = s[18] = s[23] = '-';

	return s.join('');
}

