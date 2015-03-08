/**
 * A Two renderer
 * Renders physics object with Two components
 * 
 */

Physics.renderer('two', function( proto ){

	if ( !document ){
		// must be in node environment
		return {};
	}
	
	var Pi2 = Math.PI * 2;

	var defaults = {

		offset: {x: 0, y: 0},
		// Provide some default colours
		styles: {
			'circle' : {
				stroke : '#ff0000',
				linewidth : 1,
				fill : '#666666'
			},
			'convex-polygon' : {
				stroke : '#ff0000',
				linewidth : 1,
				fill : '#666666'
			}
		}
	};

	// deep copy callback to extend deeper into options
	var deep = function( a, b ){

		if ( Physics.util.isPlainObject( b ) ){

			return Physics.util.extend({}, a, b, deep );
		}

		return b !== undefined ? b : a;
	};

	return {

		/**
		 * Initialization
		 * @param  {Object} options Config options passed by initializer
		 * @return {void}
		 */
		init: function( options ){

			if (typeof Two === 'undefined') {
				throw "Two obj not present - cannot continue ";
			}
				
			// call proto init
			proto.init.call(this, options);

			// further options
			this.options = Physics.util.extend({}, defaults, this.options, deep);
			this.options.offset = Physics.vector( this.options.offset );

			// Hook in TWO  here
			this.two = this.options.two;
			this.twoGroup = this.options.twoGroup;

		},
		

		drawBody: function( body ){
			if (body.view !== null){
				var view = body.view;
				var x = body.state.pos.get(0);
				var y = body.state.pos.get(1);
				var angle = body.state.angular.pos;
				view.translation.x = x;
				view.translation.y = y;
				view.rotation = angle;
			}
		},
	
		createCircle: function(x, y, r, style){
			var circle  =  this.two.makeCircle(x, y, r);
			circle.stroke = style.stroke;
			circle.linewidth = style.linewidth;
			circle.fill = style.fill;
			if(this.twoGroup) {this.twoGroup.add(circle);}
			return circle;
		},
	
		createPolygon: function(verts, style){
			var polygon = "";
			var vert = verts[0],
				x = vert.x === undefined ? vert.get(0) : vert.x,
				y = vert.y === undefined ? vert.get(1) : vert.y,
				l = verts.length;
			var start = {
				x: x,
				y: y
			};
	
			var anchors = [];
			for ( var i = 0; i < l; ++i ){
				
				vert = verts[ i ];
				x = vert.x === undefined ? vert.get(0) : vert.x;
				y = vert.y === undefined ? vert.get(1) : vert.y;
				anchors.push(new Two.Anchor(x, y));
			}
			
			if (l > 2){
				polygon = this.two.makePolygon(anchors);
				polygon.stroke = style.stroke;
				polygon.linewidth = style.linewidth;
				polygon.fill = style.fill;
			}
			
			if(this.twoGroup) {this.twoGroup.add(polygon);}

			return polygon;
		},

		createView: function( geometry ){

			var view = null;
			var aabb = geometry.aabb();
			var hw = aabb.halfWidth + Math.abs(aabb.pos.x);
			var hh = aabb.halfHeight + Math.abs(aabb.pos.y);
			var x = hw;
			var y = hh;
			var name = geometry.name;
			var styles = styles || this.options.styles[name];
			
			if (name === 'circle'){
			
				view = this.createCircle(x, y, geometry.radius, styles);
			
			} else if (name === 'convex-polygon'){
			
				view = this.createPolygon(geometry.vertices, styles);
			}
			
		
			if (view) {
				return view;
			} else {
				throw "Invalid view name passed.";
			}

		},

	
		/**
		 * Callback to be run before rendering
		 * @private
		 * @return {void}
		 */
		beforeRender: function(){

			// Do pre-rendering things here (clear stage?)
		},
		
		/**
		* Helper function
		* Centers the anchor to {x: 0.5, y: 0.5} of a view
		* @param  {PIXI.DisplayObject} view The view to center the anchor
		* @return {void}
		*/
		centerAnchor: function( view ) {
			if (view !== null){
				//view.anchor.x = 0.5;
				//view.anchor.y = 0.5;
			}
		}
	};
});

