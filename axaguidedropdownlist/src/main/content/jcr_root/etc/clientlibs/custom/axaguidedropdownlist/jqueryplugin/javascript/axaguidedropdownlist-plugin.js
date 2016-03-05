/*
 * The file is a template for adding the JQuery plugin being used for the custom widget.
 * The JQuery plugin will be called from the render method for the custom widget (for more details please refer
 * to the <widgetName>-widget.js file in the integration folder of the project template).
 */

/*
 * In case you want to add multiple files or use custom file name, place the file in the current location,
 * and update the js.txt file in the parent folder to include the new files.
 */

/*
 * The framework supports JQuery plugins compatible with JQuery version 1.8.0. Here is a list of requirements /
 * recommendations for easy integration and compatibility with the Plugin framework provided by Adaptive Forms:
 * 1. Identify the $userControl element. The $userControl element should satisfy the following:
 *    - It should be of focusable type. For example, <a>, <input>, and <li> (If the $userControl satisfies this
 *      constraint, then functions of the AbstractWidget class work as expected, otherwise some of the common APIs
        (focus, click) require changes.
 *    - The $userControl object should contain the value of the element, so that in case an HTML change event is thrown
 *      the value is available to the appropriate listener.
 * 2. The plugin should return the $userControl object, or a wrapper object which provides access to the $userControl
 *    object. This is required to retrive the $userControl object in the render method.
 * 3. In case the value of the $userControl object is modified without a focus on the object, you would need to
 *    explicitly invoke the focus() API before calling the val() API, e.g.: clone.focus().val(n);
 * 4. The access property of the user control is modified based on the 'Access expression' of the field. In case your
 *    widget has UI components other than the user control, ensure that the readonly property is is updated for these
 *    components when the readonly property for the user control is modified (for more details please refer
 *    to the <widgetName>-widget.js file in the integration folder of the project template).
 */

 /*
  * For more information on creating custom appearances, please refer to:
  * - http://blogs.adobe.com/experiencedelivers/experience-management/aem-forms-using-custom-widget-adaptive-form/
  * - https://helpx.adobe.com/aem-forms/6/html5-forms/custom-widgets.html (Custom Appearance framework in Adaptive Forms
  *   is based on the framework provided by HTML5 forms).
  */
