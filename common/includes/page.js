//
// LOGO
//

// mock
//window.doc_info = { auth_type: 2, price: 10 /*wechat_spell: "test", wechat: "ydbj2015"*/ }
//block wx black background
document.body.addEventListener("touchmove", function (e) {
    e.preventDefault();
}, false);

document.body.className += " " + ["hide-bgm-btn", "hide-page-number"].filter(function(k){
    return doc_info[k.split("-").join("_")];
}).join(" ")

if (window.doc_info.price) {
    var price = parseFloat((parseFloat(window.doc_info.price) || 0).toString().replace(/\.?0*$/, ''));
    if (price){
        window.doc_info.auth_type = 3;   
        document.getElementById("purchase-price").innerHTML = window.doc_info.price;
    }
}


window.isProtected = window.doc_info.auth_type > 0


window.isLazyProtected = window.doc_info.previewCount;

if (window.isLazyProtected) {
    window.isProtected = false;
}
if (window.doc_info.templates_name){
    window.isProtected = false;
    window.isLazyProtected = false;
}

var hint, wechat_spell, wechat_id;
if ( window.doc_info.auth_type == 1 && window.doc_info.auth_hint){
    hint =  "提示：" +  window.doc_info.auth_hint;
}
if (window.doc_info.auth_type == 2){
    hint = "长按扫描二维码\n回复\"" + window.doc_info.wechat_spell + "\"获取访问密码";
    wechat_spell = window.doc_info.wechat_spell;
    wechat_id = window.doc_info.wechat
    document.getElementById("loading").className += " extra-large"
}
if (window.doc_info.auth_type == 3){
    document.getElementById("protect-hint").className += " need-pay"
}

if (hint){
    document.getElementById("hint-container").style.display = "block";
    document.getElementById("hint-content").innerHTML = hint;
}
if (wechat_spell){
    var img = document.getElementById("wechat-qrcode");
    var qrcode = "//open.weixin.qq.com/qr/code/?username=" + wechat_id;
    if (/^http/.test(wechat_id)) {
        qrcode = wechat_id; 
    }
    img.src = qrcode
    img.style.display = "inline-block";
}
var main = document.getElementById("main");
if (window.isProtected){
    main.className += " protected";
}
var resize = function(){
    var main = document.getElementById("main")
    main.className = main.className.replace(/\s*protected\s*/g, ' ') + " sized";
    if (mainTrans.length > 0) {
        main.style.webkitTransform = main.style.transform = mainTrans.join(" ");
    } 
    if (window.isDesktop) {
        main.style.webkitTransform = main.style.transform="none"
        main.style.margin = "0 auto"
    }
    if (window.autoFill) {
        main.className += main.className + " auto-fill" + " fill-" + autoFill
    }
}

if (!window.templatePartials.length){
    resize();
} else {
    switch (true){
        case parseInt(doc_info.previewCount) > 0:
        window.templatePartials = ["preview.html"];
        break;
        case !!doc_info.templates_name:
        window.templatePartials = [doc_info.templates_name];
        window.doc_info.templates_name = "templates"
        break;
        default:
        window.templatePartials = ["templates/template.html"];
        break;
    }
}

if (stretch == "fullscreen" && !"ActiveXObject" in window) {
    var panel = document.getElementById("user-panel");
    if (panel) {
        panel.className += ' fullscreen';
        panel.style.webkitTransform = 'scale(' + scaleR + ') translate3d(0,0,0)'
    }
}
window.addEventListener("orientationchange", function () {
    //location.reload();
    var t = screenWidth;
    screenWidth = screenHeight;
    screenHeight = t;
    main.style.webkitTransform = main.style.transform = calculate().join(" ");
    

    setTimeout(function () {
        screenWidth = document.documentElement.clientWidth;
        screenHeight = document.documentElement.clientHeight;
        main.style.webkitTransform = main.style.transform = calculate(true).join(" ");
        if (window.autoFill) {
            main.className += main.className + " auto-fill" + " fill-" + autoFill
        }
        var page = Number(window.Reveal && Reveal.getCurrentSlide() && Reveal.getCurrentSlide().id.replace("slide-", "")) || 0;
        if (!window.isProtected && page==0 && ((screenHeight / screenWidth - 1) * (stageHeight / stageWidth - 1) > 0) && !initialPageCorrect){
            window.location.reload();
            return;
        }

        Reveal.configure({rotate: !Reveal.getConfig().rotate});
        window.frame && window.frame.refreshSlide();

    }, 1000);
})


