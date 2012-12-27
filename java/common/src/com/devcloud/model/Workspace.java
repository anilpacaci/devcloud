package com.devcloud.model;
import java.util.List;

public class Workspace {
	private boolean isPrivate;
	private List<Project> projects;
	
	public boolean isPrivate() {
		return isPrivate;
	}
	public void setPrivate(boolean isPrivate) {
		this.isPrivate = isPrivate;
	}
	public List<Project> getProjects() {
		return projects;
	}
	public void setProjects(List<Project> projects) {
		this.projects = projects;
	}
}
