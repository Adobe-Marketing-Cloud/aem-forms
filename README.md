#AEM Form Samples

A collection of samples for [Adaptive Forms](http://helpx.adobe.com/aem-forms/6/help-tutorials.html) and Mobile Forms. Anybody can use the samples provided in the repository provided they agree to the LICENSE Agreement. This small guide is provided here to help you to use the samples present in the repository and add many more to help others.

#Using The Samples

## Browse
Each sample is a maven project and code of the sample is provided in its own directory. You can browse through the
code for each of the samples. You can also browse through each of the sample at page. Each sample has a page where
you can find the Instructions and other information regarding that.

## Downloading
Most of the samples are maven projects and you can build them on your machine. For others the instructions are provided
in the Readme file for each project.

##Building the Samples
You can also choose to build the samples from command line. But before that you have to make sure that you have git
installed in your system. If you have not installed git on your system, please follow the instructions mentioned
[here](http://git-scm.com/book/en/Getting-Started-Installing-Git) to install it.

After you have installed git, you can clone the repository using the command

    git clone git@github.com:Adobe-Marketing-Cloud/aem-forms.git

The project uses [Maven](http://maven.apache.org/) for building the samples. If you have not installed maven on your
machine download it from Maven website and install it.

To build the sample you want to install navigate to the sample-directory using ``cd sample-directory``. Replace
``sample-directory`` with the actual name of the directory.

Now run the command ``mvn clean install``, This will build the package and put the artifacts in the ``target``
directory which can then be installed from the
[package manger](http://docs.adobe.com/docs/en/aem/6-0/administer/content/package-manager.html#Package Manager) of
your instance.

Some samples provide a different mechanism to install the packages, so it is always better to see the instructions
provided in the samples web page.

#Contributing

To contribute and a samples into the directory, you need to fork the repository. If you are hearing this term for the
 first time, this [article](https://help.github.com/articles/fork-a-repo) explains the entire procedure.

Before contributing and adding samples in the repository, you need to decide what kind of sample you want to create:

1. a simple content-package,
2. a content-package with embedded-artifacts or
3. a multi-module application that accomodates the development of Java classes and unit tests.

Based on the type of your sample, you need to use the
[maven-archetype](http://dev.day.com/docs/en/cq/current/core/how_to/how_to_use_the_vlttool/vlt-mavenplugin.html#Using Archetypes To Generate CQ Projects)
to generate an empty project. You have to use the ``mvn archtype`` command to generate the initial folder structure

```
mvn archetype:generate -DarchetypeGroupId=com.day.jcr.vault
-DarchetypeArtifactId={id_of_archetype} -DarchetypeVersion=1.0.2
 -DarchetypeRepository=adobe-public-releases
```
Maven will ask for the following values.

* groupId: com.mycompany.afsamples
* artifactId: <name of your sample>. Do not use a name already used.
* version:
* package: com.mycompany.afsamples
* appsFolderName: <your sample folder name>. Do not use a name that already exists.
* artifactName: <name of the artifact>
* packageGroup: <name of your content-package>

This will generate a directory structure depending upon the architecture you chose. Make sure you add a description
in your pom files. The Description will be visible after installing the package in CRX Package Manager.

Make sure you add the License headers present in your entire source code files. Use the content of the copyright
file at the root of this repository and modify the copyright header (year and author name).

##Generating the documentation

Each sample that is added in thr repository will be listed at [link-missing] and will have a page at [link-missing].
We use github-pages and jekyll to host the web pages. If you are already familiar with that, you can proceed and add
your  documentation as per your wish. But we have some restraints[link-missing] on that which you would want to have a
look at before proceeding.

But if don't know about these technologies, we have a good news for you. We have a tool that will do the work for you
. You can have a look at the [link-missing] for more details about the tool

1. Add a README.md in the sample directory. The file should be written using the [markdown](http://daringfireball.net/projects/markdown/) syntax. The file should have detail instructions about the sample.
2. Add a docs directory in your samples-directory.
3. Add a screenshot.png which shows what your sample is all about inside the docs directory.
4. Install the generate-doc.sh file from [link-missing]
5. From the root of the project directory run the command ``./generate-doc.sh sample-directory`. Replace
`sample-directory` with the actual name of the directory.

Have Fun !