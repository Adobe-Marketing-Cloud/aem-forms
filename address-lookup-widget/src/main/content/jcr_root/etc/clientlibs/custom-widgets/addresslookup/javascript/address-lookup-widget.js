/******************************************************************************
 * Copyright 2014 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *****************************************************************************/

(function($) {
    //Creating a widget extending the textfield.
    $.widget( "xfaWidget.addressLookupWidget", $.xfaWidget.textField, {

        _widgetName:"addressLookupWidget",

        //overriding render of text field.
        render : function() {
            var $control = $.xfaWidget.defaultWidget.prototype.render.apply(this, arguments);
            if($control){
                $control.autocomplete({
                    source: function( request, response ) {
                        $.ajax({
                            url: "http://ws.geonames.org/searchJSON?username=demo", //one can have their own username registered with geonames.org
                            dataType: "jsonp",
                            data: {
                                featureClass: "P",
                                style: "MEDIUM",
                                maxRows: 12,
                                name_startsWith: request.term
                            },
                            success: function( data ) {
                                response( $.map( data.geonames, function( item ) {
                                    return {
                                        label: [item.name, item.adminName1, item.countryName],
                                        value: [item.name, item.adminName1, item.countryName]
                                    }
                                }));
                            }
                        });
                    },
                    minLength: 2,
                    select: function( event, ui ) {
                        console.log( ui.item ?
                            "Selected: " + ui.item.label :
                            "Nothing selected, input was " + this.value);
                    },
                    open: function() {
                        $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
                    },
                    close: function() {
                        $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
                    }
                });
            }
            return $control;
        }

    });
})(jQuery);
