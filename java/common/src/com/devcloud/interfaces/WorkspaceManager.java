package com.devcloud.interfaces;

import java.io.File;

import com.devcloud.exception.WorkspaceOperationException;

public interface WorkspaceManager extends AbstractManager {
	public boolean createFile(String filename) throws WorkspaceOperationException;
	public boolean deleteFile(String filename) throws WorkspaceOperationException;
	public boolean uploadFile(File file) throws WorkspaceOperationException;
	public boolean createFolder(String folderName) throws WorkspaceOperationException;
	public boolean deleteFolder(String folderName) throws WorkspaceOperationException;
	public boolean uploadFolder(File folder) throws WorkspaceOperationException;
	public boolean createProject(String projectName) throws WorkspaceOperationException;
	public boolean deleteProject(String projectName) throws WorkspaceOperationException;
	public boolean importProject(File project) throws WorkspaceOperationException;
}