Physics.behavior('demo-mouse-events', function( parent ){

	return {

		init: function( options ){

			var self = this;

			this.mousePos = Physics.vector();
			this.mousePosOld = Physics.vector();
			this.offset = Physics.vector();
			
			this.el = $(options.el).on({
				mousedown: function(e){
					
					var offset = $(this).offset();
					self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
					
					var body = self._world.findOne({ $at: self.mousePos }) ;
					if ( body ){

						// we're trying to grab a body

						// fix the body in place
						body.fixed = true;
						// remember the currently grabbed body
						self.body = body;
						// remember the mouse offset
						self.offset.clone( self.mousePos ).vsub( body.state.pos );
						return;
					}

					self.mouseDown = true;
				},
				mousemove: function(e){
					var offset = $(this).offset();
					self.mousePosOld.clone( self.mousePos );
					// get new mouse position
					self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
				},
				mouseup: function(e){
					var offset = $(this).offset();
					self.mousePosOld.clone( self.mousePos );
					self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);

					// release the body
					if (self.body){
						self.body.fixed = false;
						self.body = false;
					}
					self.mouseDown = false;
				}
			});
		},

		connect: function( world ){

			// subscribe the .behave() method to the position integration step
			world.subscribe('integrate:positions', this.behave, this);
		},

		disconnect: function( world ){

			// unsubscribe when disconnected
			world.unsubscribe('integrate:positions', this.behave);
		},

		behave: function( data ){

			if ( this.body ){

				// if we have a body, we need to move it the the new mouse position.
				// we'll also track the velocity of the mouse movement so that when it's released
				// the body can be "thrown"
				this.body.state.pos.clone( this.mousePos ).vsub( this.offset );
				this.body.state.vel.clone( this.body.state.pos ).vsub( this.mousePosOld ).vadd( this.offset ).mult( 1 / 30 );
				this.body.state.vel.clamp( { x: -1, y: -1 }, { x: 1, y: 1 } );
				return;
			}

			if ( !this.mouseDown ){
				return;
			}

			// if we don't have a body, then just accelerate
			// all bodies towards the current mouse position

			var bodies = data.bodies,
				scratch = Physics.scratchpad(),
				v = scratch.vector(),
				body;

			for ( var i = 0, l = bodies.length; i < l; ++i ){
					
				body = bodies[ i ];

				// simple linear acceleration law towards the mouse position
				v.clone(this.mousePos)
				 .vsub( body.state.pos )
				 .normalize()
				 .mult( 0.001 )
				 ;

				body.accelerate( v );
			}

			scratch.done();
		}
	};
});


