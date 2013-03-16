package com.tintin.devcloud.web.util;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class FileModel implements Serializable {

	private String fileName;
	private String content;
	private String path;

	public FileModel() {

	}

	public FileModel(String fileName, String content, String path) {
		super();
		this.fileName = fileName;
		this.content = content;
		this.path = path;
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

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

}
