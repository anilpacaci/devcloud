package com.tintin.devcloud.database.manager;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class DatabaseManager {

	private static EntityManagerFactory emf = null;
	
	public static EntityManagerFactory getEMF() {
		if(emf == null) {
			emf = Persistence.createEntityManagerFactory("model");
		}
		return emf;
	}

}
