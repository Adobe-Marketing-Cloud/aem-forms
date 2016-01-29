#DropDownField based on AXA Style Guide

Adaptive Form provides ability to have custom widgets for a particular field. This sample creates a Drop Down List based
on [AXA Style Guide](http://design.axa.ch/components/form-and-input-elements/dropdown.html)

The last section provides a step-by-step guide to build the DropDownField on your own. But if time doesn't persist, you
can build the package and install it via Package Manager into your CQ-Instance

*Note*: This project has been built using the maven-archetype custom-appearance-archetype. The archetype only created
the directory src/main/content/jcr_root/etc/clientlibs/custom. The rest of the directories are created on CRXDE and
copied here using the vlt tool

## Building

This project uses Maven for building (Minimum maven version 3.1.0). Common commands:

From the project directory, run ``mvn clean install`` to build.

## Using with VLT

To use vlt with this project, first build and install the package to your local CQ instance as described above.
Then cd to `src/main/content/jcr_root` and run

    vlt --credentials admin:admin checkout -f ../META-INF/vault/filter.xml --force http://localhost:4502/crx

Once the working copy is created, you can use the normal ``vlt up`` and ``vlt ci`` commands.

## Specifying CRX Host/Port

The CRX host and port can be specified on the command line with `mvn -Dcrx.host=otherhost -Dcrx.port=5502 <goals>`

## How to create a DropDownField based on Axa Style Guide

Note: Make sure you save your changes after each and every step

* Login to CRXDE Lite `http://<hostname>:<port>/crx/de` and create a folder `/apps/aemformsamples/components`
* Copy the OOTB Dropdown Field from `/libs/fd/af/components/guidedropdownlist` into the folder created in step 1
* Rename `/apps/aemformsamples/components/guidedropdownlist` to `/apps/aemformsamples/components/axaguidedropdownlist`
   and change the following properties of the `axaguidedropdownlist` node
    * jcr:description : Axa Drop-down list
    * jcr:title : Axa Drop-down list
    * sling:resourceSuperType: fd/af/components/guidedropdownlist
* It is important to make sure the value of *sling:resourceSuperType* property should match what is written aboce,
since we are extending the OOTB Drop-down List. For the purpose of this tutorial we are keeping the *componentGroup*
property to be *Adaptive Form*, but you can move to any group you want.
* Navigate to `/apps/aemformsamples/components/axaguidedropdownlist` and delete all the files/nodes inside the
`axaguidedropdownlist` except widget.jsp and cq:template node
* Now open a new or any existing Adaptive Form in Authoring and you should be able to see the *Axa Drop-down list* in
the sidekick. Drop the Field in the Form. The field will look similar to the OOTB Drop-down list since we haven't
changed anything.

As per the AXA style-guide we need a JavaScript and CSS file that can be downloaded as an
[npm package](http://design.axa.ch/fundamentals/code/getting-started.html#use-npm). The recommended approach in AEM is
to create clientlibs for JavaScript and CSS and use those clientlibs to put the script in HTML Markup. For the same, we
will create a clientlib in /etc/clientlibs/aemformsamples/.

### Include Axa Style Guide in AEM as a clientlib.

* Navigate to /etc/clientlibs/aemformsamples folder. Create if the folder doesn't exists
* Create a Node *axastyleguide* of type *cq:ClientLibraryFolder* inside aemformsamples folder.
* Create two folders js and css and two files css.txt and js.txt inside the *axastyleguide* node. Upload the JavaScript
and CSS files obtained from Axa Style Guide into js and css folders respectively.
* Also create icons and images folder and upload the images and icons in them.

*Note*: To upload files you can read this
[article](http://blogs.adobe.com/dekesmith/2012/05/22/place-simple-html-and-image-files-online-with-crx-and-cq/)

* open the css.txt file and copy the following code
```
#base=css
normalize.css
style.css
```
* open the js.txt file and copy the following code
```
#base=js
style-guide.js
```

*Note:* In css.txt and js.txt files we mention the files that will be combined to form a single file and sent to the
client. If you want minified files to be sent, then put the names of the minified files.

* Now go to the clientlib folder *axastyleguide* and a multi string property *categories* with a value
*aemformsamples.axastyleguide*. This can be considered as the name of this clientlib using which the JavaScript and
CSS files can be referred in JSP.

### Modify the markup of Drop-down list to match the markup specified in Axa Style Guide

* Open /apps/aemformsamples/components/axaguidedropdownlist/widget.jsp and replace the code in that file with the markup
specified by AXA Style Guide for the DropDownList
```jsp
<div data-dropdown="data-dropdown" class="dropdown">
  <div data-dropdown-label="data-dropdown-label" class="dropdown__label">
    <svg class="dropdown__label__icon">
    <% //You should externalize the path since the server can be started using a context Root %>
      <use xlink:href="/etc/clientlibs/aemformsamples/axastyleguide/images/icons.svg#arrow-bottom"></use>
    </svg>
    <div data-dropdown-text="data-dropdown-text" class="dropdown__label__text"></div>
  </div>
  <select data-dropdown-select="data-dropdown-select" class="dropdown__select">
    <% // The options should actually match the items specified in dialog %>
    <option>Schweiz</option>
    <option>Regenbogenland</option>
  </select>
</div>
```
* Now we need to include the JavaScript and CSS files provided in AXA Style Guide in the page as well. For this sample
we are including that in the widget.jsp but as per recommendation the style guide should be included in the head section
of the page. So at the top of widget.jsp paste the code below
```jsp
<%@include file="/libs/fd/af/components/guidesglobal.jsp"%>
<% //This should have been included by the page %>
<cq:includeClientLib categories="aemformsamples.axastyleguide"/>
```

* Now open the form where you have added the Axa Drop-down list earlier in authoring. The Field will now look similar to
 one provided in AXA Style Guide.

But still the options that you specify in the dialog are not visible in the Dropdown. To achieve that you need to modify
widget.jsp to read the options that the user have specified in the dialog.

* In widget.jsp replace the code
```
<% // The options should actually match the items specified in dialog %>
<option>Schweiz</option>
<option>Regenbogenland</option>
```
with
```
<c:forEach items="${guideField.options}" var="option" varStatus="loopCounter">
    <option value="${guide:encodeForHtmlAttr(option.key,xssAPI)}"> ${guide:encodeForHtml(option.value,xssAPI)} </option>
</c:forEach>
```

Note: guideField here represents the Model of the Guide Drop-down list which provides API to access the properties that
user have specified in the dialog. To see how this is initialized you can have a look at the init.jsp in the OOTB
dropdownlist component.

### Making the Field work in Runtime

Now everything works fine in Authoring. Previewing the form also looks OK but the value selected in the AXA Drop-down
list is not submitted. The reason for that is the Adaptive Forms runtime expects the input/textarea/select/button fields
to be wrapped in a div element which should have a css Class with value equal to the Java Constant GuideContants
GuideConstants.GUIDE_FIELD_WIDGET.

Adaptive Forms runtime then passes that div element to a jQuery Widget which we internally call as xfa widget. The XFA
widget understands that HTML markup and passes the value from that markup to the client. Some xfa widgets remove the
markup and insert their own.

The good thing is that we have a set of guides that help you create your own custom xfa widget and use it for your
custom fields

* But first thing first, we need to add the required class in the HTML Markup. In the widget.jsp, replace line 4
```
<div data-dropdown="data-dropdown" class="dropdown">
```
with
```jsp
<div data-dropdown="data-dropdown" class="<%= GuideConstants.GUIDE_FIELD_WIDGET%> dropdown">
```

* Using the maven-archetype: custom-appearance-archetype create a maven project. The
[article](https://helpx.adobe.com/aem-forms/6-1/custom-appearance-widget-adaptive-form.html) explains how to create
that. For the purpose of this tutorial make sure you specify the name of the widget while creating maven project to
axaguidedropdownlist.