define(['backbone'], function(Backbone) {
	var LoginModel = Backbone.Model.extend({
		initialize : function() {
			this.on('change', this.handleCookies);
			if ($.cookie('username') && $.cookie('password')) {
				this.set({
					'username' : $.cookie('username'),
					'password' : $.cookie('password'),
					'rememberMe' : true
				});
			}
		},

		defaults : {
			username : "",
			password : "",
			rememberMe : false
		},

		handleCookies : function(options) {
			if (options.changed.username && options.changed.password) {
				if (options.changed.rememberMe) {
					$.cookie('username', options.changed.username, {
						expires : 7
					});
					$.cookie('password', options.changed.password, {
						expires : 7
					});
				}
			} else {
				$.cookie('username', null);
				$.cookie('password', null);
			}
		}
	});
	return LoginModel;
});
