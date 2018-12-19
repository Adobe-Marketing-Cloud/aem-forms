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
package com.adobe.fd.sample.core.components.models;

import com.adobe.aemds.guide.utils.GuideUtils;
import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.adobe.cq.sightly.SightlyWCMMode;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.Via;
import org.apache.sling.models.annotations.injectorspecific.ScriptVariable;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.inject.Inject;

@Model(
        adaptables = SlingHttpServletRequest.class,
        adapters = {ComponentExporter.class},
        resourceType = AEMFormModel.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
        name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
        extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class AEMFormModel  implements ComponentExporter {

    static final String RESOURCE_TYPE = "fd/sample/af/components/aemform/v1/aemform";
    static final String ADAPTIVE_FORM = "adaptiveForm";
    static final String ADAPTIVE_DOCUMENT = "adaptiveDocument";

    @Inject @Via("resource")
    private String themeRef;

    @Inject @Via("resource")
    private String formType;

    @Inject @Via("resource")
    private String icChannel;

    @Inject @Via("resource")
    private String formRef;

    @Inject @Via("resource")
    private String docRefWeb;

    @Inject @Via("resource")
    private String docRefPrint;

    @ScriptVariable
    private SightlyWCMMode wcmmode;

    @ScriptVariable
    private Resource resource;

    @Nullable
    public String getFormPath() {
        if (ADAPTIVE_FORM.equals(formType)){
            return formRef;
        } else if (ADAPTIVE_DOCUMENT.equals(formType)) {
            if ("printChannel".equals(icChannel)) {
                return docRefPrint;
            } else return docRefWeb;
        }
        return null;
    }

    @Nullable
    public String getGuidePath() {
        if (ADAPTIVE_FORM.equals(formType) && formRef != null) {
            return GuideUtils.guideRefToGuidePath(formRef) + ".html";
        } else if (ADAPTIVE_DOCUMENT.equals(formType)) {
            if ("webChannel".equals(icChannel) && docRefWeb != null) {
                return GuideUtils.guideRefToDocPath(docRefWeb) + ".html";
            } else if ("printChannel".equals(icChannel) && docRefPrint != null) {
                return docRefPrint + "/jcr:content";
            }
        }
        return null;
    }

    public String getThemeRef() {
        return themeRef;
    }
    
    public Boolean getIsValidForm(){
        ResourceResolver resourceResolver = resource.getResourceResolver();
        String formPath = getFormPath();

        if("".equals(formPath)) {
            return false;
        }

        if (resourceResolver == null){
            return false;
        }

        Resource formResource = resourceResolver.getResource(formPath);
        if (formResource == null) {
            return false;
        }
        Resource jcrContent = formResource.getChild("jcr:content");
        if (jcrContent == null) {
            return false;
        }
        ValueMap props = jcrContent.getValueMap();
        if (props.get("guide", 0) != 1 && props.get("mcdocument", 0) != 1) {
            return false;
        }
        return true;
    }

    public String getFormType(){
        return formType;
    }

    @Nullable
    public String getIcChannel() {
        if (ADAPTIVE_DOCUMENT.equals(formType)) {
            return icChannel;
        }
        return null;
    }

    public String getWcmMode() {
        if (wcmmode.isPreview() || wcmmode.isEdit()) {
            return "preview";
        }
        return "disabled";
    }

    @Nonnull
    @Override
    public String getExportedType() {
        return this.RESOURCE_TYPE;
    }
}
