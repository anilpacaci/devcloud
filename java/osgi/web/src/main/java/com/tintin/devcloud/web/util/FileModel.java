package com.tintin.devcloud.web.util;

public class FileModel {

	private String fileName;
	private String content;

	public FileModel() {

	}

	public FileModel(String fileName, String content) {
		super();
		this.fileName = fileName;
		this.content = content;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

}
