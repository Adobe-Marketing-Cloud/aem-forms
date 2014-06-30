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
