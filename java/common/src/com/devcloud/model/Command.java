package com.devcloud.model;

import java.util.List;

public class Command {
	private String commandName;
	private List arguments;
	private List availableOptions;
	public String getCommandName() {
		return commandName;
	}
	public void setCommandName(String commandName) {
		this.commandName = commandName;
	}
	public List getArguments() {
		return arguments;
	}
	public void setArguments(List arguments) {
		this.arguments = arguments;
	}
	public List getAvailableOptions() {
		return availableOptions;
	}
	public void setAvailableOptions(List availableOptions) {
		this.availableOptions = availableOptions;
	}
}
