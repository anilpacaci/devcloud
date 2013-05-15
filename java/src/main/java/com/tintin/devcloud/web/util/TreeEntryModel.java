package com.tintin.devcloud.web.util;

public class TreeEntryModel {

	public String name;
	public String type;
	public AdditionalParameterModel additionalParameters;

	public TreeEntryModel() {
		super();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public AdditionalParameterModel getAdditionalParameters() {
		return additionalParameters;
	}

	public void setAdditionalParameters(
			AdditionalParameterModel additionalParameters) {
		this.additionalParameters = additionalParameters;
	}

}
