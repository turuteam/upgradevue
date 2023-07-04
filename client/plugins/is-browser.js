import { defineNuxtPlugin } from "nuxt/app";

let isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
let isFirefox = typeof InstallTrigger !== 'undefined'
let isSafari = /letructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification))
let isIE = /*@cc_on!@*/false || !!document.documentMode
let isEdge = !isIE && !!window.StyleMedia
let isChrome = !!window.chrome
let isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1)
let isBlink = (isChrome || isOpera) && !!window.CSS

const browsers = {
  isOpera,
  isFirefox,
  isSafari,
  isIE,
  isEdge,
  isChrome,
  isEdgeChromium,
  isBlink,
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      browser: browsers
    }
  }
})