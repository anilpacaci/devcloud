package com.devcloud.model;

import java.util.List;

public class User {
	private long id;
	private String username;
	private String password;
	private Preferences preferences;
	private Workspace workspace;
	private List<Command> commands;
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
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
	public Preferences getPreferences() {
		return preferences;
	}
	public void setPreferences(Preferences preferences) {
		this.preferences = preferences;
	}
	public Workspace getWorkspace() {
		return workspace;
	}
	public void setWorkspace(Workspace workspace) {
		this.workspace = workspace;
	}
	public List<Command> getCommands(){
		return this.commands;
	}
	public void addCommand(Command command){
		this.commands.add(command);
	}
}
