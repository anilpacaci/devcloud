package com.devcloud.interfaces;

import java.util.List;

import com.devcloud.exception.CommandLineOperationException;
import com.devcloud.model.Command;
import com.devcloud.model.User;

public interface CommandLineManager {
	User user=new User();
	int currentCommandIndex=0;
	public void enterCommand(String command) throws CommandLineOperationException;
	public String nextCommand(int currrentCommandIndex) throws CommandLineOperationException;
	public String previousCommand(int currrentCommandIndex) throws CommandLineOperationException;
	public List<Command> getAvailableCommands(String prefix) throws CommandLineOperationException;
	
	}
