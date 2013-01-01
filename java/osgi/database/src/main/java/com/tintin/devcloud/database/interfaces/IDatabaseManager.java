package com.tintin.devcloud.database.interfaces;

import javax.persistence.EntityManagerFactory;

public interface IDatabaseManager {
	public EntityManagerFactory getModelEMF();
}
