/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2010-2011 Oracle and/or its affiliates. All rights reserved.
 *
 * The contents of this file are subject to the terms of either the GNU
 * General Public License Version 2 only ("GPL") or the Common Development
 * and Distribution License("CDDL") (collectively, the "License").  You
 * may not use this file except in compliance with the License.  You can
 * obtain a copy of the License at
 * http://glassfish.java.net/public/CDDL+GPL_1_1.html
 * or packager/legal/LICENSE.txt.  See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * When distributing the software, include this License Header Notice in each
 * file and include the License file at packager/legal/LICENSE.txt.
 *
 * GPL Classpath Exception:
 * Oracle designates this particular file as subject to the "Classpath"
 * exception as provided by Oracle in the GPL Version 2 section of the License
 * file that accompanied this code.
 *
 * Modifications:
 * If applicable, add the following below the License Header, with the fields
 * enclosed by brackets [] replaced by your own identifying information:
 * "Portions Copyright [year] [name of copyright owner]"
 *
 * Contributor(s):
 * If you wish your version of this file to be governed by only the CDDL or
 * only the GPL Version 2, indicate your decision by adding "[Contributor]
 * elects to include this software in this distribution under the [CDDL or GPL
 * Version 2] license."  If you don't indicate a single choice of license, a
 * recipient has the option to distribute your version of this file under
 * either the CDDL, the GPL Version 2 or to extend the choice of license to
 * its licensees as provided above.  However, if you add GPL Version 2 code
 * and therefore, elected the GPL Version 2 license, then the option applies
 * only if the new code is made subject to such option by the copyright
 * holder.
 */

package com.tintin.devcloud.web;

import java.io.File;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jettison.json.JSONObject;

import com.tintin.devcloud.web.util.AdditionalParameterModel;
import com.tintin.devcloud.web.util.TreeEntryModel;

/**
 * 
 * @author japod
 */
@Path("/fileExplorer")
public class FileExplorerResource {

	private static final String APPLICATION_FORM_URLENCODED = null;

	@POST
	@Path("/old")
	@Produces(MediaType.TEXT_HTML)
	public Response getDirectory(@FormParam("dir") String dir) {
		StringBuilder response = new StringBuilder();
		try {
			dir = URLDecoder.decode(dir, "UTF-8");
			File folder = new File(dir);
			File[] listOfFiles = folder.listFiles();

			List<File> fileList = new ArrayList<File>();
			List<File> folderList = new ArrayList<File>();

			for (int i = 0; i < listOfFiles.length; i++) {

				if (listOfFiles[i].isFile()) {
					fileList.add(listOfFiles[i]);
				} else {
					folderList.add(listOfFiles[i]);
				}
			}

			response.append("<ul class='jqueryFileTree' style='display: none;'>");

			for (File fold : folderList) {
				String path = fold.getAbsolutePath().replace("\\", "/");
				response.append(
						"<li class='directory collapsed'><a href='#' rel='")
						.append(path).append("/'>").append(fold.getName())
						.append("</a></li>");
			}
			for (File file : fileList) {
				String path = file.getAbsolutePath().replace("\\", "/");
				String extension = "";

				int i = path.lastIndexOf('.');
				if (i > 0) {
					extension = path.substring(i + 1);
				}
				response.append(
						"<li class='file ext_" + extension
								+ "'><a href='#' rel='").append(path)
						.append("'>").append(file.getName())
						.append("</a></li>");
			}
			response.append("</ul>");
		} catch (Exception e) {
			return Response.serverError().build();
		}

		return Response.ok(response.toString()).build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response getDirectoryContent(
			@FormParam("path") @DefaultValue(".") String directoryPath) {
		List<TreeEntryModel> response = new ArrayList<TreeEntryModel>();
		try {
			directoryPath = URLDecoder.decode(directoryPath, "UTF-8");
			System.out.println(directoryPath);
			File folder = new File(directoryPath);
			File[] listOfFiles = folder.listFiles();

			for (int i = 0; i < listOfFiles.length; i++) {
				File file = listOfFiles[i];
				TreeEntryModel fileObject = new TreeEntryModel();
				AdditionalParameterModel parameters = new AdditionalParameterModel();
				parameters.setFilePath(file.getAbsolutePath());
				fileObject.setAdditionalParameters(parameters);
				fileObject.setName(file.getName());
				System.out.println(file.getAbsolutePath());
				if (file.isFile()) {
					fileObject.setType("item");
				} else {
					fileObject.setType("folder");
				}
				response.add(fileObject);
			}

		} catch (Exception e) {
			return Response.serverError().build();
		}
		return Response.ok(response).build();
	}

}
