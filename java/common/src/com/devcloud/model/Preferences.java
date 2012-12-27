package com.devcloud.model;

public class Preferences {
	private boolean gitHubSynchronization;
	private String gitHubUsername;
	private String gitHubKey;
	private String theme;

	public boolean isGitHubSynchronization() {
		return gitHubSynchronization;
	}

	public void setGitHubSynchronization(boolean gitHubSynchronization) {
		this.gitHubSynchronization = gitHubSynchronization;
	}

	public String getGitHubUsername() {
		return gitHubUsername;
	}

	public void setGitHubUsername(String gitHubUsername) {
		this.gitHubUsername = gitHubUsername;
	}

	public String getGitHubKey() {
		return gitHubKey;
	}

	public void setGitHubKey(String gitHubKey) {
		this.gitHubKey = gitHubKey;
	}

	public String getTheme() {
		return theme;
	}

	public void setTheme(String theme) {
		this.theme = theme;
	}
	
	
}
