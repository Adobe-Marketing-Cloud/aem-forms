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

import com.adobe.cq.sightly.WCMBindings;
import com.adobe.cq.wcm.core.components.testing.MockAdapterFactory;
import com.adobe.fd.sample.core.components.models.AEMFormModel;
import io.wcm.testing.mock.aem.junit.AemContext;
import io.wcm.testing.mock.aem.junit.AemContextCallback;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.scripting.SlingBindings;
import org.apache.sling.models.impl.ResourceTypeBasedResourcePicker;
import org.apache.sling.models.spi.ImplementationPicker;
import org.apache.sling.testing.mock.sling.ResourceResolverType;
import org.apache.sling.testing.mock.sling.servlet.MockSlingHttpServletRequest;
import org.junit.*;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class AEMFormModelTest {

    protected static final String ADAPTIVE_FORM = "/content/sample/adaptiveForm";
    protected static final String IC = "/content/sample/ic";
    protected static final String GUIDE_RESOURCE = "/content/dam/formsanddocuments/form1";
    protected static final String IC_RESOURCE = "/content/dam/formsanddocuments/form2";

    @ClassRule
    public static final AemContext aemContext = new AemContext(
            (AemContextCallback) context -> {
                context.registerService(ImplementationPicker.class, new ResourceTypeBasedResourcePicker());
                context.load().json("/adaptiveForm.json", ADAPTIVE_FORM);
                context.load().json("/guideResource.json",GUIDE_RESOURCE);
                context.load().json("/adaptiveDoc.json",IC);
                context.load().json("/icResource.json", IC_RESOURCE);
                context.registerInjectActivateService(new MockAdapterFactory());
            },
            ResourceResolverType.JCR_MOCK
    );

    @Test
    public void testGetFormPath() {
        AEMFormModel aemFormModel = getFormUnderTest(AEMFormModel.class, ADAPTIVE_FORM);
        assertEquals(GUIDE_RESOURCE, aemFormModel.getFormPath());

        aemFormModel = getFormUnderTest(AEMFormModel.class, IC);
        assertEquals(IC_RESOURCE, aemFormModel.getFormPath());
    }

    @Test
    public void testGetGuidePath() {
        AEMFormModel aemFormModel = getFormUnderTest(AEMFormModel.class, ADAPTIVE_FORM);
        assertEquals("/content/forms/af/form1/jcr:content/guideContainer.html", aemFormModel.getGuidePath());

        aemFormModel = getFormUnderTest(AEMFormModel.class, IC);
        assertEquals("/content/forms/af/form2/channels/web/jcr:content/guideContainer.html", aemFormModel.getGuidePath());
    }

    @Test
    public void testGetThemeRef() {
        AEMFormModel aemFormModel = getFormUnderTest(AEMFormModel.class, ADAPTIVE_FORM);
        assertEquals("/path/to/theme", aemFormModel.getThemeRef());

        aemFormModel = getFormUnderTest(AEMFormModel.class, IC);
        assertEquals("/path/to/theme", aemFormModel.getThemeRef());
    }

    @Test
    public void testGetFormType(){
        AEMFormModel aemFormModel = getFormUnderTest(AEMFormModel.class, ADAPTIVE_FORM);
        assertEquals("adaptiveForm", aemFormModel.getFormType());

        aemFormModel = getFormUnderTest(AEMFormModel.class, IC);
        assertEquals("adaptiveDocument", aemFormModel.getFormType());
    }

    @Test
    public void testGetIsValidForm(){
        AEMFormModel aemFormModel = getFormUnderTest(AEMFormModel.class, ADAPTIVE_FORM);
        assertTrue(aemFormModel.getIsValidForm());

        aemFormModel = getFormUnderTest(AEMFormModel.class, IC);
        assertTrue(aemFormModel.getIsValidForm());
    }

    @Test
    public void testGetIcChannel() {
        AEMFormModel aemFormModel = getFormUnderTest(AEMFormModel.class, ADAPTIVE_FORM);
        assertNull(aemFormModel.getIcChannel());

        aemFormModel = getFormUnderTest(AEMFormModel.class, IC);
        assertEquals("webChannel", aemFormModel.getIcChannel());
    }

    @Test
    public void testGetExportedType() {
        AEMFormModel aemFormModel = getFormUnderTest(AEMFormModel.class, ADAPTIVE_FORM);
        assertEquals("fd/sample/af/components/aemform/v1/aemform",aemFormModel.getExportedType());

        aemFormModel = getFormUnderTest(AEMFormModel.class, IC);
        assertEquals("fd/sample/af/components/aemform/v1/aemform",aemFormModel.getExportedType());
    }

    protected <T> T getFormUnderTest(Class<T> model, String resourcePath) {
        Resource resource = aemContext.resourceResolver().getResource(resourcePath);
        if (resource == null) {
            throw new IllegalStateException("Did you forget to define test resource " + resourcePath + "?");
        }
        MockSlingHttpServletRequest request = new MockSlingHttpServletRequest(aemContext.resourceResolver(), aemContext.bundleContext());
        SlingBindings bindings = new SlingBindings();
        bindings.put(SlingBindings.RESOURCE, resource);
        bindings.put(SlingBindings.REQUEST, request);
        bindings.put(WCMBindings.PROPERTIES, resource.getValueMap());
        request.setResource(resource);
        request.setAttribute(SlingBindings.class.getName(), bindings);
        return request.adaptTo(model);
    }
}
