address-lookup-widget
======

Adaptive Form provides ability to configure a cutom widget for a particular field or set of fields. It exposes certain APIs and event that the custom widget has to implement and dispatch in order to work well with rest of the Adaptive Form infrastructure. In this sample, we have added a custom address lookup widget which is based on [jquery autocomplete widget] (http://jqueryui.com/autocomplete/) and pulls data from [geonames.org](http://www.geonames.org/) REST endpoint.

This a content package project generated using the simple-content-package-archetype. This package would contain the widget javascript under /etc/clientlibs/custom-widgets/addresslookup folder and a sample Adaptive Form demonstrating usage of the widget at http://localhost:4502/content/forms/af/widget-sample/addreslookupsample.html once that package is deployed.

Building
--------

This project uses Maven for building (Minimum maven version 3.1.0). Common commands:

From the project directory, run ``mvn clean install`` to build the bundle and content package and install to a CQ instance.

Using with VLT
--------------

To use vlt with this project, first build and install the package to your local CQ instance as described above. Then cd to `src/main/content/jcr_root` and run

    vlt --credentials admin:admin checkout -f ../META-INF/vault/filter.xml --force http://localhost:4502/crx

Once the working copy is created, you can use the normal ``vlt up`` and ``vlt ci`` commands.

Specifying CRX Host/Port
------------------------

The CRX host and port can be specified on the command line with:
mvn -Dcrx.host=otherhost -Dcrx.port=5502 <goals>

