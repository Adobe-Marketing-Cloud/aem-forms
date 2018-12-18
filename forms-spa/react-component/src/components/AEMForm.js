/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2018 Adobe Systems Incorporated
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import React, {PureComponent} from 'react';
import {MapTo} from '@adobe/cq-react-editable-components';
import $ from 'jquery';

require('./AEMForm.css');

const AEMFormEditConfig = {

    emptyLabel: 'AEMForm',

    isEmpty: function(props) {
        return !props || !props.formPath || props.formPath.trim().length < 1;
    }
};

/**
 * React Component for AEM Form to use in AEM SPA Editor.
 *
 * Component props -
 *  formPath : String : form path
 *  guidePath : String : actual form path if it is a valid form
 *  formType : String : "adaptiveForm" or "adaptiveDocument"
 *  themeRef : String  : path to theme
 *  isValidForm : Boolean : true if the path points to a valid form
 *  icChannel : String : "webChannel" or "printChannel"
 *  wcmMode : String : wcmmode to use to render the form
 */
export class AEMForm extends PureComponent {

    //loads the aemform inside the <div> element
    fillFormContainer(){
        if (this.props.formPath) {
            if (this.props.isValidForm) {
                let url = this.props.guidePath;

                let params = {
                    'wcmmode' : this.props.wcmMode,
                };
                if (this.props.themeRef) {
                    params['themeOverride'] = this.props.themeRef;
                }
                const dataRef = (new URL(parent.location)).searchParams.get("dataRef");
                if (dataRef) {
                    params["dataRef"] = dataRef;
                }
                if (this.props.formType === 'adaptiveDocument' && this.props.icChannel === 'printChannel') {
                    params['channel'] = 'print';
                    params['mode'] = 'preview';
                }

                let query = Object.keys(params)
                                .map(k => k + "=" + params[k])
                                .join('&');
                url = url + '?' + query;

                if (this.props.formType === 'adaptiveDocument' && this.props.icChannel === 'printChannel') {
                    document.getElementsByClassName('aemformcontainer')[0].innerHTML = '<object class="adaptiveDocument" type="application/pdf" width="100%" height="1000px" data="' + url + '"></object>';
                } else {
                    fetch(url)
                        .then(response => response.text())
                        .then(data => {
                            // jquery is used instead of dom api to set inner HTML since the latter would not evaluate script tags in HTML as per the HTML5 spec
                            $(".aemformcontainer").html(data);
                        });
                }
            } else {
                if (window.Granite && window.Granite.I18n) {
                    document.getElementsByClassName("aemformcontainer")[0].innerHTML = "<p>" + window.Granite.I18n.get("You need to select a valid form") + "</p>";
                } else {
                    document.getElementsByClassName("aemformcontainer")[0].innerHTML = "<p>You need to select a valid form</p>";
                }
            }
        } else {
            document.getElementsByClassName("aemformcontainer")[0].innerHTML = '';
        }
    }

    componentDidMount(){
        this.fillFormContainer();
    }

    componentDidUpdate(){
        this.fillFormContainer();
    }

    render(){
        return <div className="aemformcontainer"></div>
    }
}

MapTo('fd/sample/af/components/aemform/v1/aemform')(AEMForm, AEMFormEditConfig);