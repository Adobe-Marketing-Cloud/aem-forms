# Summary

Use these scripts and packages to migrate Correspondence Management data from LiveCycle ES4 to AEM 6.3 Forms JEE installation.

# Running the Script

The main script is Export_ImportAssets.bat (or .sh file). The parameters used to run the script are in the script itself. So, before running the script, it needs to be modified and environment specific values need to be set. Following need to be set in the script:
* es4ServerIP: The IP address of your Livecycle ES4 environment
* es4Serverport: The port at which the ES4 server is running
* jee63ServerIP: The IP address of your AEM 6.3 Forms JEE environment
* jee63Serverport: The port at which AEM 6.3 Forms JEE server is running
* es4CRXPassword: CRX admin's password of the ES4 environment
* es4LCPassword: Super Administrator's password of ES4 environment
* jeeCRXPassword: CRX admin's password of AEM 6.3 Forms JEE environment

After setting the variables, run the Export_ImportAssets.bat (or .sh file) passing either import or export as parameter. The script takes only one command line parameter. Please note that other ZIP files would need to be present in the same folder as the script.