function templateLoad(dom){
    if ($(dom).children("div.reveal-template").length <= 0){
        var script = $(dom).find("script[type='template']");
        if (!script.attr("url")){
            $(dom).append($("<div class=\"reveal-template\"></div>").html(script.html()));
        }
        else {
            $.get(script.attr("url"), function(rs){
                $(dom).append($("<div class=\"reveal-template\"></div>").html(rs));
            }, 'html');
        }
    }
}

function templateUnload(dom){
    $(dom).children("div.reveal-template").trigger('destroy').remove();
}
function initSlide(i) {
    //window.slides[i].init()
    $(document.body).trigger("initSlide", [i])
}

function playSlide(i) {
    function doPlay(){
        var ret = window.slides[i].restart()
        window.currentSlide = window.slides[i]
        $(document.body).trigger("playSlide", [i])
        return ret;
    }
    var initPromise = $(document.body).triggerHandler("beforePlay");
    if (initPromise && initPromise.done){
        return initPromise.done(function(){
            return doPlay()
        })
        } else {
            return doPlay()
        }
    }

    function stopSlide(i) {
        window.slides[i].stop()
    }
    function moveToSlide(id, prev){
        var slide = $("#slide-" + id);
        templateLoad(slide)
        prev = prev === undefined ? -1 : prev;
        $.when(playSlide(id)).done(function(){
            $('.reveal-slide > .reveal-template').not(slide.find('.reveal-template')[0]).trigger('destroy').remove()
            if (id > prev){
                templateLoad($("#slide-" + (id + 1)));
            } else {
                templateLoad($("#slide-" + (id - 1)));
            }
        })
    }
    function rememberPage(i){
    LocalDB.set(CACHE_PAGE, i, { expires: new Date(new Date().getTime()+ 1000 * 60 * 5) })
}
function getIndex(){
    return Reveal.getIndices().h
}
function enableSwipeOnDesktop(){
    var originPosition = {};
    var offsetX, offsetY;

    var mousemove = function(offsetX, offsetY){
        if (frame.touch == false || !frame.canClickAdvance()) return;
        var THRESHOLD = 50;
        var offset = 0;
        var direction;

        if (Math.abs(offsetX) > Math.abs(offsetY)){
            if (window.transitionDirection == "vertical") return;
            offset = Math.abs(offsetX);
            direction = offset / offsetX;
        } else {
            if (window.transitionDirection == "horizontal") return;
            offset = Math.abs(offsetY);
            direction = offset / offsetY;
        }

        if (offset < THRESHOLD) return;

        if (direction == 1){
            window.frame.prevSlide();
        } else {
            window.frame.nextSlide();
        }

    }

    document.body.addEventListener('mousedown', function(event){
        
        originPosition.x = event.clientX;
        originPosition.y = event.clientY;
    }, false);

    document.body.addEventListener('mouseup', function(event){
        offsetX = event.clientX - originPosition.x;
        offsetY = event.clientY - originPosition.y;

        mousemove(offsetX, offsetY);
    }, false);
    document.body.addEventListener('dragstart',function(e){
        e.preventDefault();
        e.stopPropagation();
    });

}
function initFrame(){
    window.frame = {
        autoPlay: autoPlay,
        touch: true,
        paused: false,
        open: function(){
            if (!window.isDesktop){
                if (window.history && window.history.replaceState) {
                    window.history.replaceState('record', document.title, "?back_remember=" + getIndex());
                } else {
                    rememberPage(getIndex());
                }
            }
            return window.open.apply(window, arguments);
        },
        disableTouch: function(){
            frame.touch = false;
            Reveal.configure({touch: false});
            $(document.body).on('slideComplete.dd', function(){
                return false;
            })
        },
        enableTouch: function(){
            frame.touch = true;
            Reveal.configure({touch: true});
            $(document.body).off('slideComplete.dd');
        },
        enableClickAdvance: function () {
            Reveal.configure({touch: true});
        },
        disableClickAdvance: function () {
            Reveal.configure({touch: false});
        },
        canClickAdvance: function(){
            return Reveal.getConfig().touch
        },
        jumpSlide: function (i, time) {
            if (i < 0) return false;
            if (i >= window.slides.length){
                $(document.body).trigger("finale");
                return false
            }
            if (window.slides[i].transition && (window.slides[i].transition.effect == undefined || window.slides[i].transition.effect == "none" || time === 0)){
                $(Reveal.getCurrentSlide()).attr('data-transition', 'none-out');
                $('#slide-' + i).attr('data-transition', 'none');
                window.slides[i].waitTransition = false
                } else {
                    $(Reveal.getCurrentSlide()).removeAttr('data-transition')
                    $("#slide-" + i).removeAttr('data-transition')
                    if (window.slides[i].transition.duration) {
                        $(Reveal.getCurrentSlide()).css({"-webkit-transition-duration" : window.slides[i].transition.duration + "s" });
                        $("#slide-" + i).css({"-webkit-transition-duration" : window.slides[i].transition.duration + "s" });
                    }
                    window.slides[i].waitTransition = true
                }
                //mediaController.stopAll()
                Reveal.slide(i, 0);

                if (i >= Reveal.getTotalSlides()){
                    var event = document.createEvent( 'HTMLEvents', 1, 2 );
                    event.initEvent("hitend", true, true );
                    $("#pages")[0].dispatchEvent(event);
                    return false
                }
                return true
            },
            nextSlide: function(j){
                var i =  getIndex();
                if (j !== undefined && i !== j) return;
                return window.frame.jumpSlide(i + 1);
            },
            prevSlide: function(){
                var i =  getIndex();
                return window.frame.jumpSlide(i - 1);
            },
            refreshSlide: function(s){
                // TODO tingtang
                var slide = s || Reveal.getCurrentSlide();
                var id = Number(slide.id.replace("slide-", ""));
                $(document.body).trigger('refreshSlide', [id])
                if (window.slides[id].completed) return;
                templateUnload(slide);
                templateLoad(slide);
                playSlide(id);             
            },
            getIndex: function(){
                return getIndex();          
            },
            getTotalSlides: function(){
                return Reveal.getTotalSlides();
            },
            getCurrentSlide: function(){
                return window.currentSlide; 
            },
            getCurrentTimeline: function(){
                return window.currentSlide.window.main;                    
            },
            backward: function(){
                return frame.getCurrentSlide().backward() || (frame.prevSlide() && frame.getCurrentSlide().backward('end'));
            },
            forward: function(){
                return frame.getCurrentSlide().forward() || frame.nextSlide();
            },
            backward2: function(){
                switch(frame.getCurrentSlide().backward2()){
                    case true: return true;
                    case false: return frame.prevSlide() && frame.getCurrentSlide().backward2('end');
                    case undefined: return false;
                }
            },
            forward2: function(){
                switch(frame.getCurrentSlide().forward2()){
                    case true: return true;
                    case false: return frame.nextSlide();
                    case undefined: return false;
                }
            },
            snapshot: function(){
                var ret = {}
                ret[frame.getIndex()] = frame.getCurrentSlide().progress();
                return JSON.stringify(ret);
            },
            restore: function(s){
                var ss = JSON.parse(s), i = parseInt(Object.keys(ss)[0]), progress = ss[i];
                if (i == frame.getIndex()){
                    frame.getCurrentSlide().goto(progress);
                    return;
                }
                frame.jumpSlide(i)
                $(document.body).on("playTimeline.travel." + i, function(event, j){
                    $(document.body).off("playTimeline.travel." + j)
                    if (i!== j) {
                        console.error('travel error');
                        return;
                    }

                    var slide = window.slides[i];
                    $(document.body).one("timelineStart.travel", function(event, j){
                        slide.goto(progress);            
                    })
                    }) 
                },
                mockAction:function(action, index, id, stopped){
                    var oe = $.Event(action);
                    oe.stopped = stopped
                    var event = $.Event(action, { originalEvent: oe , mock : true })           
                    $("#slide-" + index + " #" + id).trigger(event);
                },
                trackAction: function(callback){
                    $(document.body).on("track", function(event){
                        callback && callback(event, event.action, event.slideIndex, event.targetId, event.stopped);        
                    })             
                },
                pause:function(){
                    frame.paused = true;
                    return frame.getCurrentSlide().pause();
                },
                resume: function(){
                    frame.paused = false;
                    return frame.getCurrentSlide().resume();
                }

            }
        }
        function initPage(){

            var effectMap = {
                "none": "slide",
                "slide": "slide",
                "cube": "slide",
                "slide-3d": "slide",
                "fade": "fade"
            }
            var config = pageConfig
            if (window.doc_info.templates_name && window.doc_info.templates_name != "templates"){
                utils.preloadProtect(undefined, { templates_name: window.doc_info.templates_name });
            }

            var transitionDirection = (config.direction == "h5" || stageWidth < stageHeight) ? "vertical" : "horizontal";
            var effect = "slide";
            if (config.transition) {
                transitionDirection = config.transition.direction || transitionDirection;
                effect = effectMap[config.transition.effect] || effect;
            }
            window.transitionDirection = transitionDirection;

            if (window.transitionDirection == "vertical") {
                $("#slides").addClass("vertical");
            }

            if (window.isDesktop){
                enableSwipeOnDesktop();
            }

            Reveal.addEventListener('ready', function (event) {
                window.slides.map(function (s, k) {
                    initSlide(k);
                })
            var id = parseInt((location.href.match(/\bback_remember=(\d+)/) || [])[1]) || parseInt(LocalDB.get(CACHE_PAGE)) || parseInt((location.href.match(/\bpage=(\d+)/) || [])[1]);
            if (id){
                window.frame.jumpSlide(id, 0);
            } else {
                window.slides[0].waitTransition = false;
                moveToSlide(0);
            }
            var event = document.createEvent( 'HTMLEvents', 1, 2 );
            event.initEvent("complete", true, true );
            document.body.dispatchEvent(event);
        })
        Reveal.addEventListener("hitend", function(event){
            if (window.isLazyProtected && Reveal.getTotalSlides() < window.slides.length && !window.protectShowed){
                utils.showProtect();
                rememberPage(getIndex());
                window.protectShowed = true;
                return;
            }        

            $(document.body).trigger("finale");
        })
        Reveal.addEventListener('slidechanged', function (event) {
            mediaController.stopAll();

            var id = Number(event.currentSlide.id.replace("slide-", ""));
            var prev = Number(event.previousSlide.id.replace("slide-", ""));
            stopSlide(prev);
            moveToSlide(id, prev);

            var event = new CustomEvent('slideChange', { detail : { 'index': id, prev: prev, total: window.slides.length }});
            document.body.dispatchEvent(event);
        })

        Reveal.initialize({
            controls: false,
            progress: false, //window.isDesktop,
            overview: false,
            center: false,
            width: '100%',
            height: '100%',
            margin: 0,
            transition: effect,
            rotate: !window.isDesktop && window.needRotate,
            vertical: window.transitionDirection == "vertical",
    })
}
window.wxConfig = window.wxConfig || {};
window.wxConfig.shareObj = {
    title: doc_info.tbc_share_title || doc_info.title,
    link: shareLink,
    imgUrl: doc_info.cover && (doc_info.cover + "!wxshare"),
    desc:  doc_info.description,
    success: function (event) {
        // 用户分享成功后的回调函数
        console.log(event);
        $("body").append("<script async src='" + BACKEND + "/api/tracks/share?type=" + /(\w+):ok/.exec(event.errMsg)[1] + "&now=" + new Date().getTime() + "'><\/script>")
    },
    fail: function(error) {
        console.error(error);
    }
};
var hasMultipleAudio = window.audioSprites && window.audioSprites.sources && window.audioSprites.sources.length > 2;
var invokeMedia = hasMultipleAudio && (INFO.invokeMedia >= 3) && (INFO.invokeMedia * 2 >= window.audioSprites.sources.length);
var usingWebAudio = hasMultipleAudio && !invokeMedia;
var autoPlayDetection =  window.audioSprites && window.audioSprites.sources && INFO.autoPlayMedia && !navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
var needInteraction = false;
var options = {
    css: loadAssets.css,
    js: loadAssets.js,
    audio: loadAssets.audio,
    html : loadAssets.html,
    font: loadAssets.font,
    debugger: !loadAssets.production,
    commonArgs: !loadAssets.production && !window.isDesktop && ("v=" + new Date().getTime()),
    wxRequired:  wxRequired || (/android/i.test(navigator.userAgent) && window.audioSprites && window.audioSprites.urls && window.audioSprites.urls.length > 0),
    wxConfig: window.wxConfig,
    usingWebAudio: usingWebAudio,
    autoPlayDetection: autoPlayDetection,
    onpause: function(template, callback){
        if (!window.isProtected){
            resize();
            callback(template);
            return;
        }
        $script.ready(['complete'], function(){
        utils.initProtect(template, { block : true }, function(url){
            resize();
            callback(url);
        });
    })

},

onprogress: function (src, arg) {
    var self = this;
    var p = self.count() / self.total();
    var scale = "scaleX(" + p + ")"
    var bar = document.getElementById("loading-progress");
    bar.style.transform = scale;
    bar.style.webkitTransform = scale;
    if (src == "auto play detection" && arg) {
        needInteraction = true;
    }
},
oncomplete: function () {
    function complete() {
        setTimeout(function(){
            ("ontouchstart" in window) && FastClick.attach(document.body);
            $("#pages").removeClass('hide')
            $("#loading").addClass("fade").bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                $("#loading").hide();
            });
            initFrame();
            initPage();

        })
    }
    var self = this;
    var options = self.audio();
    console.log("Finish loading assets. basic info below:");
    options.supportWebAudio = Pui.browser.supportWebAudio && !Pui.browser.android && usingWebAudio ;
    console.log("using web audio: ", options.supportWebAudio);

    options.load_required = false;
    options.onload = complete;

    if (options.urls && options.urls.length > 0){
        if (!Pui.browser.wechat && (Pui.browser.android || Pui.browser.ios || needInteraction)) {
            console.log("Require User interaction!");
            // $("#loading-entry").click = function(){     options.onload(); }
            $("#loading").one("click", function () {
                console.log("hit entry");
                window.mediaController = new MediaController(options);
            });

            $("#loading-bar").hide();
            $("#loading-entry").removeClass("hide");
        } else {
            window.waitAudioContext(function(){
                window.mediaController = new MediaController(options);
            })
        }
        } else {
            delete options.onload;
            window.mediaController = new MediaController(options);
            complete();
        }

        (function(){
            var playAudio = function(src){
                var a = $("#bgm")[0]
                a.src = src;
                a.loop = true;
                //$(document.body).append(a);
                a.play();
                if (doc_info.external_bgm_volume){
                    a.volume = doc_info.external_bgm_volume; 
                }
            }
            var toggleAudio  = function(){
                var a = $("#bgm")[0]
                if (a.paused) {
                    a.play();
                    return true;
                } else {
                    a.pause()
                    return false;
                }
            }
            var K = "WA_BGM_" + UID
            var playWebAudio = function(src){
            LocalDB.set(K, 1, { expires: new Date(new Date().getTime()+ 1000 * 60 * 1) })
            console.log("using webaudio for bgm")
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            var audioCtx = new AudioContext();
            var source = audioCtx.createBufferSource();
            var gainNode = audioCtx.createGain();
            gainNode.connect(audioCtx.destination);
            gainNode.gain.value = doc_info.external_bgm_volume || 1;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                audioCtx.decodeAudioData(
                    xhr.response,
                    function(buffer) {
                        source.buffer = buffer;   
                        source.loop = true
                        source.connect(gainNode);
                        source.start()
                    LocalDB.set(K, 0, { expires: new Date(new Date().getTime()+ 1000) })
                },
                function(err) {
                    playAudio(src);
                }
            );

        };
        xhr.send()
        toggleAudio = function() {
            if(audioCtx.state === 'running') {
                audioCtx.suspend()
                return false;
            } else if(audioCtx.state === 'suspended') {
                audioCtx.resume()  
                return true;
            }
        }      
    }
    var play = function(src){
        if (!LocalDB.get(K) && doc_info.external_bgm_volume < 1 && Pui.browser.ios && Pui.browser.supportWebAudio) {
            playWebAudio(src);
        } else {
            playAudio(src)
        }
    }
    if (window.doc_info.external_bgm){
        if (!doc_info.hide_bgm_btn) {
            $(".bgm-btn").removeClass("hide");
        }
        waitAudioContext(function(){
            play(window.doc_info.external_bgm)
            $(".bgm-btn").addClass("rotate");
        })
        $(document.body).on("click", ".bgm-btn", function(){
            $(this).toggleClass("rotate", toggleAudio())
        })
    }
    }())
}
            }

            if (loadAssets.debug) {
                var vconsole = document.createElement("script");
                vconsole.onload = function () {
                    var vConsole = new VConsole();
                    console.log('start to load assets.');
                    window.loader = new $loader(options);
                };
                vconsole.src = "//v5.ppj.io/common/vconsole.min.js?" + (new Date().getTime());
                document.head.appendChild(vconsole);
            } else {
                window.loader = new $loader(options);
            }


