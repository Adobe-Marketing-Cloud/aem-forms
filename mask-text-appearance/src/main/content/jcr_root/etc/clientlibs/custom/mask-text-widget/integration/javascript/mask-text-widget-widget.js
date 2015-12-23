(function($) {
    $.widget( "xfaWidget.masktextwidget", $.xfaWidget.textField, {
        _widgetName:"masktextwidget",

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
                            this.showDisplayValue();
                        }
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
            if (this.options.displayValue != null) {
                this.$userControl.val(this.options.displayValue.replace( /./g, "*"));
            } else {
                this.$userControl.val("");
            }
        }
    });
})(jQuery);
