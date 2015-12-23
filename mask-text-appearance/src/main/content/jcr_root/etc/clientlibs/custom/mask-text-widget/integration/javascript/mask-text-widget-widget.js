(function($) {
    /*
     * As a sample the class is extending from textField, choose the required class to extend from (based on requirement):
     * - $.xfaWidget.abstractWidget: This is the parent of all the other widgets, and should be used only when any
     *                                specific widget below is not applicable.
     * - $.xfaWidget.defaultWidget: This widget extends from Abstract widget and provides the default implementation for
     *                               render, getOptionsMap and getCommitValue.
     * - $.xfaWidget.dateTimeEdit: This is Out-of-the-box widget for Date Picker.
     * - $.xfaWidget.dropDownList: This is Out-of-the-box widget for Drop-down list.
     * - $.xfaWidget.listBoxWidget: This is Out-of-the-box widget for List box (Drop-down
     *                              list with multi-select enabled).
     * - $.xfaWidget.numericInput: This is Out-of-the-box widget for Numeric fields.
     * - $.xfaWidget.signatureField: This is Out-of-the-box widget for Signature fields.
     * - $.xfaWidget.textField: This is Out-of-the-box widget for Text fields.
     * - $.xfaWidget.xfaButton: This is Out-of-the-box widget for buttons.
     * - $.xfaWidget.XfaCheckBox: This is Out-of-the-box widget for Check box and radio buttons fields.
     */

    $.widget( "xfaWidget.__widgetName__", $.xfaWidget.textField, {
        _widgetName:"__widgetName__",

        /*
         * The render function updates the HTML widget UI by invoking the JQuery plugin.
         * Every Adaptive Forms field uses a default html element for taking input, example: for Date Field the element
         * is <input type='date'>. The render function of the abstractWidget returns that element.
         */
        render : function() {
           var $el = $.xfaWidget.textField.prototype.render.apply(this,arguments);
           return $el;
        },

        /*
         * For reflecting the model changes the widget can register for the listeners in the getOptionsMap function.
         * For adding a listener ensure that instead of starting from scratch, get the option map from the super class.
         * The function returns a mapping which provides detail for what action to perform on change of an option. The
         * keys are the options that are provided to the widget and values are the function that should be called
         * whenever a change in that option is detected. The abstract Widget provides handlers for all the global
         * options (except value and displayValue). The various options include:
         * - tabIndex
         * - role
         * - screenReaderText
         * - paraStyles
         * - dir
         * - height
         * - width
         * - isValid
         * - access
         * - value
         * - displayValue
         * - placeholder
         * - items [ListBox, DropDownList]
         * - maxChars [TextField]
         * - multiLine [TextField]
         * - svgCaption [Button]
         * - allowNeutral [CheckBox]
         * You only need to override the options which require a behavior change (as compared to default Out-of-the-box
         * widget).
         */
        getOptionsMap: function(){
           var parentOptionsMap = $.xfaWidget.textField.prototype.getOptionsMap.apply(this,arguments),
           newMap = $.extend({},parentOptionsMap,
                               {
                                   "displayValue":function(value) {
                                       this.$userControl.val(value);
                                   },
                                   //...
                              });
           return newMap;
        },

        /*
         * To enable the widget to throw XFA events that, we need to modify the getEventMap function. The function
         * returns a mapping of html events to the XFA events. The code below provides a mapping which essentially tells
         * the XFA framework that whenever html triggers focus on the datepicker element (the $userControl element)
         * execute the XFA enter event and run any script written on that event for this field.
         * In case the custom widget requires to throw an HTML blur / change event on non-default actions as well, then
         * a custom event may be dispatched, and the custom event may be mapped with the XFA event below.
         */
        getEventMap: function() {
            var parentEventMap = $.xfaWidget.textField.prototype.getEventMap.apply(this,arguments),
            newMap = $.extend({},parentEventMap,
                               {
                                    blur: "xfaexit",
                                   //...
                              });
           return newMap;
        },

        /*
         * XFA provides display and edit picture clause which determines the format in which the value will be visible
         * in the UI and the input format in which the user will enter the value. The value the user enters into the
         * field is formatted after the user exits from the field and similarly when they enter the field, edit value is
         * displayed to them (As per mobile forms limitation, instead of edit Value, rawValue is displayed).

         * The framework accomplishes this by providing two values to the widget, displayValue and value. The framework
         * also calls the showDisplayValue function after the Exit event and showValue function before the Enter event
         * and it is the responsibility of the widget to implement how it wants these values to appear to the user.
         */
        showDisplayValue: function() {
           this.$userControl.val(this.options.displayValue)
        },

        showValue: function() {
            this.$userControl.val(this.options.value)
        },

        /*
         * According to the specification the value returned by the getCommitValue function of the widget is set to be
         * the value of the field. The framework calls the getCommitValue function to get the value at appropriate event
         * (The event for most fields is exit event, except for dropdown where the event can be change/exit).
         */
        getCommitValue: function() {
            return this.$userControl.val();
        }
    });
})(jQuery);
