<%@include file="/libs/fd/af/components/guidesglobal.jsp"%>
<% //This should have been included by the page %>
<cq:includeClientLib categories="aemformsamples.axastyleguide"/>
<div data-dropdown="data-dropdown" class="<%= GuideConstants.GUIDE_FIELD_WIDGET%> dropdown">
  <div data-dropdown-label="data-dropdown-label" class="dropdown__label">
    <svg class="dropdown__label__icon">
    <% //You should externalize the path since the server can be started using a context Root %>
      <use xlink:href="/etc/clientlibs/aemformsamples/axastyleguide/images/icons.svg#arrow-bottom"></use>
    </svg>
    <div data-dropdown-text="data-dropdown-text" class="dropdown__label__text"></div>
  </div>
  <select data-dropdown-select="data-dropdown-select" class="dropdown__select">
     <c:forEach items="${guideField.options}" var="option" varStatus="loopCounter">
       <option value="${guide:encodeForHtmlAttr(option.key,xssAPI)}"> ${guide:encodeForHtml(option.value,xssAPI)} </option>
     </c:forEach>
  </select>
</div>