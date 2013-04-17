define(['jquery', 'backbone', 'marionette', 'js/models/auth/user.model', 'text!templates/auth/register_form.html', 'validate'], function($, Backbone, Marionette, UserModel, registerForm) {
	var RegisterView = Marionette.ItemView.extend({
		template : registerForm,
		className : 'hero-unit offset8 span4',
		events : {
			'click button' : 'register'
		},
        
		register : function() {
			if (!this.$('#firstName').val() || !this.$('#lastName').val() || !this.$('#email').val() || !this.$('#password').val() || !this.$('#passwordVerify').val()) {
				alert("Please fill the required fields");
			} else if(this.$('#password').val() != this.$('#passwordVerify').val()){
				alert("Password and Confirm Password must match")
			} else {
				$('#loadingOverlay').fadeIn();
				this.model.set({
					'firstName' : this.$('#firstName').val(),
					'lastName' : this.$('#lastName').val(),
					'email' : this.$('#email').val(),
					'password' : this.$('#password').val(),
				});
				var self = this;
				$.ajax({
					type : 'PUT',
					url : URL + 'auth/register',
					headers : {
						"Content-Type" : "application/json"
					},
					data : JSON.stringify(this.model),
					success : function(response) {
						$('#register_form').addClass("hide");
						$('#register_success').removeClass("invisible");
					},
					error : function(error) {
						alert("User already exists");
						$('#loadingOverlay').fadeOut();
						self.$('p').show();
					}
				});
			}
		}
	});
	return RegisterView;
});