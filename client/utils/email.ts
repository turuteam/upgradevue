import { sanitizeHtmlChild } from '@/utils/html-element';

export const injectInformationToUnlayerHtml = (
  template: string,
  previewText: string | null,
  senderName: string | null,
  businessAddress: string | null,
  hasUnsubscribeLink: boolean,
): string => {
  let finalTemplate = template;
  let cursorPosition;

  // Sanitize to prevent insertion (and execution) of HTML elements where they shouldn't exist
  const sanitizedPreviewText = sanitizeHtmlChild(previewText) || "";
  const sanitizedSenderName = sanitizeHtmlChild(senderName);
  const sanitizedBusinessAddress = sanitizeHtmlChild(businessAddress);

  // Inject preview text
  const bodyTagMatches = finalTemplate.match(/<body .*>/);
  const bodyTagString = bodyTagMatches ? bodyTagMatches[0] : '<body>';
  cursorPosition = finalTemplate.indexOf(bodyTagString) + bodyTagString.length;
  finalTemplate = `
    ${finalTemplate.slice(0, cursorPosition)}
      <span ar-preview-text class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${sanitizedPreviewText}</span>
    ${finalTemplate.slice(cursorPosition)}
  `;

  cursorPosition = finalTemplate.lastIndexOf('</body>');
  finalTemplate = `
    ${finalTemplate.slice(0, cursorPosition)}
      <p style="text-align:center; margin-top: 16px;">
        <div></div>
      </p>
    ${finalTemplate.slice(cursorPosition)}
  `;

  // Inject Message Sender Information
  if (sanitizedSenderName || sanitizedBusinessAddress) {
    cursorPosition = finalTemplate.lastIndexOf('<div');
    finalTemplate = `
      ${finalTemplate.slice(0, cursorPosition)}
        <div style="text-align:center;">
          <span style="font-size: 12px; text-align: center; color: #9fa8b5; font-family: Helvetica, sans-serif;">${sanitizedSenderName}</span>
        </div>
        <div style="text-align:center;">
          <span style="font-size: 12px; text-align: center; color: #9fa8b5; font-family: Helvetica, sans-serif;">${sanitizedBusinessAddress}</span>
        </div>
      ${finalTemplate.slice(cursorPosition)}
    `;
  }

  // Inject opt out link
  if (hasUnsubscribeLink) {
    cursorPosition = finalTemplate.lastIndexOf('<div');
    finalTemplate = `
      ${finalTemplate.slice(0, cursorPosition)}
        <div style="text-align:center;">
          <a clicktracking=off href="{{ar_unsubscribe_link}}" target="__blank" style="font-size: 12px; color: #9fa8b5; font-family: Helvetica, sans-serif;">Click here to unsubscribe</a>
        </div>
      ${finalTemplate.slice(cursorPosition)}
    `;
  }

  return finalTemplate;
};

export const injectInformationToRichTextHtml = (
  template: string,
  previewText: string | null,
  senderName: string | null,
  businessAddress: string | null,
  hasUnsubscribeLink: boolean,
): string => {
  // Sanitize to prevent insertion (and execution) of HTML elements where they shouldn't exist
  const sanitizedPreviewText = sanitizeHtmlChild(previewText);
  const sanitizedSenderName = sanitizeHtmlChild(senderName);
  const sanitizedBusinessAddress = sanitizeHtmlChild(businessAddress);
  return `
    <span style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${sanitizedPreviewText}</span>
    ${template}
    <p style="text-align:center;">
      <span style="font-size: 12px; text-align: center; color: #9fa8b5; font-family: Helvetica, sans-serif;">${sanitizedSenderName}</span>
      <br>
      <span style="font-size: 12px; text-align: center; color: #9fa8b5; font-family: Helvetica, sans-serif;">${sanitizedBusinessAddress}</span>
      <br>
      <a clicktracking=off href="{{ar_unsubscribe_link}}" target="__blank" style="font-size: 12px; color: #9fa8b5; font-family: Helvetica, sans-serif;">Click here to unsubscribe</a>
    </p>
  `;
};

export const injectInformationToBeefreeHtml = (
  previewText: string | null,
  senderName: string | null,
  businessAddress: string | null,
  hasUnsubscribeLink: boolean,
): any => {
  return getPreviewAndFooterHtml(previewText, senderName, businessAddress, hasUnsubscribeLink)
};



export const getPreviewAndFooterHtml = (
  previewText: string | null,
  senderName: string | null,
  businessAddress: string | null,
  hasUnsubscribeLink: boolean,
): any => {
  try {
    let cursorPosition;

    // Sanitize to prevent insertion (and execution) of HTML elements where they shouldn't exist
    const sanitizedSenderName = sanitizeHtmlChild(senderName);
    const sanitizedBusinessAddress = sanitizeHtmlChild(businessAddress);
    let previewHtml = null;

    if (!!previewText) {
      const sanitizedPreviewText = sanitizeHtmlChild(previewText);
      previewHtml = `
        <span ar-preview-text class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${sanitizedPreviewText}</span>
      `
    }

    let footerHtml = `
      <p style="text-align:center; margin-top: 16px;">
        <div></div>
      </p>
    `

    // Inject Message Sender Information
    if (sanitizedSenderName || sanitizedBusinessAddress) {
      cursorPosition = footerHtml.lastIndexOf('<div');
      footerHtml = `
        ${footerHtml.slice(0, cursorPosition)}
          <div style="text-align:center;">
            <span style="font-size: 12px; text-align: center; color: #9fa8b5; font-family: Helvetica, sans-serif;">${sanitizedSenderName}</span>
          </div>
          <div style="text-align:center;">
            <span style="font-size: 12px; text-align: center; color: #9fa8b5; font-family: Helvetica, sans-serif;">${sanitizedBusinessAddress}</span>
          </div>
        ${footerHtml.slice(cursorPosition)}
      `;
    }

    // Inject opt out link
    if (hasUnsubscribeLink) {
      cursorPosition = footerHtml.lastIndexOf('<div');
      footerHtml = `
        ${footerHtml.slice(0, cursorPosition)}
          <div style="text-align:center;">
            <a clicktracking=off href="{{ar_unsubscribe_link}}" target="__blank" style="font-size: 12px; color: #9fa8b5; font-family: Helvetica, sans-serif;">Click here to unsubscribe</a>
          </div>
        ${footerHtml.slice(cursorPosition)}
      `;
    }

    return {
      footerHtml,
      previewHtml,
    };
  } catch (error) {
    console.error("Failed to getPreviewAndFooterHtml", error)
    return null;
  }
};

export const injectInformationToHtml = (type: 'unlayer' | 'rich-text' | 'beefree', html: string, previewText: string | null, senderName: string | null, businessAddress: string | null, hasUnsubscribeLink: boolean) => {
  if (type === 'unlayer') {
    return injectInformationToUnlayerHtml(html, previewText, senderName, businessAddress, hasUnsubscribeLink);
  } else if (type === 'beefree') {
    return injectInformationToBeefreeHtml(previewText, senderName, businessAddress, hasUnsubscribeLink);
  } else {
    return injectInformationToRichTextHtml(html, previewText, senderName, businessAddress, hasUnsubscribeLink);
  }
};

