var Slide1 = (function(){

	var chars;
	var two;
	var twoGroup;
	var box;
	var expanded;
	var timeline;


	function init(){
		two = Animation.getTwo();
		twoGroup = Animation.getTwoGroup();

		expanded = false;

		// animate in small text
		var chars1 = $('article.slide-1 .content-slide small').lettering().find('span').css({'visibility':'hidden'});
		var chars2 = $('article.slide-1 .content-slide h2').lettering().find('span').css({'visibility':'hidden'});
		
		chars = $.merge(chars1, chars2);

		// build out the box around the text
		buildBox();

		timeline = Utils.revealShape(box, 0.5);

		onEnter();
	}


	function buildBox(){
		var el = $('article.slide-1 h2');

		var w = el.innerWidth();
		var h = el.innerHeight();

		box = two.makeRectangle(0, 0, w, h);
		box.stroke = "#000000";
		box.linewidth = 1;
		box.fill = "#ffffff";
		box.id = "box";
		// add it to the main group
		//console.log(box);
		twoGroup.add(box);
	}

	function update(){
		// add anims

	}

	function onEnter(){

		Utils.bringInLetters(chars);
		box.visible = true;
		tweenBox($('article.slide-1 .content-slide h2'), 0.6);

		expanded = false;

	}

	function tweenBox(el, delay){

		delay = delay || 0;

		var vertices = box.vertices;

		var w = el.innerWidth();
		var h = el.innerHeight();

		el.parents('.content').height(h);

		var oldWidth = vertices[1].x - vertices[0].x;
		var oldHeight = vertices[2].y - vertices[1].y;
		var newWidth = (w - oldWidth)/2;
		var newHeight = (h - oldHeight)/2;


		for(var i=0;i<4;i++){
			TweenLite.to(vertices[i], 0.25, {x: (i ===0 ) || (i ===3 )   ? "-="+newWidth: "+="+newWidth,  y: (i ===0 ) || (i ===1 )   ? "-="+newHeight: "+="+newHeight, ease:Bounce.easeInOut, delay:delay + i*0.08});
		}

	}

	function onLeave(){

		if(expanded) {return;}
		timeline.progress(1).pause();
		tweenBox($('article.slide-2 .content-slide h2'));
		expanded = true;

	}

	return {
		init:init,
		update:update,
		onEnter:onEnter,
		onLeave:onLeave
	};

}());

var Slide2 = (function(){

	var chars;
	var two;
	var twoGroup;

	var brandAndProduct;
	var sparkGroup;

	var particleAmount;

	var particles;

	function init(){

		chars = $('article.slide-2 .content-slide h2').lettering().find('span');

		two = Animation.getTwo();
		twoGroup = Animation.getTwoGroup();
		sparkGroup = two.makeGroup();
		
		twoGroup.add(sparkGroup);

		two.update();
		var el = sparkGroup._renderer.elem;
		el.parentNode.insertBefore(el,el.parentNode.firstChild);

		particleAmount = Utils.getParticleAmount();


	}

	function update(){
		sparkGroup.rotation += 0.005;
	}


	function addParticles(){
		particles = [];

		while(particles.length < particleAmount){

			var i = particles.length - 1;
			var ang = (Math.PI * 2) /particleAmount * i;

			var shape;

			if(Math.floor(Utils.random(6))%2 === 0){
				shape = two.makeCircle(0,0,  Utils.random(1, 4));
				shape.fill = "#000000";
				//shape.noStroke();
			}else{
				var w = Utils.random(400, 450);
				shape = two.makeLine( 0, 0, w, 0);
				shape.linewidth = Utils.random(0.25, 1);
				shape.stroke = "#000000";
			}

			var radius = Utils.random(400, 600);

			shape.targetX = Math.cos(ang)*radius;
			shape.targetY = Math.sin(ang)*radius;
			shape.bezier = [{scale:0},{scale:1},{scale:0}];

			shape.index = i;
			shape.speed = Utils.random(2, 4);
			shape.rotation = Math.abs(ang);
			shape.visible = false;

			Utils.resetParticle(shape,Utils.random(particleAmount) * 0.001);
			sparkGroup.add(shape);
			particles.push(shape);
		}
			
	}




	function onEnter(){
			
		var box = twoGroup.children.box;
		box.visible = true;
		Utils.bringInLetters(chars);
		addParticles();
	}

	function onLeave(){
		// remove slide specific anims
		for(var i = 0;i < particles.length; i++){
			var particle = particles[i];
			TweenLite.killTweensOf(particle);
			Utils.removeTwoObject(particle);
		}
		particles = [];
	}

	return {
		init:init,
		update:update,
		onEnter:onEnter,
		onLeave:onLeave
	};

}());
