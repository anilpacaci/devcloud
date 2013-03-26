package com.tintin.devcloud.web;

import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tintin.devcloud.database.model.Configuration;
import com.tintin.devcloud.database.model.User;
import com.tintin.devcloud.database.persistence.GenericPersistanceManager;
import com.tintin.devcloud.web.auth.AuthenticationManager;
import com.tintin.devcloud.web.util.WebUtil;

@Path("configuration")
public class ConfigurationResource {

	public static final String SID = "SID";

	private static final Logger logger = LoggerFactory.getLogger(ConfigurationResource.class);
	
	@PUT
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response saveConfiguration(@CookieParam(SID) String sessionID, Configuration configuration) {
		boolean status = false;
		try {
			User user = AuthenticationManager.getInstance().getUserFromSession(sessionID);
			if(user != null) {
				user.setConfiguration(configuration);
				GenericPersistanceManager.updateEntity(user, user.getId());
				status = true;
			}
		} catch (IllegalAccessException e) {
			logger.error("Cannot signout user from sessionID", e);
			throw new WebApplicationException(Status.INTERNAL_SERVER_ERROR);
		}
		
		if(status) {
			return Response.ok().build();
		} else {
			return Response.status(Status.BAD_REQUEST).build();
		}
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getConfiguration(@CookieParam(SID) String sessionID) {
		User user = WebUtil.getUser(sessionID);
		
		return Response.ok(user.getConfiguration()).build();
	}
}
