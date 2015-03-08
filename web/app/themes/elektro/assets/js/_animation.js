var Animation = (function (){
	var snappish;
	var currentSlide;
	var slide;
	var slideTotal;
	var wWidth;
	var wHeight;
	var hasTouchEvents;
	var two;
	
	function init() {
		currentSlide = 0;
		slideTotal = 2;
		wWidth = $(window).width();
		wHeight = $(window).height();
		hasTouchEvents = typeof(window.ontouchstart) !== 'undefined';
		snappish = $('#slide-container').snappish();
		two = new Two({fullscreen:true, autostart: false, type: Two.Types.svg}).appendTo($('#two-container')[0]);
		twoGroup = two.makeGroup();
		two.add(twoGroup);
		lastSlideChange = new Date();
		addEvents();
		TweenLite.delayedCall(0.25, initSlides);
	}
	
	function initSlide(slideNumber){
		var slide = window['Slide'+slideNumber];
		if(typeof(slide.initiated) === 'undefined'){
			slide.init();
			slide.initiated = true;
		}
	}

	function initSlides(){
		$('#slide-container, #two-container').css({'visibility': 'visible'});
		window.scrollTo(0, 0);
		initSlide(1);
		//trackSlide(1);
	}
	
	function enterSlide(e, data) {
		slide = window['Slide'+(data.fromSlideNum + 1)];
		if(slide){
			//if(!hasTouchEvents){
			var lastSlideElement = 	$('article.slide-'+(data.fromSlideNum + 1));
			TweenLite.set([lastSlideElement,lastSlideElement.find('.content-slide')], {clearProps:'all'});
			lastSlideElement.css({'transform': "translate3d(0,100%,0)"}); 
			TweenLite.to(lastSlideElement.find('.content-slide'), 0.3, {autoAlpha:0, scale: 1.3, ease:Sine.easeOut});

			var nextSlideElement = 	$('article.slide-'+(data.toSlideNum + 1));
			TweenLite.set([nextSlideElement,nextSlideElement.find('.content-slide')], {clearProps:'all'});
			//}	
			slide.onLeave();
		} 

		slide = window['Slide'+(data.toSlideNum + 1)];

		if(slide) {
			if(typeof(slide.initiated) === 'undefined'){
				slide.init();
				slide.initiated = true;
			}
			slide.onEnter();
		}

		data.toSlide.addClass('active');
		$('body').attr("class", "services slide-"+(data.toSlideNum +1));
		lastSlideChange = new Date();
		hideScrollArrow();
		//trackSlide(data.toSlideNum+1);
	}	
	
	function leaveSlide(e, data){
		data.fromSlide.removeClass('active');
	}
	
	function update() {
		
		two.update();
		if(slide) {slide.update();}
		var now =  new Date();
		if(now - lastSlideChange >= 3000 && !$('.scroll-down-arrow').hasClass('visible')){
			// three seconds
			showScrollArrow();
		}
	}
	
	function resize(e){
		viewWidth = $(window).width();
		viewHeight = $(window).height();
		two.width = viewWidth;
		two.height = viewHeight;
		twoGroup.translation.set(viewWidth / 2, viewHeight / 2);

	}
	
	function showScrollArrow(){
		$('.scroll-down-arrow').addClass('visible');
		var scrollText = $('.scroll-down-arrow > span');
		console.log(scrollText.length);
		if( scrollText.length > 0 && scrollText.css('visibility') === 'hidden'){
			if(!hasTouchEvents) {scrollText.text(scrollText.text().replace("TAP","CLICK"));}
			TweenLite.set(scrollText, {autoAlpha:1});
			var chars = scrollText.lettering().find('span');
			Utils.bringInLetters(chars);
		}
	}

	function hideScrollArrow(){
		var scrollText = $('.scroll-down-arrow > span');
		scrollText.remove();
		$('.scroll-down-arrow').removeClass('visible');
	}

	function scrollArrowClick(e){
		snappish.trigger('scrolldown.snappish');
		e.preventDefault();
	}

	function scrollArrowOver(e){
		showScrollArrow();
		e.preventDefault();
	}

	function scrollArrowOut(e){
		$('.scroll-down-arrow').removeClass('visible');
		e.preventDefault();
	}
	
	function checkHash(e){	
		for(var i = 1; i <= slideTotal; i++){
			console.log(i);
			initSlide(i);
		}
		if (window.location.hash.indexOf('#slide-') > -1) {
			var index = parseInt( window.location.hash.split("#slide-").join(""), 10);
			snappish.trigger('scrollto.snappish', index - 1);
		}		
	}
	
	function orientationChange(e){
		console.log("orientationChange");
		window.scrollTo(0, 0);
	}
		
	function addEvents(){
		TweenLite.ticker.addEventListener("tick", update);
		$('.scroll-down-arrow').on('click touchstart', scrollArrowClick);
		if(!hasTouchEvents){
			$('.scroll-down-arrow').on('mouseenter', scrollArrowOver);
			$('.scroll-down-arrow').on('mouseleave', scrollArrowOut);
		} 
		
		snappish.on('scrollbegin.snappish', enterSlide);
		snappish.on('scrollend.snappish', leaveSlide);

		$(window).on("hashchange", checkHash).trigger("hashchange");
		$(window).on("resize", resize).trigger("resize");
		window.onorientationchange = orientationChange;
	}
		
	return {
		init:init,
		getTwo: function(){ return two; },
		getTwoGroup: function(){ return twoGroup; },
		getSnappish: function(){ return snappish; },
		getViewWidth: function(){ return viewWidth; },
		getViewHeight: function(){ return viewHeight; }
	};
}());