// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

Class.create( 'Plane', {
	
	id: '',
	zIndex: 1,
	visible: true,
	logicEnabled: true,
	
	scrollX: 0,
	scrollY: 0,
	scrollSpeed: 1.0,
	
	offsetX: 0,
	offsetY: 0,
	
	__construct: function(id) {
		if (id) this.id = id;
	},
	
	init: function() {
		if (!this.id) this.id = get_unique_id();
		// default to using Port.div (subclasses can override this)
		if (!this.div) this.div = Port.div;
	},
	
	destroy: function() {
		
	},
	
	setZIndex: function(z) {
		this.zIndex = parseInt(z, 10);
	},
	
	setScrollSpeed: function(ss) {
		this.scrollSpeed = parseFloat(ss);
	},
	
	setScroll: function(sx, sy) {
		this.scrollX = Math.floor( sx * this.scrollSpeed );
		this.scrollY = Math.floor( sy * this.scrollSpeed );
	},
	
	setLogic: function(enabled) {
		this.logicEnabled = enabled;
	},
	
	logic: function() {
		// logic loop
	},
	
	draw: function() {
		// draw loop
	},
	
	tween: function(_args) {
		// tween object properties
		_args.target = this;
		this.lastTween = TweenManager.add(_args);
		return this;
	}
	
} );

Plane.subclass( 'SpritePlane', {
	
	sprites: null,
	offscreenDistance: 0.5,
	numSprites: 0,
	
	init: function() {
		// initialize plane
		Plane.prototype.init.call(this);
		this.sprites = {};
		this.numSprites = 0;
	},
	
	destroy: function() {
		// destroy plane
		for (var id in this.sprites) {
			this.sprites[id].destroy();
		}
		this.sprites = {};
		this.numSprites = 0;
	},
	
	setOffscreenDistance: function(dist) {
		this.offscreenDistance = parseFloat(dist);
	},
	
	createSprite: function(class_name, args) {
		// create new sprite and add to plane
		if (!args) args = {};
		if (!args.type) args.type = class_name;
		
		var sprite = null;
		if (typeof(args.type) == 'string') {
			sprite = new window[args.type];
		}
		else {
			sprite = new args.type;
		}

		for (var key in args) {
			sprite[key] = args[key];
		}
		if (typeof(args.zIndex) == 'undefined') sprite.zIndex = this.zIndex;
		if (typeof(args.visible) == 'undefined') sprite.visible = this.visible;

		this.addSprite(sprite);
		return sprite;
	},
	
	addSprite: function(sprite) {
		// add sprite to plane
		sprite.plane = this;
		sprite.port = this.port;
		sprite.init();
		this.sprites[ sprite.id ] = sprite;
		this.numSprites++;
	},
	
	removeSprite: function(sprite) {
		// remove sprite from plane
		delete this.sprites[ sprite.id ];
		this.numSprites--;
	},
	
	get: function(id) {
		// lookup sprite by id
		return this.sprites[id];
	},
	
	logic: function() {
		// logic loop
		if (this.logicEnabled) {
			for (var id in this.sprites) {
				if (this.sprites[id] && this.sprites[id].logic) this.sprites[id].logic();
			}
		}
	},
	
	draw: function() {
		// draw loop
		for (var id in this.sprites) {
			if (this.sprites[id] && this.sprites[id].draw) this.sprites[id].draw();
		}
	},
	
	mouseDown: function(pt, e) {
		// handle mouse down
		if (!this.logicEnabled) return;
		
		// adjust pt for plane
		pt.offset( this.offsetX, this.offsetY );
		pt.offset( this.scrollX * this.scrollSpeed, this.scrollY + this.scrollSpeed );
		
		var hits = [];
		for (var id in this.sprites) {
			var sprite = this.sprites[id];
			if (sprite.captureMouse && sprite.pointIn(pt)) {
				hits.push( sprite );
			}
		}
		if (!hits.length) return;
		
		var highest_z = -99999999;
		var sprite = null;
		for (var idx = 0, len = hits.length; idx < len; idx++) {
			var hit = hits[idx];
			if (hit.zIndex > highest_z) {
				highest_z = hit.zIndex;
				sprite = hit;
			}
		}
		
		Debug.trace( 'SpritePlane', "mouseDown captured on sprite: " + sprite.id );
		Game.mouseObj = sprite;
		if (sprite.mouseDown) sprite.mouseDown(pt, e);
		stop_event(e);
	}
	
} );

SpritePlane.subclass( 'TextPlane', {
	
	charWidth: 0,
	charHeight: 0,
	font: '',
	data: null,
	trackingX: 1.0,
	trackingY: 1.0,
	logicEnabled: false,
	
	init: function() {
		SpritePlane.prototype.init.call(this);
		this.data = [];
	},
	
	getChar: function(tx, ty) {
		// get ascii char at specified location
		var row = this.data[ty];
		if (typeof(row) == 'undefined') return ' ';
		if (typeof(row[tx]) == 'undefined') return ' ';
		return row[tx];
	},
	
	setChar: function(tx, ty, ch) {
		// render single char at location
		var old_ch = this.getChar(tx, ty);
		if (ch != old_ch) {
			if (!this.data[ty]) this.data[ty] = [];
			this.data[ty][tx] = ch;
			
			var sprite_id = this.id + '_' + tx + '_' + ty;
			var sprite = this.get( sprite_id );
			
			if (sprite) {
				// sprite already found at location
				if (ch == ' ') {
					// delete sprite
					sprite.destroy();
				}
				else {
					// change sprite char
					sprite.frameX = ch.charCodeAt(0) - 33;
				}
			}
			else if (ch != ' ') {
				// no sprite found, create
				this.createSprite( Sprite, {
					id: sprite_id,
					width: this.charWidth,
					height: this.charHeight,
					x: (this.charWidth * tx * this.trackingX),
					y: (this.charHeight * ty * this.trackingY),
					frameX: ch.charCodeAt(0) - 33,
					url: this.font
				} );
			}
		}
	},
	
	setString: function(tx, ty, str) {
		// set string at location
		if (typeof(str) != 'string') str = str.toString();
		var len = str.length;
		var startx = tx;
		for (var idx = 0; idx < len; idx++) {
			var ch = str.substring(idx, idx + 1);
			if ((ch == 13) || (ch == 10)) {
				// newline
				tx = startx; ty++;
			}
			else {
				this.setChar( tx++, ty, ch );
			}
		}
	},
	
	setPadInt: function(tx, ty, value, pad) {
		// set zero-padded int at location
		var str = '' + value;
		while (str.length < pad) str = '0' + str;
		this.setString(tx, ty, str);
	}
	
} );
