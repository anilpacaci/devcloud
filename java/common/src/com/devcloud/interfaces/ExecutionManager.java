package com.devcloud.interfaces;

import java.io.File;
import java.util.HashMap;
import java.util.List;

import com.devcloud.exception.ExecutionOperationException;
import com.devcloud.model.Project;

public interface ExecutionManager  extends AbstractManager {
	public boolean compile(File file) throws ExecutionOperationException;
	public boolean compile(Project project) throws ExecutionOperationException;
	public void debug(Project project, String... commandLineArg) throws ExecutionOperationException;
	public void run(Project project, String... commandLineArg) throws ExecutionOperationException;
	public void setBreakpoint(String executableName, long lineNumber) throws ExecutionOperationException;
	public List<Long> getBreakpoints(String executableName) throws ExecutionOperationException;
	public void stepInto(String executableName, long lineNumber) throws ExecutionOperationException;
	public void stepOver(String executableName, long lineNumber) throws ExecutionOperationException;
	public void stepOut(String executableName, long lineNumber) throws ExecutionOperationException;
	public void addExpresion(String executableName, String expression) throws ExecutionOperationException;
	public void removeExpresion(String executableName, String expression) throws ExecutionOperationException;
	public HashMap<String, String> evaluateExpresions(String executableName) throws ExecutionOperationException;
}
