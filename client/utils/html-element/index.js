import accounting from 'accounting';
import { audienceRepublicOptOutLinkRegex } from '@/utils/regex';

export const magicDownload = (text, fileName) => {
  const blob = new Blob([text], {
    type: 'text/csv;charset=utf8;',
  });

  // create hidden link
  const element = document.createElement('a');
  document.body.appendChild(element);
  element.setAttribute('href', window.URL.createObjectURL(blob));
  element.setAttribute('download', fileName);
  element.style.display = '';

  element.click();

  document.body.removeChild(element);
};

export function copyToClipboard(text) {
  var tempInputElem = document.createElement("input");
  tempInputElem.value = text;
  document.body.appendChild(tempInputElem);
  tempInputElem.select();
  document.execCommand("copy");
  document.body.removeChild(tempInputElem);
}

export const createBlob = ({ text, type }) => {
  return new Blob([text], {
    type: `${type};charset=utf8;`,
  });
};

export const createTextFile = ({ text, type, name }) => {
  // We can't make a blob out of an undefined text
  if (text === undefined) {
    return null
  }

  const blob = new Blob([text], {
    type: `${type};charset=utf8;`,
  });

  return blob2File(blob, name);
};

export const blob2File = (blob, name) => {
  if (!blob) {
    return null
  }

  return new File([blob], name, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

export const isClickOutside = (clickedElem, targetElem) => {
  let elem = clickedElem;
  while (elem !== targetElem && elem.parentNode) elem = elem.parentNode;
  return elem !== targetElem;
};

export const urlify = (text, { disableArOptOutLink }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    if (disableArOptOutLink && audienceRepublicOptOutLinkRegex.test(url)) {
      return `<a href="${url}" target="_blank" style="pointer-events: none;">${url}</a>`;
    }
    return `<a href="${url}" target="_blank">${url}</a>`;
  });
}

// Only sanitize the dangerous part
export const sanitizeHtmlChild = (text) => {
  if (!text) return text;
  return text.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
}

export const unSanitizeHtmlChild = (text) => {
  // Be careful of the order, "&" shall be the first one to be replaced
  return text.replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">");
}

// Escapping all html syntax
export const escapeHtmlSyntax = (text) => {
  return text.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/ /g, "&nbsp;");
}

export const unEscapeHtmlSyntax = (text) => {
  return text.replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&nbsp;/g, " ");
}



// A handy function for converting currency values from regular number to nicer strings
// eg 50000 to $50,000
// Can take input fields (input), or raw values (val)
// If an input field is provided, will also return an accurate position value for the input field's cursor
export function numberInputFormatter({input, currency = '$', precision = 0}) {
  let oldInputValue;
  let startPosition;

  // Get value of input from input
  oldInputValue = input.value || '';
  // Get cursor position in input
  startPosition = input.selectionStart || 0;

  // Clear all `$` and `,` characters from val
  let clearedInputValue = oldInputValue.toString().replace(/,/g, '').replace(currency || '', '');

  // set val to accounting.formatMoney(val, null, 0);
  const formattedInputValue = accounting.formatMoney(clearedInputValue, currency || null, precision);

  let newPosition = input ? startPosition : null;

  if (input && oldInputValue.length > formattedInputValue.length) {
    // If oldLength > newLength
    // Cursor position should be startPosition - 1
    newPosition = startPosition - 1;
  } else if (input && oldInputValue.length < formattedInputValue.length) {
    // Else if oldLength < newLength
    // New position should be startPosition + 1
    newPosition = startPosition + 1;
  }

  return {
    value: formattedInputValue,
    position: newPosition
  };

}
