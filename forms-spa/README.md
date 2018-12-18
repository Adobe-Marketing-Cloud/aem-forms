# AEM Form Component
Contains AEM Form Component for use in an SPA project

For getting started on developing and authoring Single Page Applications (SPAs) in AEM follow [here](https://helpx.adobe.com/experience-manager/6-4/sites/developing/user-guide.html?topic=/experience-manager/6-4/sites/developing/morehelp/spa.ug.js)

## Modules

This project contains:

* `content`: Content Package containing the [AEM Form](content/jcr_root/apps/fd/sample/af/components/aemform/v1/aemform) component.
* `bundles/core`: Core bundle package containing the [sling model](bundles/core/src/main/java/com/adobe/fd/core/components/models/AEMFormModel.java) for AEMForm.
* `react-component`: Sample react component for AEMForm to use it in AEM SPA Editor


## Build

The project has the following minimal requirements:
* Java SE Development Kit 8 or newer
* Apache Maven 3.3.1 or newer

For ease of build and installation the following profiles are provided:

 * ``autoInstallSinglePackage`` - install everything to an existing AEM author instance, as specified by ``http://${aem.host}:${aem.port}``
 * ``autoInstallSinglePackagePublish`` - install everything to an existing AEM publish instance, as specified by ``http://${aem.publish.host}:${aem.publish.port}``
 * ``autoInstallPackage`` - installs the package/bundle to an existing AEM author instance, as specified by ``http://${aem.host}:${aem.port}``
 * ``autoInstallPackagePublish`` - installs the package/bundle to an existing AEM publish instance, as specified by ``http://${aem.publish.host}:${aem.publish.port}``

### UberJar and aemfd-client-sdk

This project relies on the unobfuscated AEM 6.3 cq-quickstart and latest aemfd-client-sdk. Both are publicly available on https://repo.adobe.com

For more details about the UberJar please head over to the
[How to Build AEM Projects using Apache Maven](https://helpx.adobe.com/experience-manager/6-4/sites/developing/using/ht-projects-maven.html) documentation page.

### Install everything

You can install everything needed to use the components on your running AEM instance by issuing the following command in the top level folder of the project:

    mvn clean install -PautoInstallSinglePackage

### Individual packages/bundles

You can install individual packages/bundles by issuing the following command in the top level folder of the project:

    mvn clean install -PautoInstallPackage -pl <project_name(s)> -am

Please note that

 * ``-pl/-projects`` option specifies the list of projects that you want to install
 * ``-am/-also-make`` options specifies that dependencies should also be built

 For more information how to setup the Adobe Maven Repository (`repo.adobe.com`) for your maven build, please have a look at the
 related [Knowledge Base article](https://helpx.adobe.com/experience-manager/kb/SetUpTheAdobeMavenRepository.html)
