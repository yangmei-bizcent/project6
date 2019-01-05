;
(function(window) {
    if (window.WebViewJSBridge)
        return;
    window.WebViewJSBridge = {};

    console.log("--- kerkee init begin---");
    var browser = {
        versions: function() {
            var u = navigator.userAgent,
                app = navigator.appVersion;
            return {
                trident: u.indexOf('Trident') > -1, //IE
                presto: u.indexOf('Presto') > -1, //opera
                webKit: u.indexOf('AppleWebKit') > -1, //apple&google kernel
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //firfox
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //is Mobile
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //is ios
                android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android
                iPhone: u.indexOf('iPhone') > -1, //iPhone or QQHD
                iPad: u.indexOf('iPad') > -1, //iPad
                iPod: u.indexOf('iPod') > -1, //iPod
                webApp: u.indexOf('Safari') == -1, //is webapp,no header and footer
                weixin: u.indexOf('MicroMessenger') > -1, //is wechat
                qq: u.match(/\sQQ/i) == " qq", //is qq,
                wxwork: u.indexOf('wxwork') > -1 //is wechat
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }

    var global = this || window;
    var ApiBridge = {
        msgQueue: [],
        callbackCache: [],
        callbackId: 0,
        processingMsg: false,
        isReady: false,
        isNotifyReady: false
    };

    ApiBridge.create = function() {
        ApiBridge.bridgeIframe = document.createElement("iframe");
        ApiBridge.bridgeIframe.style.display = 'none';
        document.documentElement.appendChild(ApiBridge.bridgeIframe);
    };

    ApiBridge.prepareProcessingMessages = function() {
        ApiBridge.processingMsg = true;
    };

    ApiBridge.fetchMessages = function() {
        if (ApiBridge.msgQueue.length > 0) {
            var messages = JSON.stringify(ApiBridge.msgQueue);
            ApiBridge.msgQueue.length = 0;
            return messages;
        }
        ApiBridge.processingMsg = false;
        return null;
    };

    ApiBridge.callNative = function(clz, method, args, callback) {
        var msgJson = {};
        msgJson.clz = clz;
        msgJson.method = method;
        if (args != undefined)
            msgJson.args = args;

        if (callback) {
            var callbackId = ApiBridge.getCallbackId();
            ApiBridge.callbackCache[callbackId] = callback;
            if (msgJson.args) {
                msgJson.args.callbackId = callbackId.toString();
            } else {
                msgJson.args = {
                    "callbackId": callbackId.toString()
                };
            }
        }

        if (browser.versions.wxwork || browser.versions.weixin) {
            return;
        }
        if (browser.versions.ios) {
            if (ApiBridge.bridgeIframe == undefined) {
                ApiBridge.create();
            }
            // var msgJson = {"clz": clz, "method": method, "args": args};
            ApiBridge.msgQueue.push(msgJson);
            if (!ApiBridge.processingMsg)
                ApiBridge.bridgeIframe.src = "kcnative://go";
        } else if (browser.versions.android) {
            // android
            // return prompt(JSON.stringify(msgJson));
        }

    };
    ApiBridge.showVersion = function() {
        return browser.versions;
    }



    ApiBridge.log = function(msg) {
        ApiBridge.callNative("ApiBridge", "JSLog", {
            "msg": msg
        });
    }

    ApiBridge.getCallbackId = function() {
        return ApiBridge.callbackId++;
    }

    ApiBridge.onCallback = function(callbackId, obj) {
        if (ApiBridge.callbackCache[callbackId]) {
            ApiBridge.callbackCache[callbackId](obj);
        }
    }

    ApiBridge.onBridgeInitComplete = function(callback) {
        ApiBridge.callNative("ApiBridge", "onBridgeInitComplete", {}, callback);
    }

    ApiBridge.onNativeInitComplete = function(callback) {
        ApiBridge.isReady = true;

        if (callback) {
            callback();
            ApiBridge.isNotifyReady = true;
        }
    }

    ApiBridge.compile = function(aIdentity, aJS) {
        var value;
        var error;
        try {
            value = eval(aJS);
        } catch (e) {
            var err = {};
            err.name = e.name;
            err.message = e.message;
            err.number = e.number & 0xFFFF;
            error = err;
        }

        ApiBridge.callNative("ApiBridge", "compile", {
            "identity": aIdentity,
            "returnValue": value,
            "error": error
        });
    }

    var _Configs = {
        isOpenJSLog: false,
        isOpenNativeXHR: false
    };


    var kerkee = {};

    /*****************************************
     * 事件监听
     *****************************************/
    kerkee.Event = {};
    // kerkee.Event.LOADED = "loaded";
    // kerkee.Event.LOAD_ERROR = "load_error";
    // kerkee.Event.LOAD_PROGRESS = "load_progress";
    kerkee.addEventListener = function(event, callback) {
        ApiBridge.callNative("event", "addEventListener", {
            "event": event
        }, callback);
    }

    /* Scroll to the bottom of the page when the callback function and the threshold setting */
    //callback:Return to the page in webview upper vertex Y value
    kerkee.registerHitPageBottomListener = function(callback, threshold) {
        ApiBridge.callNative("ApiBridge", "setHitPageBottomThreshold", {
            "threshold": threshold
        });
        kerkee.onHitPageBottom = callback;
    };

    kerkee.registerScrollListener = function(callback) {
        ApiBridge.callNative("ApiBridge", "setPageScroll", {
            "isScrollOn": true
        });
        kerkee.onPageScroll = callback;
    };

    kerkee.notifyF = function(aString) {
        ApiBridge.callNative("KCApiTSLModule", "notifyF", aString);
    };
    global.KCApiTSLModule = kerkee;
    /*****************************************
     * 接口
     *****************************************/
    kerkee.testJSBrige = function(aString) {
        ApiBridge.callNative("jsBridgeClient", "testJSBrige", {
            "info": aString
        });
    };

    kerkee.openJSLog = function() {
        _Configs.isOpenJSLog = true;
    }
    kerkee.closeJSLog = function() {
        _Configs.isOpenJSLog = false;
    }


    kerkee.commonApi = function(aString, callback) {
        ApiBridge.callNative("jsBridgeClient", "commonApi", {
            "info": aString
        }, callback);
    }

    kerkee.onDeviceReady = function(handler) {
        ApiBridge.onDeviceReady = handler;

        if (ApiBridge.isReady && !ApiBridge.isNotifyReady && handler) {
            handler();
            ApiBridge.isNotifyReady = true;
        }
    };

    kerkee.invoke = function(clz, method, args, callback) {
        if (callback) {
            ApiBridge.callNative(clz, method, args, callback);
        } else {
            ApiBridge.callNative(clz, method, args);
        }
    };

    kerkee.onSetImage = function(srcSuffix, desUri) {
        var obj = document.querySelectorAll('img[src$="' + srcSuffix + '"]');
        for (var i = 0; i < obj.length; ++i) {
            obj[i].src = desUri;
        }
    };

    /*
     * var windowOpen = function (url) { ApiBridge.callNative("JavascriptAPIInterceptor", "windowOpen", { "url" : url }); };
     */
    global.ApiBridge = ApiBridge;
    global.kerkee = kerkee;
    global.jsBridgeClient = kerkee;


    kerkee.register = function(_window) {
        _window.ApiBridge = window.ApiBridge;
        _window.kerkee = window.kerkee;
        _window.console.log = window.console.log;
        _window.open = window.open;
    };


    ApiBridge.onBridgeInitComplete(function(aConfigs) {
        if (aConfigs) {
            if (aConfigs.hasOwnProperty('isOpenJSLog')) {
                _Configs.isOpenJSLog = aConfigs.isOpenJSLog;
            }
            if (aConfigs.hasOwnProperty('isOpenNativeXHR')) {
                _Configs.isOpenNativeXHR = aConfigs.isOpenNativeXHR;
            }
        }

        if (_Configs.isOpenJSLog) {
            //global.console.log = ApiBridge.log;
        }

        ApiBridge.onNativeInitComplete(ApiBridge.onDeviceReady);

    });

})(window);