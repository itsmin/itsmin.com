// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

Class.create( 'Sprite', {
	
	id: '',
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	opacity: 1.0,
	rotate: 0,
	scale: 1.0,
	zIndex: 1,
	baseClass: 'sprite',
	className: '',
	html: '',
	url: '',
	color: '',
	plane: null,
	destroyed: false,
	dieOffscreen: false,
	screenLoop: false,
	captureMouse: false,
	offsetX: 0,
	offsetY: 0,
	frameX: 0,
	frameY: 0,
	
	oldScreenX: -9999,
	oldScreenY: -9999,
	oldOpacity: 1.0,
	oldRotate: 0,
	oldScale: 1.0,
	oldFrameX: 0,
	oldFrameY: 0,
	oldColor: '',
	
	init: function() {
		if (!this.id) this.id = get_unique_id();
		
		var div = $(document.createElement('div'));
		div.id = this.id;
		div.className = this.baseClass + ' ' + (this.className || '');
		var sty = div.style;
		// sty.position = 'absolute';
		
		var pos = this.getScreenPos();
		sty.left = '' + pos.x + 'px';
		sty.top = '' + pos.y + 'px';
		
		sty.width = '' + this.width + 'px';
		sty.height = '' + this.height + 'px';
		
		sty.opacity = (this.opacity == 1.0) ? '' : this.opacity;
		this.oldOpacity = this.opacity;
		
		sty.zIndex = this.zIndex;
		
		div.innerHTML = this.html || '';
		
		if (this.color) sty.backgroundColor = this.oldColor = this.color.toString();
		if (this.url) sty.backgroundImage = 'url(' + this.url + ')';
		
		this.plane.div.appendChild( div );
		
		this.div = div;
		this.style = sty;
	},
	
	destroy: function() {
		if (!this.destroyed) {
			this.destroyed = true;
			this.plane.div.removeChild( this.div );
			this.plane.removeSprite(this);
			delete this.div;
			delete this.style;
		}
	},
	
	rename: function(new_id) {
		// give sprite a new id
		delete this.plane.sprites[this.id];
		this.plane.sprites[new_id] = this;
		this.id = new_id;
		this.div.id = this.id;
	},
	
	setClass: function(name) {
		// set class
		this.className = name;
		this.div.className = this.baseClass + ' ' + (this.className || '');
	},
	
	logic: function() {
		// override in subclass
	},
	
	getScreenPos: function() {
		// get position onscreen
		return {
			x: Math.floor( (this.x - (this.plane.scrollX * this.plane.scrollSpeed)) + this.plane.offsetX + this.offsetX ),
			y: Math.floor( (this.y - (this.plane.scrollY * this.plane.scrollSpeed)) + this.plane.offsetY + this.offsetY )
		};
	},
	
	draw: function() {
		// update position on screen
		var pos = this.getScreenPos();
		
		if ((pos.x != this.oldScreenX) || (pos.y != this.oldScreenY)) {
			this.style.left = '' + pos.x + 'px';
			this.style.top = '' + pos.y + 'px';
			
			this.oldScreenX = pos.x;
			this.oldScreenY = pos.y;
			
			if (this.dieOffscreen) {
				var _die = 0;
				if (this.x + this.width < this.plane.scrollX - (this.port.width * this.plane.offscreenDistance)) _die = 1;
				else if (this.y + this.height < this.plane.scrollY - (this.port.height * this.plane.offscreenDistance)) _die = 1;
				else if (this.x >= this.plane.scrollX + this.port.width + (this.port.width * this.plane.offscreenDistance)) _die = 1;
				else if (this.y >= this.plane.scrollY + this.port.height + (this.port.height * this.plane.offscreenDistance)) _die = 1;
				
				if (_die) this.destroy();
			} // dieOffscreen
			else if (this.screenLoop) {
				// screen repeat loop (like asteroids)
				if (this.x + this.width < this.plane.scrollX) this.x = this.plane.scrollX + this.port.width;
				else if (this.y + this.height < this.plane.scrollY) this.y = this.plane.scrollY + this.port.height;
				else if (this.x >= this.plane.scrollX + this.port.width) this.x = this.plane.scrollX - this.width;
				else if (this.y >= this.plane.scrollY + this.port.height) this.y = this.plane.scrollY - this.height;
			} // screenLoop
		}
		
		if (this.opacity != this.oldOpacity) {
			this.style.opacity = (this.opacity == 1.0) ? '' : this.opacity;
			this.oldOpacity = this.opacity;
		}
		
		if ((this.rotate != this.oldRotate) || (this.scale != this.oldScale)) {
			var trans_str = '';
			if (this.rotate) trans_str += ' rotate(' + this.rotate + 'deg)';
			if (this.scale != 1.0) trans_str += ' scale(' + this.scale + ')';
			
			if (ua.safari) this.style.webkitTransform = 'translate3d(0px, 0px, 0px)' + trans_str;
			else if (ua.webkit) this.style.webkitTransform = 'translate(0px, 0px)' + trans_str;
			else if (ua.ff) this.style.MozTransform = 'translate(0px, 0px)' + trans_str;
			else if (ua.op) this.style.OTransform = 'translate(0px, 0px)' + trans_str;
			else this.style.transform = 'translate(0px, 0px)' + trans_str;
			
			this.oldRotate = this.rotate;
			this.oldScale = this.scale;
		}
		
		if ((this.frameX != this.oldFrameX) || (this.frameY != this.oldFrameY)) {
			this.style.backgroundPosition = '' + Math.floor(0 - (this.frameX * this.width)) + 'px ' + Math.floor(0 - (this.frameY * this.height)) + 'px';
			this.oldFrameX = this.frameX;
			this.oldFrameY = this.frameY;
		}
		
		if (this.color) {
			var color = this.color.toString();
			if (color != this.oldColor) {
				this.style.backgroundColor = color;
				this.oldColor = color;
			}
		}
	},
	
	pointIn: function(pt) {
		// check if point is in our rect
		// Note: deliberately not taking into account offsetX / offsetY here (those are visual augmentations only)
		return(
			(pt.x >= this.x) && (pt.y >= this.y) && 
			(pt.x < this.x + this.width) && (pt.y < this.y + this.height)
		);
	},
	
	tween: function(_args) {
		// tween object properties
		_args.target = this;
		this.lastTween = TweenManager.add(_args);
		return this;
	},
	
	stop: function() {
		// remove current tween if applicable
		if (this.lastTween) this.lastTween.destroy();
		return this;
	},
	
	fadeIn: function(duration, args) {
		// fade sprite in over specified duration, plus optional args
		if (!args) args = {};
		return this.tween( merge_objects({
			mode: 'EaseIn',
			algorithm: 'Linear',
			properties: { opacity: { start: this.opacity, end: 1.0 } },
			duration: duration,
			delay: 0
		}, args) );
	},
	
	fadeOut: function(duration, args) {
		// fade sprite out over specified duration, plus optional args
		if (!args) args = {};
		return this.tween( merge_objects({
			mode: 'EaseIn',
			algorithm: 'Linear',
			properties: { opacity: { start: this.opacity, end: 0.0 } },
			duration: duration,
			delay: 0
		}, args) );
	},
	
	centerPointX: function() {
		// get horiz center point
		return (this.x + (this.width / 2));
	},

	centerPointY: function() {
		// get vert center point
		return (this.y + (this.height / 2));
	},

	centerPoint: function() {
		// get point at sprite's center
		return new Point( this.centerPointX(), this.centerPointY() );
	}
	
} );
