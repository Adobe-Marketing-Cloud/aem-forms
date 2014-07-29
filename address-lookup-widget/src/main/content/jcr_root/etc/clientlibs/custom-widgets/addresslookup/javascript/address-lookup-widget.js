/******************************************************************************
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
 * terms of the Adobe license agreement accompanying it.  If you have received this file from a
 * source other than Adobe, then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
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