var Delaunay = (function() {

    /**
     * Node
     * @public
     */
    function Node(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = !isNaN(id) && isFinite(id) ? id : null;
    }

    Node.prototype = {
        eq: function(p) {
            var dx = this.x - p.x,
                dy = this.y - p.y;
            return (dx < 0 ? -dx : dx) < 0.0001 && (dy < 0 ? -dy : dy) < 0.0001;
        },

        toString: function() {
            return '(x: ' + this.x + ', y: ' + this.y + ')';
        }
    };

    /**
     * Edge
     */
    function Edge(p0, p1) {
        this.nodes = [p0, p1];
    }

    Edge.prototype = {
        eq: function(edge) {
            var na = this.nodes, nb = edge.nodes;
            var na0 = na[0], na1 = na[1], nb0 = nb[0], nb1 = nb[1];
            return (na0.eq(nb0) && na1.eq(nb1)) || (na0.eq(nb1) && na1.eq(nb0));
        }
    };

    /**
     * Triangle
     */
    function Triangle(p0, p1, p2) {
        this.nodes = [p0, p1, p2];
        this.edges = [new Edge(p0, p1), new Edge(p1, p2), new Edge(p2, p0)];
        this._createId();
        this._createCircumscribedCircle();
    }

    Triangle.prototype = {
        id: null,
        _circle: null,

        _createId: function() {
            var nodes, id0, id1, id2;

            nodes = this.nodes;
            id0 = nodes[0].id;
            id1 = nodes[1].id;
            id2 = nodes[2].id;

            if (id0 !== null && id1 !== null && id2 !== null) {
                this.id = [id0, id1, id2].sort().join('_');
            }
        },

        _createCircumscribedCircle: function() {
            var nodes, p0, p1, p2,
                ax, bx, c, t, u,
                circle, dx, dy;

            nodes = this.nodes;
            p0 = nodes[0];
            p1 = nodes[1];
            p2 = nodes[2];

            ax = p1.x - p0.x;
			ay = p1.y - p0.y;
            bx = p2.x - p0.x;
			by = p2.y - p0.y;
            c = 2 * (ax * by - ay * bx);

            t = (p1.x * p1.x - p0.x * p0.x + p1.y * p1.y - p0.y * p0.y);
            u = (p2.x * p2.x - p0.x * p0.x + p2.y * p2.y - p0.y * p0.y);

            if (!this._circle) {this._circle = {};}

            circle = this._circle;
            circle.x = ((p2.y - p0.y) * t + (p0.y - p1.y) * u) / c;
            circle.y = ((p0.x - p2.x) * t + (p1.x - p0.x) * u) / c;

            dx = p0.x - circle.x;
            dy = p0.y - circle.y;
            circle.radiusSq = dx * dx + dy * dy;
        },

        circleContains: function(p) {
            var circle, dx, dy, distSq;

            circle = this._circle;
            dx = circle.x - p.x;
            dy = circle.y - p.y;
            distSq = dx * dx + dy * dy;

            return distSq < circle.radiusSq;
        }
    };


    /**
     * @constructor
     * @public
     */
    function Delaunay(width, height) {
        this.width = width;
        this.height = height;

        this._triangles = null;

        this.clear();
    }

    Delaunay.prototype = {

        clear: function() {
            var p0 = new Node(0, 0),
                p1 = new Node(this.width, 0),
                p2 = new Node(this.width, this.height),
                p3 = new Node(0, this.height);

            this._triangles = [
                new Triangle(p0, p1, p2),
                new Triangle(p0, p2, p3)
            ];

            return this;
        },

        multipleInsert: function(m) {
            for (var i = 0, len = m.length; i < len; i++) {
                this.insert(m[i]);
            }

            return this;
        },

        insert: function(p) {
            var triangles = this._triangles,
                t,
                temps = [],
                edges = [],
                edge,
                polygon = [],
                isDuplicate,
                i, ilen, j, jlen;

            for (ilen = triangles.length, i = 0; i < ilen; i++) {
                t = triangles[i];

                if (t.circleContains(p)) {
                    edges.push(t.edges[0], t.edges[1], t.edges[2]);
                } else {
                    temps.push(t);
                }
            }

            edgesLoop: for (ilen = edges.length, i = 0; i < ilen; i++) {
                edge = edges[i];

             
                for (jlen = polygon.length, j = 0; j < jlen; j++) {
                    if (edge.eq(polygon[j])) {
                        polygon.splice(j, 1);
                        continue edgesLoop;
                    }
                }

                polygon.push(edge);
            }

            for (ilen = polygon.length, i = 0; i < ilen; i++) {
                edge = polygon[i];
                temps.push(new Triangle(edge.nodes[0], edge.nodes[1], p));
            }

            this._triangles = temps;

            return this;
        },

        getTriangles: function() {
            return this._triangles.slice();
        }
    };

    Delaunay.Node = Node;

    return Delaunay;

})();


/**
 * Particle
 * @super Delaunay.Node
 */
var Particle = (function(Node) {

    var currentId = 0,
        getId = function() { return currentId++; };

    function Particle(x, y) {
        //console.log(this, x, y, getId())
        Node.call(this, x, y, getId());
        this.vx = 0;
        this.vy = 0;
    }

    Particle.prototype = new Node();

    return Particle;

})(Delaunay.Node);


