define(['jquery', 'backbone', 'marionette', 'js/models/auth/user.model', 'text!templates/auth/login_form.html'], function($, Backbone, Marionette, UserModel, loginForm) {
	var LoginView = Marionette.ItemView.extend({
		template : loginForm,
		className : 'hero-unit offset8 span4',
		events : {
			'click button' : 'signIn'
		},

		signIn : function(e) {
			if(e.target.id == "btn_signIn"){
				if (!this.$('#username').val() || !this.$('#password').val()) {
					//username password should be entered to login
				} else {
					$('#loadingOverlay').fadeIn();
					this.model.set({
						'username' : this.$('#username').val(),
						'password' : this.$('#password').val(),
						'staySignedIn' : this.$('#staySignedIn').is(':checked')
					});
					var self = this;
					$.ajax({
						type : 'PUT',
						url : URL + 'auth',
						headers : {
							"Accept" : "application/json",
							"Content-Type" : "application/json"
						},
						data : JSON.stringify(this.model),
						success : function(response) {
							$('#loadingOverlay').fadeOut();
							//session obtaiened, set a cookie, then trigger a loggedIn in event
							var exp = '';
							if (response.until) {
								var now = new Date();
								var unt = new Date(response.until);
								exp = Math.floor((unt - now) / (24 * 60 * 60 * 1000));
							}
							$.cookie("SID", response.sessionID, {
								expires : exp,
								path : '/'
							});
							// now user will be obtained with SID
							var user = self.options.user;
							user.fetch({
								success : function(response) {
									//user created according to response, will be sent with event
									self.options.vent.trigger('auth:loggedIn', user);
								},
								error : function(response) {
	
								}
							});
	
						},
						error : function(error) {
							$('#loadingOverlay').fadeOut();
							self.$('p').show();
						}
					});
				}
			} else if (e.target.id == "btn_register"){
				this.options.vent.trigger('auth:register');
			}
		}
	});
	return LoginView;
});
