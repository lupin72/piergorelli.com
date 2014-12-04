/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can 
 * always reference jQuery with $, even when in .noConflict() mode.
 *
 * Google CDN, Latest jQuery
 * To use the default WordPress version of jQuery, go to lib/config.php and
 * remove or comment out: add_theme_support('jquery-cdn');
 * ======================================================================== */

(function($) {

// Use this variable to set up the common and page specific functions. If you 
// rename this variable, you will also need to rename the namespace below.
<<<<<<< HEAD
	var init_ie_home = false;
	var immersive = false;
	var ie;
=======
>>>>>>> 8415e162375a9419f3da3e0e9036f9fbf9a18b5f
var Roots = {
  // All pages
  common: {
    init: function() {
      // JavaScript to be fired on all pages
    }
  },
  // Home page
  home: {
<<<<<<< HEAD
	  isIe: function() {
	        var e, t = -1;
	        var n = window.navigator.userAgent;
	        var r = n.indexOf("MSIE ");
	        var i = n.indexOf("Trident/");
	        if (r > 0) {
	            t = parseInt(n.substring(r + 5, n.indexOf(".", r)), 10);
	        } else if (i > 0) {
	            var s = n.indexOf("rv:");
	            t = parseInt(n.substring(s + 3, n.indexOf(".", s)), 10);
	        }
	        return t > -1 ? t : e;
	    },
    init: function() {
      // JavaScript to be fired on the home page
	    ie = this.isIe();
	    if (ie !== undefined) {
	        if ($("#home").length > 0) {
	            $("body").addClass("ie");
	        }
	    }
		var e = 0;
        if ($(window).width() > 767 && $(window).height() > 600) {
            e = $(window).height() / 2 - 235;
        } else {
            e = 135;
        }
		
        $(".claim").css({
            display: "block",
            opacity: 0,
            "padding-top": e - 30
        });
		
        $(".claim").delay(400).animate({
            opacity: 1,
            "padding-top": e
        }, 800, "easeOutQuad");
        $("header").delay(1600).fadeIn(600);
        this.presentFeatures();
		this.defineHome();
    },
	defineHome: function() {
	    var wWidth = $(window).width();
	    var wHeight = $(window).height();
		var wHalfHeight = wHeight / 2;
		var slides_loader_dispatched = true;
	    if (wWidth > 767) {
	        $("#cube").css({
	            height: $(window).height(),
	            width: $(window).width()
	        });
	        $(".claim").css({
	            "padding-top": wHalfHeight-235
	        });
			console.log(wHalfHeight-235);
	    } else {
	        $("#cube").css({
	            height: "auto",
	            width: "auto"
	        });
	        $(".claim").css({
	            "padding-top": 135
	        });
	    }
	    if (ie !== undefined) {
	        if (init_ie_home === false) {
	            $(".secondary").hide().css({
	                "z-index": 3
	            });
	            init_ie_home = true;
	        }
	    } else {
	        $("#container").css({
	            transform: "translateZ(-" + wHalfHeight + "px)"
	        });
	        $(".primary").css({
	            transform: "translateZ(" + wHalfHeight + "px)"
	        });
	        $(".secondary").css({
	            transform: "rotateX(-90deg) translateZ(" + wHalfHeight + "px)"
	        });
	    }
	    if (wWidth > 767) {
	        if (!slides_loader_dispatched) {
	            slides_loader_dispatched = true;
	            this.initSlides();
	            $.ajax({
	                url: "http://humaan.com/wp-content/themes/epic/slides.php"
	            }).done(function(e) {
	                $(".face.secondary").html(e.slides_and_pagers);
	                this.initSlides();
	                var t = e.preload_assets;
	                pre = new Preloader({
	                    assets: t,
	                    cb: function() {
	                        slides_ready = true;
	                        if (afterload_cb !== null) {
	                            afterload_cb();
	                        }
	                    }
	                });
	                pre.preload();
	            });
	        }
	    }
	},
	presentFeatures: function() {
	    setTimeout(function() {
	        $(".feature").each(function(e) {
	            var t = $(this);
	            setTimeout(function() {
	                t.addClass("show");
	            }, 150 * e);
	        });
	        if (ie <= 9) {
	            $(".portfolio").fadeIn(400);
	        }
	    }, 2e3);
	},
	initSlides: function() {
	    function n() {
	        setHomepage();
	        $(".slide.out").removeClass("out");
	        $(".slide.active .slideLogo").addClass("show");
	        $(".slide.active .asset").addClass("show");
	        $(".slide.active .slideContent").delay(500).slideDown(1e3, function() {
	            setTimeout(function() {
	                $(".slide.active h2").addClass("show");
	            }, 20);
	            setTimeout(function() {
	                $(".slide.active p").addClass("show");
	            }, 500);
	            setTimeout(function() {
	                $(".slide.active a").addClass("show");
	            }, 1e3);
	            setTimeout(function() {
	                $(".slide.active li").each(function(e) {
	                    var t = $(this);
	                    setTimeout(function() {
	                        t.addClass("show");
	                    }, 150 * e);
	                });
	                $(".slide.active .asset2").addClass("show");
	                $(".slide.active .asset").addClass("active");
	            }, 1500);
	            setTimeout(function() {
	                $(".page-controls").removeClass("hold");
	            }, 2200);
	        });
	    }

	    function r(e) {
	        $(".page-controls").addClass("hold");
			var t,head,logo;
	        if (e.hasClass("next-btn")) {
	            if ($(".pager li.active").next().length > 0) {
	                t = $(".pager li.active").next().index();
	            } else {
	                t = 0;
	            }
	        } else if (e.hasClass("prev-btn")) {
	            if ($(".pager li.active").prev().length > 0) {
	                 t = $(".pager li.active").prev().index();
	            } else {
	                t = 3;
	            }
	        } else {
	            t = e.index();
	        }
	        $(".slide.active").addClass("out").removeClass("active");
	        $(".secondary .slide:eq(" + t + ")").hide().addClass("active");
	        $(".pager li").removeClass("active");
	        $(".pager li:eq(" + t + ")").addClass("active");
	        if (e.hasClass("trigger")) {
	          	head = $("header").clone();
	            logo = $(".header-logo").clone().html("");
	        }
	        var s = /safari/i.test(navigator.userAgent.toLowerCase());
	        var o = /chrome/i.test(navigator.userAgent.toLowerCase());
	        if (o) {
	            s = false;
	        }
	        if ($(".slide.active").hasClass("light")) {
	            $("#viewport").addClass("light");
	            if (!e.hasClass("trigger")) {
	                secondary_logo.animateColor("#ffffff");
	            } else {
	                secondary_logo = new Logo(logo, "#ffffff", s);
	            }
	        } else {
	            $("#viewport").removeClass("light");
	            if (!e.hasClass("trigger")) {
	                secondary_logo.animateColor("#3a4046");
	            } else {
	                secondary_logo = new Logo(logo, "#3a4046", s);
	            }
	        }
	        if (e.hasClass("trigger")) {
	            head.find(".header-logo").replaceWith(i);
	            head.prependTo(".face.secondary");
	        }
	        if ($(".slide.out").length > 0) {
	            $(".slide.out h2, .slide.out p, .slide.out a, .slide.out .slideLogo,.slide.out li, .slide.out .asset, .slide.out .asset2").removeClass("show");
	            $(".slide.out .asset").removeClass("active");
	            $(".slide.out .slideContent").fadeOut(500);
	            setTimeout(function() {
	                $(".slide.active").fadeIn(800);
	            }, 1e3);
	            setTimeout(function() {
	                n();
	            }, 2e3);
	        } else {
	            $(".slide.active").show();
	        }
	        immersive = true;
	    }
	    var e = $(window).height() / 2;
	    var t = e * 2;
	    $(".pager li, .next-btn,.prev-btn").unbind("click").click(function() {
	        if (!$(".page-controls").hasClass("hold")) {
	            if (!$(this).hasClass("active")) {
	                r($(this));
	            }
	        }
	        return false;
	    });
	    $(".trigger").unbind("click").click(function() {
	        if ($(window).width() > 767 && $(window).height() > 600) {
	            if ($(".page-controls").hasClass("hold")) {
	                return false;
	            }
	            if (!slides_ready) {
	                var i = $(this);
	                afterload_cb = function() {
	                    i.trigger("click");
	                };
	                return false;
	            }
	            r($(this));
	            $(this).addClass("stick");
	            $("html, body").animate({
	                scrollTop: "0"
	            }, 200);
	            if (typeof ie !== "undefined") {
	                $(".feature").each(function(e) {
	                    var t = $(this);
	                    setTimeout(function() {
	                        t.removeClass("show");
	                    }, 10 * e);
	                });
	                $("#welcome").fadeOut(400);
	                setTimeout(function() {
	                    $(".secondary").fadeIn(800, function() {
	                        n();
	                        $(".page-controls").removeClass("ie-hold").addClass("show");
	                    });
	                }, 1e3);
	            } else {
	                $(".feature").each(function(e) {
	                    var t = $(this);
	                    setTimeout(function() {
	                        t.addClass("rotate");
	                    }, 10 * e);
	                });
	                setTimeout(function() {
	                    $("#container").css({
	                        "-webkit-transform": "translateZ(-" + t + "px)",
	                        "-ms-transform": "translateZ(-" + t + "px)",
	                        transform: "translateZ(-" + t + "px)"
	                    });
	                }, 400);
	                setTimeout(function() {
	                    $("#cube").addClass("rotate");
	                }, 900);
	                setTimeout(function() {
	                    $("#container").css({
	                        "-webkit-transform": "translateZ(-" + e + "px)",
	                        "-ms-transform": "translateZ(-" + e + "px)",
	                        transform: "translateZ(-" + e + "px)"
	                    });
	                }, 1500);
	                setTimeout(function() {
	                    n();
	                    $(".page-controls").addClass("show");
	                }, 2e3);
	            }
	            setTimeout(function() {
	                $("#work .trigger").hide();
	            }, 2e3);
	            return false;
	        }
	    });
	}
=======
    init: function() {
      // JavaScript to be fired on the home page
    }
>>>>>>> 8415e162375a9419f3da3e0e9036f9fbf9a18b5f
  },
  // About us page, note the change from about-us to about_us.
  about_us: {
    init: function() {
      // JavaScript to be fired on the about us page
    }
  }
};

// The routing fires all common scripts, followed by the page specific scripts.
// Add additional events for more control over timing e.g. a finalize event
var UTIL = {
  fire: function(func, funcname, args) {
    var namespace = Roots;
    funcname = (funcname === undefined) ? 'init' : funcname;
    if (func !== '' && namespace[func] && typeof namespace[func][funcname] === 'function') {
      namespace[func][funcname](args);
    }
  },
  loadEvents: function() {
    UTIL.fire('common');

    $.each(document.body.className.replace(/-/g, '_').split(/\s+/),function(i,classnm) {
      UTIL.fire(classnm);
    });
  }
};

$(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.
