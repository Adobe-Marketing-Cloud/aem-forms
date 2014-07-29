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

window.AdressLookupUtil = {};
(function(_, AdressLookupUtil) {
    /**
     * Function to fill the fields via address lookup.
     * @param src - Address lookup field
     * @param city - Field to be filled with city information
     * @param state - Field to be filled with state information
     * @param country - Field to be filled with country information
     */
    AdressLookupUtil.addressFill = function (src, city, state, country) {
        var addr = src.value;
        if (!_.isUndefined(addr) && !_.isNull(addr)) {
            var addrTokens = addr.split(',');
            if (!_.isUndefined(addrTokens[0])) {
                city.value = addrTokens[0];
            }
            if (!_.isUndefined(addrTokens[1])) {
                state.value = addrTokens[1];
            }
            if (!_.isUndefined(addrTokens[2])) {
                country.value = addrTokens[2];
            }
        }
    }
})(window._, window.AdressLookupUtil);
