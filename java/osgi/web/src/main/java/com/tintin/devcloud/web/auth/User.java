package com.tintin.devcloud.web.auth;

import java.util.Date;

public class User {

	private int id;
	private String email;
	private String password;
	private String title;
	private String name;
	private String surname;
	private int accessLevel;
	private Date registrationTime;
	private String workspacePath;

	public User() {
		super();
	}

	public User(int id, String email, String password, String title,
			String name, String surname, int accessLevel, Date registrationTime) {
		super();
		this.id = id;
		this.email = email;
		this.password = password;
		this.title = title;
		this.name = name;
		this.surname = surname;
		this.accessLevel = accessLevel;
		this.registrationTime = registrationTime;
	}

	public User(String email, String password, String title, String name,
			String surname, int accessLevel) {
		super();
		this.email = email;
		this.password = password;
		this.title = title;
		this.name = name;
		this.surname = surname;
		this.accessLevel = accessLevel;
	}

	public String getFullName() {
		return name + "_" + surname;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSurname() {
		return surname;
	}

	public void setSurname(String surname) {
		this.surname = surname;
	}

	public int getAccessLevel() {
		return accessLevel;
	}

	public void setAccessLevel(int accessLevel) {
		this.accessLevel = accessLevel;
	}

	public Date getRegistrationTime() {
		return registrationTime;
	}

	public void setRegistrationTime(Date registrationTime) {
		this.registrationTime = registrationTime;
	}

	public String getWorkspacePath() {
		return workspacePath;
	}

	public void setWorkspacePath(String workspacePath) {
		this.workspacePath = workspacePath;
	}

}
