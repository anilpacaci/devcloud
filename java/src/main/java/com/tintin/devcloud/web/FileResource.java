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

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.net.URLDecoder;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.io.FileUtils;

import com.tintin.devcloud.web.util.FileModel;

/**
 * 
 * @author japod
 */
@Path("/fileResource")
public class FileResource {

	private static final String APPLICATION_FORM_URLENCODED = null;

	@POST
	public String getStatus(@FormParam("path") String fileName,
			@FormParam("content") String content) {
		String path = null;
		try {
			System.out.println(fileName);
			System.out.println(content);
			File file = new File(fileName);
			File parent = file.getParentFile();
			if (!parent.exists()) {
				parent.mkdirs();
			}
			path = file.getAbsolutePath();
			BufferedWriter out = new BufferedWriter(new FileWriter(fileName));
			out.write(content);
			System.out.println(content);
			out.close();
		} catch (Exception e) {
			return e.toString();
		}

		return path;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getFile(@QueryParam("path") String filePath) {
		try {
			String fileName = URLDecoder.decode(filePath, "UTF-8");
			File file = new File(fileName);
			String content = FileUtils.readFileToString(file);

			return Response
					.ok(new FileModel(file.getName(), content, filePath))
					.build();
		} catch (Exception e) {
			return Response.serverError().build();
		}

	}
}
