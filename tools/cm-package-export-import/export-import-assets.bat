REM update below parametres before running the BAT file
REM Required for export path only
set es4ServerIP=10.42.80.22
set es4Serverport=8080

REM Required for import path only
set jee63ServerIP=10.42.80.22
set jee63Serverport=8080

REM ES4 CRX and doc services admin password
set es4CRXPassword=admin
set es4LCPassword=password

REM AEM forms JEE CRX admin's password

set jeeCRXPassword=admin

if "%1" == "" goto args_count_wrong
if "%2" == "" goto args_count_ok

:args_count_wrong
echo Exactly one command line argument should be passed, i.e import or export
exit /b 1

:args_count_ok
set Operation=%1

if '%Operation%' == 'export' goto exportFromES4
if '%Operation%' == 'import' goto importTo63

:exportFromES4
	REM Export from ES4:
	REM Install pre-migration utility
	curl -u admin:%es4CRXPassword% -F file=@"cm-pre-migration.zip" -F name="cm-pre-migration-package" -F force=true -F install=true http://%es4ServerIP%:%es4Serverport%/lc/crx/packmgr/service.jsp
	
	REM Run Pre-migration
	curl -u administrator:%es4LCPassword% http://%es4ServerIP%:%es4Serverport%/lc/content/changeType.html?actionType=1
	
	REM Import an existing package with predefined filter: 
	curl -u admin:%es4CRXPassword% -F file=@"form-manager-package.zip" -F name="form-manager-package" -F force=true -F install=false http://%es4ServerIP%:%es4Serverport%/lc/crx/packmgr/service.jsp

	REM Build it on the ES4 server
	curl -u admin:%es4CRXPassword% -X POST http://%es4ServerIP%:%es4Serverport%/lc/crx/packmgr/service/.json/etc/packages/my_packages/form-manager-package.zip?cmd=build

	REM Download the package locally as ExportedFMpkg.zip
	curl -u admin:%es4CRXPassword% http://%es4ServerIP%:%es4Serverport%/lc/etc/packages/my_packages/form-manager-package.zip>exported-form-manager-package.zip

	exit /b 0

:importTo63
	REM Import and install on 6.3 server :

	REM Import the package exported from ES4: 
	curl -u admin:%jeeCRXPassword% -F file=@"exported-form-manager-package.zip" -F name="exported-form-manager-package" -F force=true -F install=true http://%jee63ServerIP%:%jee63Serverport%/lc/crx/packmgr/service.jsp
