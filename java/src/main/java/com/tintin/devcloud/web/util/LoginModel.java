package com.tintin.devcloud.web.util;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class LoginModel implements Serializable {

	private String username;
	private String password;
	private boolean staySignedIn;
	
	public LoginModel() {
		
	}
	
	public LoginModel(String username, String password, boolean staySignedIn) {
		super();
		this.username = username;
		this.password = password;
		this.staySignedIn = staySignedIn;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isStaySignedIn() {
		return staySignedIn;
	}

	public void setStaySignedIn(boolean staySignedIn) {
		this.staySignedIn = staySignedIn;
	}
	
}