var Utils = (function(){

	var PARTICLE_AMOUNT = 50;

	function degreesToRadians(deg) {
		return deg * Math.PI/180;
	}

	function random(min, max) {
		if(max){
			return Math.random() * (max - min) + min;
		} else {
			return Math.random() * min;
		}
	}

	function removeTwoObject(object) {
		object.remove();
		//$(object._renderer.elem).remove();
	}

	function bringInLetters(chars, delay){
		delay = delay || 0;
		_.each(chars, function(el, i) {
			TweenLite.from(el, 0.25, {autoAlpha:0, ease:Sine.easeOut, delay:delay + 0.25 + (i*0.05), onComplete:function(tween){
				TweenLite.set(tween.target, {clearProps:'all'});
			}, onCompleteParams:['{self}']});
		});
	}

	function fadeOutLetters(chars) {
		_.each(chars, function(el, i){
			TweenLite.set(el,{autoAlpha:0});
		});
	}

	function revealShape(shape, time, subdivide){

		subdivide = subdivide || false;

		var timeline = new TimelineLite({onComplete:function(){
			shape.vertices.pop();
			shape.closed = true;
		}});

		shape.closed = false;
		shape.ending = 0;
		shape.vertices.push(shape.vertices[0].clone());

		if(subdivide) {shape.subdivide();}

		var vertices = shape.vertices;

		time = time/(shape.vertices.length - 1) || 1/(shape.vertices.length - 1);

		_.each(vertices, function(anchor, i) {
			if(i > 0){
				timeline.to(shape, 0.0001, {ending:"+=" + 1/(vertices.length-1)});
				timeline.to(anchor, 0.0001, {x:vertices[i-1].x, y:vertices[i-1].y});
				timeline.to(anchor, time, {x:anchor.x, y:anchor.y, ease: Sine.easeOut});
			}
		});

		return timeline;
	}

	function lineDistance( point1, point2 ){
		var xs = 0;
		var ys = 0;

		xs = point2.x - point1.x;
		xs = xs * xs;

		ys = point2.y - point1.y;
		ys = ys * ys;

		return Math.sqrt( xs + ys );
	}

	function resetParticle(particle, delay){

		var index = particle.index;

		var ang = (Math.PI * 2) / PARTICLE_AMOUNT * index;

		delay = delay || 0;

		particle.translation.x = particle.x || 0;
		particle.translation.y = particle.y || 0;

		bezier = particle.bezier || [{scale:1},{scale:0}];

		var tween = TweenLite.to(particle, particle.speed,  {delay: delay, translation: {x: "+=" + particle.targetX, y: "+=" +particle.targetY},  bezier:bezier, ease:Power3.easeOut, onComplete:function(tween){

			resetParticle(tween.target);

		}, onCompleteParams:['{self}'],  onStart:function(tween){

			tween.target.visible = true;

		}, onStartParams:['{self}']});

	}

	// used to return the first child of a Two.Group
	// useful when interpreting an external SVG and isolating that shape
	function getChild(elem) {
		var parentId = elem.id;
		var childId = parentId + 1;

		child = elem.children[childId];

		return child;
	}

	// return the vertices of an element
	// helpful when translating from imported SVG to your own
	function getVertices(elem) {

		var vertices = [];

		for( var i = 0; i < elem.vertices.length; i++) {
			vertices.push(elem.vertices[i].x);
			vertices.push(elem.vertices[i].y);
		}

		return vertices;

	}

	function createCircle(size) {
		var two = Animation.getTwo();
		var circle = two.makeCircle(0, 0, size/2); // size/2 will be the radius
		return circle;
	}

	function createSquare(size) {
		var two = Animation.getTwo();
		var square = two.makeRectangle(0, 0, size, size);
		return square;
	}

	function createRhombus(size) {
		var two = Animation.getTwo();
		var rhombus = two.makeRectangle(0, 0, size, size);
		rhombus.rotation  = degreesToRadians(45);
		return rhombus;
	}

	function createTriangle(size) {
		var two = Animation.getTwo();
		var triangle = two.makePolygon(-size/2, -size/2, size/2, -size/2, 0, size/2);
		return triangle;
	}

	function createHeart() {
		var two = Animation.getTwo();
		var pathString ='<path d="M 50.000 100.000 C 13.700 73.300 1.300 52.000 0.000 34.700 L 0.000 28.700 C 1.400 10.700 12.700 1.200 22.500 0.200 C 24.100 0.000 25.600 0.000 27.000 0.000 C 38.300 0.000 43.800 5.100 50.000 12.900 C 56.200 5.100 61.600 0.000 73.000 0.000 C 74.400 0.000 75.900 0.100 77.500 0.200 C 87.300 1.200 98.600 10.600 100.000 28.700 L 100.000 34.700 C 100.000 47.200 90.600 66.700 50.000 100.000 C 50.000 100.000 50.000 100.000 50.000 100.000 Z"></path>';
		var pathNode = $(pathString)[0];
		var heart = two.interpret(pathNode);
		heart.center();
		return heart;
	}

	function createStar() {
		var two = Animation.getTwo();
		var pathString ='<polygon xmlns="http://www.w3.org/2000/svg" points="150,88 162.8,126.1 202.7,126.1 170.8,149.9 182.3,188 150,165.4 117.7,188 129.2,149.9 97.3,126.1 137.2,126.1 "/>';
		var pathNode = $(pathString)[0];
		var star = two.interpret(pathNode);
		star.center();
		return star;
	}

	function createPlus() {
		var two = Animation.getTwo();
		var pathString ='<path xmlns="http://www.w3.org/2000/svg" d="M87.5,50v37.5H50v25h37.5V150h25v-37.5H150v-25h-37.5V50H87.5z"/>';
		var pathNode = $(pathString)[0];
		var plus = two.interpret(pathNode);
		plus.center();
		return plus;
	}

	function createX() {
		var x =createPlus();
		x.rotation  = degreesToRadians(45);
		return x;
	}


	

	function createHexagon() {
		var two = Animation.getTwo();
		var pathString ='<polygon xmlns="http://www.w3.org/2000/svg" points="420.7,314 391.9,364 334.1,364 305.3,314 334.1,264 391.9,264 "/>';
		var pathNode = $(pathString)[0];
		var hexagon = two.interpret(pathNode);
		hexagon.center();
		return hexagon;
	}


	function parseSVGFile(path){
		$.get(path, function(doc){
			var two = Animation.getTwo();
			var shape = two.interpret($(doc).find('svg')[0]);
			shape.center();
			shape = Utils.getChild(shape);
			two.update();
			console.log(shape);
		});
	}

	function rippleEffect(elem, rippleAmt, startScale) {
		rippleAmt = rippleAmt || 4;
		//var elem = square; // temp until i build more shapes
		var ripples = [];
		var timeline = new TimelineLite({
			paused: true,
			onComplete: function(){
				for(var i = 0; i < rippleAmt; i++) {
					removeTwoObject(ripples[i]);
				}
			}
		});

		for(var i = 0; i < rippleAmt; i++ ) {
			var clone = elem.clone();
			clone.stroke = "#424242";
			clone.scale = startScale;
			clone.linewidth = 2;
			clone.noFill();
			ripples.push(clone);
		}

		for ( i = rippleAmt - 1; i > 0 ; i-- ) {
			var dur = i * 0.15 + 1;
			if (i === rippleAmt) {
				timeline.to(ripples[i], 0.75, {scale: dur, opacity: 0, ease:Sine.easeOut});
			} else {
				timeline.to(ripples[i], 0.75, {scale: dur, opacity: 0, ease:Sine.easeOut}, "-=0.45");
			}
		}

		timeline.play();
	}


	function rect(x, y, w, h) {
		return [{x: x, y: y},
				{x: x + w, y: 0},
				{x: x + w, y: y + h},
				{x: x, y: y + h}];
	}


	return {
		degreesToRadians:degreesToRadians,
		random:random,
		revealShape:revealShape,
		resetParticle:resetParticle,
		removeTwoObject:removeTwoObject,
		bringInLetters:bringInLetters,
		fadeOutLetters:fadeOutLetters,
		getParticleAmount:function(){return PARTICLE_AMOUNT;},
		getChild:getChild,
		getVertices:getVertices,
		createCircle:createCircle,
		createSquare:createSquare,
		createTriangle:createTriangle,
		createHeart:createHeart,
		parseSVGFile:parseSVGFile,
		rippleEffect:rippleEffect,
		createRhombus:createRhombus,
		createStar:createStar,
		createHexagon:createHexagon,
		createPlus:createPlus,
		createX:createX,
		rect:rect,
		lineDistance:lineDistance
	};

}());