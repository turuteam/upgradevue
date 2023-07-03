import {
  sanitizeHtmlChild,
  unSanitizeHtmlChild,
  escapeHtmlSyntax,
  unEscapeHtmlSyntax,
  urlify,
} from './index.js';

describe('html-element', () => {
  describe('sanitizeHtmlChild', () => {
    it('Sanitize &, <, >', () => {
      expect(sanitizeHtmlChild('This is my <a>house</a> &')).toBe('This is my &lt;a&gt;house&lt;/a&gt; &amp;');
    });
  });
  describe('unSanitizeHtmlChild', () => {
    it('Unsanitize &lt;, &gt;, &amp;', () => {
      expect(unSanitizeHtmlChild('This is my &lt;a&gt;house&lt;/a&gt; &amp;')).toBe('This is my <a>house</a> &');
    });
  });
  describe('escapeHtmlSyntax', () => {
    it('Escape &, <, >, space', () => {
      expect(escapeHtmlSyntax('This is my <a>house</a> &')).toBe('This&nbsp;is&nbsp;my&nbsp;&lt;a&gt;house&lt;/a&gt;&nbsp;&amp;');
    });
  });
  describe('unEscapeHtmlSyntax', () => {
    it('Unescape &lt;, &gt;, &amp; &nbsp;', () => {
      expect(unEscapeHtmlSyntax('This&nbsp;is&nbsp;my&nbsp;&lt;a&gt;house&lt;/a&gt;&nbsp;&amp;')).toBe('This is my <a>house</a> &');
    });
  });
  describe('urlify', () => {
    it('Should transform url into html anchor', () => {
      expect(urlify('Welcome to https://www.google.com', {})).toBe('Welcome to <a href="https://www.google.com" target="_blank">https://www.google.com</a>');
    });
    it('Should detect AR link and make it unclickable if you have "disableArOptOutLink" as "true"', () => {
      expect(urlify('Welcome to https://xxx-manage.arep.co/xxx', { disableArOptOutLink: true })).toBe('Welcome to <a href="https://xxx-manage.arep.co/xxx" target="_blank" style="pointer-events: none;">https://xxx-manage.arep.co/xxx</a>');
      expect(urlify('Welcome to https://m.arep.co/xxx', { disableArOptOutLink: true })).toBe('Welcome to <a href="https://m.arep.co/xxx" target="_blank" style="pointer-events: none;">https://m.arep.co/xxx</a>');
    });
  });
});