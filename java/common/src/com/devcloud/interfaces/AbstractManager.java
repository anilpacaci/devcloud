package com.devcloud.interfaces;

import com.devcloud.model.User;

public interface AbstractManager {
	public boolean authenticateUser();
	public User getUser();
}
