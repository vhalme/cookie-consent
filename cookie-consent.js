import Cookies from './js-cookie.js'

var CONSENT_COOKIE_NAME = 'consent-cookie'
var EXPIRATION_IN_DAYS = 365

/** 
 * Defines behavior triggered by consent such as library initializations or proprietory cookie setup.
 * Default values can be overridden and new ones added by the setConsentHandler function.
 * */ 
export var ConsentHandler = {
    'basic': function() {
        console.log("SET BASIC COOKIES")
    }
}

function insertScript(src) {
    var head = document.getElementsByTagName('head')[0]
    var js = document.createElement('script')
    js.id = 'custobar-script'
    js.type = 'text/javascript'
    js.async = true
    js.src = src
    head.appendChild(js);
    return js
}

function getValueByPath(source, path) {
    var pathElems = path.split('.')
    var value = source
    for (var i = 0; i < pathElems.length; i++) {
        value = value[pathElems[i]]
        if (value == undefined) return undefined
    }
    return value
}

/** 
 * Determines consent settings from user input and generates a structured consent settings object from them.
 * */
 function extractCookieValues() {
    var cookieMarketing = document.getElementById('cookie_marketing')
    var cookieAnalytics = document.getElementById('cookie_analytics')
    return {
        marketing: {
            custobar: cookieMarketing.checked ? '1' : '0'
        },
        analytics: {
            google: cookieAnalytics.checked ? '1' : '0',
            facebook: cookieAnalytics.checked ? '1' : '0'
        },
        basic: '1'
    }
}

function enableAllCookies() {
    return {
        marketing: {
            custobar: '1'
        },
        analytics: {
            google: '1',
            facebook: '1'
        },
        basic: '1'
    }
}

/** 
 * Encodes a structured consent settings object to a Base64 string and sets it to the site cookie
 * */
function setConsentCookie(consentSettings) {
    var cookieBase64 = btoa(JSON.stringify(consentSettings))
    Cookies.set(CONSENT_COOKIE_NAME, cookieBase64, { expires: EXPIRATION_IN_DAYS })
}

/** 
 * Determines consent settings and calls handlers for those consent settings that are allowed.
 * */
 export function useAllowedCookies(handlerKey) {

    var consentCookie = getCurrentCookie()
    if (!consentCookie) {
        console.log("Consent cookie unavailable")
    }

    Object.keys(ConsentHandler).forEach(function (key) {
        var cookieConsent = getValueByPath(consentCookie, key)
        if (cookieConsent === '1') {
            var handlers = ConsentHandler[key]
            if (handlers) {
                if (!handlerKey && handlers instanceof Function) {
                    handlers()
                } else if (handlerKey) {
                    var handler = handlers[handlerKey]
                    if (handler && handler instanceof Function) {
                        handler()
                    }
                }
            }
        }
    })
}

/** 
 * Applies existing consent settings from the cookie to the user input in the UI.
 * */
export function initUserSelections() {
    var consentCookie = getCurrentCookie()
    if (getValueByPath(consentCookie, 'marketing.custobar') == '1') {
        var cookieMarketing = document.getElementById('cookie_marketing')
        cookieMarketing.checked = true
    }
    if (getValueByPath(consentCookie, 'analytics.google') == '1') {
        var cookieAnalytics = document.getElementById('cookie_analytics')
        cookieAnalytics.checked = true
    }
}

/** 
 * Defines handlers for allowed consent settings. These typically include library initialization function calls (such as GA)
 * */
export function setConsentHandler(customConsentHandler) {
    Object.keys(customConsentHandler).forEach(function (key) {
        ConsentHandler[key] = customConsentHandler[key]
    })
}

export function getCookie(name) {
    return Cookies.get(name)
}

export function getCurrentCookie() {
    var cookieBase64 = getCookie(CONSENT_COOKIE_NAME)
    if (!cookieBase64) return undefined
    try {
        var cookieAscii = atob(cookieBase64)
        return JSON.parse(cookieAscii)
    } catch (err) {
        console.err(err)
        return undefined
    }
}

export function consentToSelectedCookies() {
    var userCookieSelections = extractCookieValues()
    setConsentCookie(userCookieSelections)
    useAllowedCookies('load')
}

export function consentToAllCookies() {
    var allCookiesEnabled = enableAllCookies()
    setConsentCookie(allCookiesEnabled)
    useAllowedCookies('load')
}

export function reset() {
    Cookies.remove(CONSENT_COOKIE_NAME)
}

export function showCookieMenu() {
    var cookieMenu = document.getElementById("cookie_menu")
    initUserSelections()
    cookieMenu.style.display = "block"
}

export function hideCookieMenu() {
    var cookieMenu = document.getElementById("cookie_menu")
    cookieMenu.style.display = "none"
}

export function onPageLoad() {
    var currentCookies = getCurrentCookie()
    if (currentCookies) {
        useAllowedCookies('load')
    } else {
        /* Call the code to open cookie consent dialog here */
        // showCookieMenu()
    }
}

export function loadGTMScript(gtmId) {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',gtmId);
}

export function loadFBScript(fbId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    console.log('fbq init...')
    fbq('init', fbId)
    console.log('fbq track...')
    fbq('track', 'PageView')
    console.log('fbq initailization complete')
}

function initCustobar(companyToken) {
    var custobarInstance = custobar({
        company_token: companyToken,
        banners: {}
    });
    window.custobarInstance = custobarInstance
    console.log('Starting custobar...')
    custobarInstance.start();
    console.log('Custobar started.')
    return custobarInstance
}

export function trackCustobarProduct(productId, companyToken) {
    if (window.custobarInstance) {
        custobarInstance.track_browse_product(productId)
        console.log('Tracking custobar product ' + productId)
    } else {
        console.log('Custobar not initialized. Initializing it first.')
        loadCustobarScript(companyToken, function(custobarInstance) {
            custobarInstance.track_browse_product(productId)
            console.log('Tracking custobar product ' + productId)
        })
    }
    
}

export function loadCustobarScript(companyToken, done) {
    
    if (window.custobarInstance && done && done instanceof Function) {
        done(window.custobarInstance)
        return
    }

    var scriptSrc = 'https://custobar.com/js/custobar.js'
    var scriptElem = insertScript(scriptSrc)
    scriptElem.addEventListener('load', () => {
        console.log('Custobar script src loaded')
        var custobarInstance = initCustobar(companyToken)
        if (done && done instanceof Function) {
            done(custobarInstance)
        }
    });

}

export function loadScript(id) {
    var scriptElem = document.getElementById(id)
    if (scriptElem) {
        eval(scriptElem.innerHTML.trim() + '()')
    }
}

export default {
    initUserSelections: initUserSelections,
    setConsentHandler: setConsentHandler,
    getCookie: getCookie,
    useAllowedCookies: useAllowedCookies,
    consentToSelectedCookies: consentToSelectedCookies,
    consentToAllCookies: consentToAllCookies,
    getCurrentCookie: getCurrentCookie,
    loadGTMScript: loadGTMScript,
    loadFBScript: loadFBScript,
    loadCustobarScript: loadCustobarScript,
    trackCustobarProduct: trackCustobarProduct,
    reset: reset,
    showCookieMenu: showCookieMenu,
    loadScript: loadScript,
    onPageLoad: onPageLoad
}