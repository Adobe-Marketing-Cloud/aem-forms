## AEM Form React Component for SPA - Editor
This package contains the AEMForm Component written in react to use in AEM SPA Editor.

## Steps:
The following steps document how to include an aemform component in AEM SPA Editor:
1) Download and unzip the latest [We.Retail journal code from Github](https://github.com/adobe/aem-sample-we-retail-journal).
2) Copy paste the [AEMForm component](src/components/AEMForm.js) and [test file](tests/AEMForm.test.js) in the components and tests folder of react-app package in the downloaded source.
3) Include the aemform component in the [ImportComponent.js](https://github.com/adobe/aem-sample-we-retail-journal/blob/master/react-app/src/ImportComponents.js) file.
4) The aemform component uses jquery. Install jquery in the npm project using ```npm install jquery --save```
5) Modify the [policy](https://github.com/adobe/aem-sample-we-retail-journal/blob/master/content/jcr_root/conf/we-retail-journal/react/settings/wcm/policies/.content.xml) (content/jcr_root/conf/we-retail-journal/react/settings/wcm/policies/.content.xml) to include the aemform component resource type('fd/sample/af/components/aemform/v1/aemform')
6) Build and deploy the source package

## Limitations
1) Experience targeting and A/B tests configured in the original adaptive form do not work from the SPA app. 
2) If Adobe Analytics is configured on the original form, the analytics data is captured in Adobe Analytics server. However, it is not available in the Forms analytics report.

## SPA Editor
For getting started on developing and authoring Single Page Applications (SPAs) in AEM follow [here](https://helpx.adobe.com/experience-manager/6-4/sites/developing/user-guide.html?topic=/experience-manager/6-4/sites/developing/morehelp/spa.ug.js)
