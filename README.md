devcloud
========

CENG 491-492 Graduation Project

setup

========

to run the project you need mvn tool.
run "mvn clean install" on java/osgi/ and after installation run java/osgi/laucher/target/launcher-0.1.jar.
if you run the launcher-0.1.jar in the java/osgi/ directory, mvn clean install will also clean the files generated by sling.
otherwise, you should do so manually, in order to see the effect of updates on the bundles.

to debug run the launcher-0.1.jar with:

java -jar -Xdebug -Xrunjdwp:transport=dt_socket,address=30303,server=y,suspend=n launcher/target/launcher-0.1.jar

command and from eclipse create a remote java application debug configuration with

host:localhost
port:30303

and in the source tab, add the desired java projects.

=======

for server project download tomcat 7 from the website
extract it somewhere in your home folder (do not install it by using apt-get install)
edit the tomcat-users.xml in conf directory and add:

&lt;user password="admin" roles="admin-gui,manager-gui,admin-script,manager-script" username="admin" /&gt;

create a database named devcloud (database username, password, name can be set in persistence.xml)

run tomcat with command ./bin/catalina.sh run after adding execute permissions to catalina.sh file. 
For debugging run ./catalina.sh jpda run

In server directory, for the deploying run: mvn clean install cargo:deploy
for redeploying run: mvn clean install cargo:redeploy
