// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Class.create( 'Color', {
	
	red: 0,
	green: 0,
	blue: 0,
	alpha: 1.0,
	
	__construct: function() {
		this.set.apply( this, arguments );
	},
	
	set: function() {
		if (arguments.length == 1) {
			var thingy = arguments[0];
			if (thingy.__name == 'Color') {
				this.red = thingy.red;
				this.green = thingy.green;
				this.blue = thingy.blue;
				this.alpha = thingy.alpha;
			}
			else if (thingy.toString().match(/^\#?(\w{2})(\w{2})(\w{2})$/)) {
				var rgb = this._HEX2RGB(thingy);
				this.red = rgb.r / 255;
				this.green = rgb.g / 255;
				this.blue = rgb.b / 255;
			}
			else if (thingy.toString().match(/^\#?(\w{1})(\w{1})(\w{1})$/)) {
				var rgb = this._HEX2RGB(thingy);
				this.red = rgb.r / 255;
				this.green = rgb.g / 255;
				this.blue = rgb.b / 255;
			}
			else if (thingy.toString().match(/^rgb\((\d+)\D+(\d+)\D+(\d+)/)) {
				this.red = RegExp.$1 / 255;
				this.green = RegExp.$2 / 255;
				this.blue = RegExp.$3 / 255;
			}
			else if (thingy.toString().match(/^rgba\((\d+)\D+(\d+)\D+(\d+)\D+(\d+)/)) {
				this.red = RegExp.$1 / 255;
				this.green = RegExp.$2 / 255;
				this.blue = RegExp.$3 / 255;
				this.alpha = RegExp.$4 / 255;
			}
			else {
				alert("BAD COLOR FORMAT: " + thingy);
			}
		}
		else {
			this.red = arguments[0] / 255;
			this.green = arguments[1] / 255;
			this.blue = arguments[2] / 255;
		}
	},
	
	isEqualTo: function(color) {
		// return true if color is EXACTLY equal to our color (beware: internal props are floating point -- DANGER DANGER)
		if (color.__name != 'Color') color = new Color(color);
		return ((color.red == this.red) && (color.green == this.green) && (color.blue == this.blue) && (color.alpha == this.alpha));
	},
	
	isNearEqualTo: function(color) {
		// return true if color is NEAR equal to us (visibly equal, within 8-bit precision)
		if (color.__name != 'Color') color = new Color(color);
		var precision = 1.0 / 255;
		return (
			(Math.abs(color.red - this.red) <= precision) && 
			(Math.abs(color.green - this.green) <= precision) && 
			(Math.abs(color.blue - this.blue) <= precision) && 
			(Math.abs(color.alpha - this.alpha) <= precision)
		);
	},
	
	fadeTo: function(color, amount) {
		// ease our values towards a color by the specified amount (0.0 to 1.0)
		if (color.__name != 'Color') color = new Color(color);
		if (amount > 1.0) amount = 1.0;
		else if (amount < 0.0) amount = 0.0;
		
		this.red += ((color.red - this.red) * amount);
		this.green += ((color.green - this.green) * amount);
		this.blue += ((color.blue - this.blue) * amount);
		this.alpha += ((color.alpha - this.alpha) * amount);
	},
	
	hex: function() {
		return '#' + this._toHex(this.red * 255) + this._toHex(this.green * 255) + this._toHex(this.blue * 255);
	},
	
	css: function() {
		if (this.alpha == 1.0) {
			return 'rgb(' + Math.floor(this.red * 255) + ', ' + Math.floor(this.green * 255) + ', ' + Math.floor(this.blue * 255) + ')';
		}
		else {
			return 'rgba(' + Math.floor(this.red * 255) + ', ' + Math.floor(this.green * 255) + ', ' + Math.floor(this.blue * 255) + ', ' + Math.floor(this.alpha * 255) + ')';
		}
	},
	
	// internal methods:
	
	_hexDigitValueTable: {
		'0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9,
		'A':10, 'B':11, 'C':12, 'D':13, 'E':14, 'F':15
	},
	
	_toDec: function(hh) {
		hh = hh.toUpperCase();
		var high = hh.substring(0,1);
		var low = hh.substring(1,2);
		return ( (this._hexDigitValueTable[high] * 16) + this._hexDigitValueTable[low] );
	},

	_HEX2RGB: function(hex) {
		hex = hex.toString().replace(/^\#/, "").toUpperCase();
		if (hex.length == 3) hex = hex.substring(0,1) + '0' + hex.substring(1,2) + '0' + hex.substring(2,3) + '0';
		if (hex.length != 6) return null;

		return {
			r: this._toDec( hex.substring(0,2) ),
			g: this._toDec( hex.substring(2,4) ),
			b: this._toDec( hex.substring(4,6) )
		};
	},
	
	_toHex: function(v) { v=Math.round(Math.min(Math.max(0,v),255)); return("0123456789ABCDEF".charAt((v-v%16)/16)+"0123456789ABCDEF".charAt(v%16)); }
	
} );


Sprite.extend( 'GameButton', {

	url: 'combo_button_play_curly.png',
	width: 284,
	height: 64,
	
	init: function() {
		var image = Effect.ImageLoader.lookupImage( this.url );
		this.width = (image.img.width / 2) / $P.getZoomLevel();
		this.height = image.img.height / $P.getZoomLevel();
		this.__parent.init.call(this);
	},
	
	setup: function() {
		// this.div.style.cursor = 'pointer';
	},
	
	onMouseOver: function() {
		this.div.style.cursor = 'pointer';
		this.setFrameX(1);
	},
	
	onMouseOut: function() {
		this.setFrameX(0);
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'InGameMessage', {

	width: 284,
	height: 64,
	url: 'ingamemessage_01-desktop.png',
	zIndex: 10,
	hang_time: 5 * 60,
	
	init: function() {
		var image = Effect.ImageLoader.lookupImage( this.url );
		this.width = image.img.width / $P.getZoomLevel();
		this.height = image.img.height / $P.getZoomLevel();
		this.x = (320 / 2) - (this.width / 2);
		
		if (ua.mobile && (absorb.orb_color_max > 1)) this.y = 326 - this.height;
		else this.y = 390 - this.height;
		
		this.opacity = 0;
		this.__parent.init.call(this);
	},
	
	setup: function() {
		var self = this;
		this.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 60,
			onTweenComplete: function() {
				self.tween({
					mode: 'EaseInOut',
					algorithm: 'Quadratic',
					properties: { opacity: { start: 1.0, end: 0.0 } },
					duration: 60,
					delay: self.hang_time,
					onTweenComplete: function() {
						self.destroy();
					}
				});
			}
		});
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'LifeOrb', {

	width: 52,
	height: 52,
	url: 'life_white.png',
	color: 'white',
	
	setup: function() {
		this.setColor( this.color );
	},
	
	setColor: function(color) {
		this.color = color;
		this.setImage( 'life_' + this.color + '.png' );
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'LifeOrbInfinite', {

	width: 84,
	height: 52,
	url: 'life_infinite.png',
	color: 'blue',
	
	setup: function() {
		this.setColor( this.color );
	},
	
	setColor: function(color) {
		if (color.toString().match(/^\d+$/)) {
			this.color = absorb.color_order[color];
			this.setFrameX( color );
		}
		else {
			this.color = color;
			this.setFrameX( find_idx_in_array(absorb.color_order, this.color) );
		}
	},
	
	draw: function() {
		if (this.wildcard) this.setFrameX( Math.floor(Math.random() * 4) );
		Sprite.prototype.draw.call(this);
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'LogoTimer', {

	width: 20,
	height: 20,
	url: 'timer.png',
	frameX: 58,
	
	draw: function() {
		if (this.visible) {
			var fx = Math.floor( (($G.logicClock - this.timerStart) / this.timerDuration) * 58 );
			if (fx > 58) fx = 58;
			this.setFrameX( fx );
		}
		
		this.__parent.draw.call(this);
	},
	
	getProgress: function() {
		if (this.visible) {
			return( (($G.logicClock - this.timerStart) / this.timerDuration) );
		}
		return 0;
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

if (!CustomSprite.extend) {
	CustomSprite.prototype.__name = 'CustomSprite';
	CustomSprite.extend = function(_name, _members) { Class.extend(this, _name, _members); };
	CustomSprite.subclass = CustomSprite.extend;
}

CustomSprite.extend( 'LogoTimerBack', {

	width: 18,
	height: 18,
	color: '#ffffff',
	
	init: function() {
		this.__parent.init.call(this);
		this.style.backgroundColor = this.color;
	},
	
	setColor: function(color) {
		this.color = color;
		this.style.backgroundColor = this.color;
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'MobileColorSwitch', {
	
	width: 66,
	height: 64,
	url: 'onscreen_blue.png',
	frameX: 0,
	color: 'blue',
	
	init: function() {
		this.url = 'onscreen_' + this.color + '.png';
		Sprite.prototype.init.call(this);
	},
	
	update: function() {
		if (absorb.ring) {
			if (absorb.ring.color == this.color) this.setFrameX(1);
			else this.setFrameX(0);
		}
	},
	
	onMouseUp: function() {
		if (absorb.ring) absorb.ring.switchColor( this.color );
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'Orb', {

	width: 60,
	height: 60,
	url: 'orb_blue_rotate.png',
	collisions: true,
	dieOffscreen: true,
	hitRect: new Rect(12, 12, 48, 48),
	soild: false,
	xd: 0,
	yd: 0,
	
	radius: 15,
	category: 'orb',
	behavior: 'standard',
	color: 'blue',
	shadow: null,
	
	init: function() {
		this.url = 'orb_' + this.color + '_rotate.png';
		
		Sprite.prototype.init.call(this);
		
		if (!ua.mobile) this.initShadow();
	},
	
	initShadow: function() {
		if (!this.shadow) {
			this.shadow = new StaticImageSprite();
			this.shadow.width = 60;
			this.shadow.height = 60;
			this.shadow.url = 'orb_shadow.png';
			this.shadow.zIndex = this.zIndex - 1; // under us
			this.shadow.plane = this.plane;
			this.shadow.port = this.port;
		}
		this.shadow.init();
	},
	
	reset: function() {
		Sprite.prototype.reset.call(this);
		if (this.shadow) this.shadow.reset();
	},
	
	logic: function(clock) {
		this[ 'behavior_' + this.behavior ]();
	},
	
	behavior_standard: function() {
		// standard behavior, just fall straight down at set speed
		// this.y += session.orb_speed;
		this.xd += ((absorb.gravity.x * absorb.gravity_mod.x) - this.xd) / 8;
		this.yd += ((absorb.gravity.y * absorb.gravity_mod.y) - this.yd) / 8;

		this.x += this.xd;
		this.y += this.yd;
	},
	
	behavior_wind: function() { this.behavior_standard(); }, // built into level gravity
	behavior_reverse: function() { this.behavior_standard(); }, // built into level gravity
	
	behavior_magnetic: function(angle_offset) {
		// we like the ring
		if (!angle_offset) angle_offset = 0;
		var txd = absorb.gravity.x * absorb.gravity_mod.x;
		var tyd = absorb.gravity.y * absorb.gravity_mod.y;
		
		if (absorb.ring) {
			var ringPt = absorb.ring.centerPoint();
			var centerPt = this.centerPoint();
			var dist = centerPt.getDistance(ringPt);
			if (dist < 240) {
				var amount = (240 - dist) / 240;
				var angle = (centerPt.getAngle(ringPt) + angle_offset) % 360;
				var pt = new Point();
				pt.project( angle, 1 );
				txd = tweenFrame( txd, pt.x, amount, 'EaseIn', 'Quadratic' );
				tyd = tweenFrame( tyd, pt.y, amount, 'EaseIn', 'Quadratic' );
			}
		}
		
		this.xd += (txd - this.xd) / 8;
		this.yd += (tyd - this.yd) / 8;
		this.x += this.xd;
		this.y += this.yd;
	},
	
	behavior_repulsion: function() {
		// we don't like the ring
		this.behavior_magnetic( 180 );
	},
	
	pop: function() {
		// pop orb into several particles, and destroy self
		var total_particles = count_keys( absorb.pplane.sprites );
		var num_particles = 40;
		if (total_particles > 70) num_particles = 30;
		if (total_particles > 150) num_particles = 20;
		
		if (ua.ie) num_particles /= 2;
		else if (ua.mobile) num_particles = 0;
		
		for (var idx = 0; idx < num_particles; idx++) {
			var px = Math.floor( Math.random() * this.width );
			var py = Math.floor( Math.random() * this.height );
			
			absorb.pplane.createSprite( 'OrbParticle', {
				x: this.x + px,
				y: this.y + py,
				color: this.color,
				xd: (px - (this.width / 2)) / 10,
				yd: (py - (this.height / 2)) / 10,
				timer: Math.floor( Math.random() * 30 ) + 30
			});
		}
		
		if (!ua.mobile) absorb.pplane.createSprite( 'OrbShockwave', {
			x: this.centerPointX() - 80,
			y: this.centerPointY() - 80,
			color: this.color,
			zIndex: this.zIndex - 1,
			wave: '01',
			duration_a: 15,
			duration_b: 20
		} );
		
		var self = this;
		$G.scheduleEvent( 5, function() {
			absorb.pplane.createSprite( 'OrbShockwave', {
				x: self.centerPointX() - 80,
				y: self.centerPointY() - 80,
				color: self.color,
				zIndex: self.zIndex - 1,
				wave: '02',
				duration_a: 20,
				duration_b: 40
			} );
		} );
		
		if (this.onPop) this.onPop();
		this.destroy();
	},
	
	bad_pop: function() {
		// pop in a "bad" way (absorption from wrong ring color)
		if (this.onBadPop) this.onBadPop();
		this.destroy();
	},
	
	draw: function() {
		var centerPt = this.centerPoint();
		this.setRotation( 360 - (centerPt.getAngle( absorb.lightPt ) - 225 - 90) );
		
		Sprite.prototype.draw.call(this);
		
		this.drawShadow();
	},
	
	drawShadow: function() {
		if (this.shadow) {
			var centerPt = this.centerPoint();
			var shadowCenterPt = centerPt.project( absorb.lightPt.getAngle(centerPt), centerPt.getDistance(absorb.lightPt) / 18 );
			this.shadow.x = shadowCenterPt.x - 30;
			this.shadow.y = shadowCenterPt.y - 30;
			this.shadow.draw();
		}
	},
	
	destroy: function() {
		Sprite.prototype.destroy.call(this);
		if (this.shadow) this.shadow.destroy();
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Orb.extend( 'OrbClock', {
	
	face: null,
	hour_hand: null,
	minute_hand: null,
	second_hand: null,
	pin: null,
	color: 'white',
	
	init: function() {
		this.color = 'white';
		Orb.prototype.init.call(this);
		this.initHands();
	},
	
	initHands: function() {
		if (!this.face) {
			this.face = new Sprite();
			this.face.width = 60;
			this.face.height = 60;
			this.face.url = 'orb_clockface.png';
			this.face.zIndex = this.zIndex + 1;
			this.face.plane = this.plane;
			this.face.port = this.port;
		}
		this.face.init();
		
		if (!this.hour_hand) {
			this.hour_hand = new Sprite();
			this.hour_hand.width = 60;
			this.hour_hand.height = 60;
			this.hour_hand.url = 'orb_clockhour_rotate.png';
			this.hour_hand.zIndex = this.zIndex + 1;
			this.hour_hand.plane = this.plane;
			this.hour_hand.port = this.port;
		}
		this.hour_hand.init();
		
		if (!this.minute_hand) {
			this.minute_hand = new Sprite();
			this.minute_hand.width = 60;
			this.minute_hand.height = 60;
			this.minute_hand.url = 'orb_clockminute_rotate.png';
			this.minute_hand.zIndex = this.zIndex + 1;
			this.minute_hand.plane = this.plane;
			this.minute_hand.port = this.port;
		}
		this.minute_hand.init();
		
		if (!this.second_hand) {
			this.second_hand = new Sprite();
			this.second_hand.width = 60;
			this.second_hand.height = 60;
			this.second_hand.url = 'orb_clocksecond_rotate.png';
			this.second_hand.zIndex = this.zIndex + 1;
			this.second_hand.plane = this.plane;
			this.second_hand.port = this.port;
		}
		this.second_hand.init();
		
		if (!this.pin) {
			this.pin = new Sprite();
			this.pin.width = 60;
			this.pin.height = 60;
			this.pin.url = 'orb_clock_pin.png';
			this.pin.zIndex = this.zIndex + 2;
			this.pin.plane = this.plane;
			this.pin.port = this.port;
		}
		this.pin.init();
	},
	
	reset: function() {
		Orb.prototype.reset.call(this);
		if (this.face) this.face.reset();
		if (this.hour_hand) this.hour_hand.reset();
		if (this.minute_hand) this.minute_hand.reset();
		if (this.second_hand) this.second_hand.reset();
		if (this.pin) this.pin.reset();
	},
	
	draw: function() {
		Orb.prototype.draw.call(this);
		this.drawHands();
	},
	
	getClockTime: function() {
		// get time to display in clock face
		return new Date();
	},
	
	drawHands: function() {
		var now = this.getClockTime();
		
		if (this.face) {
			this.face.x = this.x;
			this.face.y = this.y;
			this.face.draw();
		}
		
		if (this.hour_hand) {
			this.hour_hand.x = this.x;
			this.hour_hand.y = this.y;
			var hrs = now.getHours() % 12;
			this.hour_hand.setRotation( 0 +  ((hrs / 12) * 360) );
			this.hour_hand.draw();
		}
		
		if (this.minute_hand) {
			this.minute_hand.x = this.x;
			this.minute_hand.y = this.y;
			this.minute_hand.setRotation( 0 + ((now.getMinutes() / 60) * 360) );
			this.minute_hand.draw();
		}
		
		if (this.second_hand) {
			this.second_hand.x = this.x;
			this.second_hand.y = this.y;
			this.second_hand.setRotation( 0 + ((now.getSeconds() / 60) * 360) );
			this.second_hand.draw();
		}
		
		if (this.pin) {
			this.pin.x = this.x;
			this.pin.y = this.y;
			this.pin.draw();
		}
	},
	
	destroy: function() {
		Orb.prototype.destroy.call(this);
		if (this.face) this.face.destroy();
		if (this.hour_hand) this.hour_hand.destroy();
		if (this.minute_hand) this.minute_hand.destroy();
		if (this.second_hand) this.second_hand.destroy();
		if (this.pin) this.pin.destroy();
	}
	
} );

OrbClock.extend( 'OrbClockFast', {

	getClockTime: function() {
		// get time to display in clock face
		var now = new Date();
		return new Date( now.getTime() + ($G.logicClock * 3000) );
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Orb.extend( 'OrbDark', {
	
	color: 'black',
	
	init: function() {
		this.url = 'orb_dark.png';
		Sprite.prototype.init.call(this);
		this.initShadow();
	},
	
	draw: function() {
		Sprite.prototype.draw.call(this);
		this.drawShadow();
	},
	
	pop: function() {
		$A.playSound('explosion');

		// repel all sprites nearby
		var centerPt = this.centerPoint();
		
		var sprites = this.plane.findSprites({ category: 'orb' });
		for (var idx = 0, len = sprites.length; idx < len; idx++) {
			var sprite = sprites[idx];
			var sCenter = sprite.centerPoint();
			var distance = sCenter.getDistance( centerPt );
			if (distance < 300) {
				var angle = sCenter.getAngle( centerPt );
				var delta = (new Point()).project( angle, (300 - distance) / 10 );
				sprite.xd -= delta.x;
				sprite.yd -= delta.y;
			} // nearby
		} // foreach sprite

		this.destroy();
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Orb.extend( 'OrbExtraLife', {
	
	color: 'white',
	
	init: function() {
		this.color = 'white';
		this.__parent.init.call(this);
	}
	
} );

// OrbParticle Sprite

function OrbParticle() {
	// class constructor
	this.color = 'blue';
	this.timer = 30;
	this.xd = 0;
	this.yd = -4;
	
	this.collisions = false;
	this.dieOffscreen = true;
}

OrbParticle.prototype = new CustomSprite();
OrbParticle.prototype.type = 'OrbParticle';
OrbParticle.prototype.width = 1;
OrbParticle.prototype.height = 1;

OrbParticle.prototype.init = function() {
	// setup background color plus text
	
	// call super's init
	CustomSprite.prototype.init.call(this);
	
	// style it up
	// this.div.className = 'particle_' + this.color;
	this.style.backgroundColor = absorb.highlight_colors[this.color];
};

OrbParticle.prototype.logic = function() {
	// move particle
	this.x += this.xd;
	this.y += this.yd;
	
	// gravity
	this.yd += 0.1;
	
	// wind resistance
	this.xd -= (this.xd / 16);
	
	// time to live
	this.timer--;
	if (!this.timer) this.destroy();
};

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'OrbShockwave', {
	
	width: 160,
	height: 160,
	url: 'ring_blue_absorb02_fade.png',
	frameX: ua.ie ? 7 : 0,
	opacity: ua.ie ? 1.0 : 0.0,
	
	color: 'blue',
	wave: '02',
	duration_a: 20,
	duration_b: 40,
	tween_mode: 'EaseInOut',
	tween_algo: 'Quadratic',
	
	setup: function() {
		this.setImage( 'ring_' + this.color + '_absorb'+this.wave+'_fade.png' );
		
		var self = this;
		this.tween({
			mode: this.tween_mode,
			algorithm: this.tween_algo,
			properties: ua.ie ? { frameX: { start: 7, end: 0, filter: Math.floor } } : { opacity: { start: 0.0, end: 1.0 } },
			duration: this.duration_a,
			onTweenComplete: function() {
				self.tween({
					mode: self.tween_mode,
					algorithm: self.tween_algo,
					properties: ua.ie ? { frameX: { start: 0, end: 7, filter: Math.floor } } : { opacity: { start: 1.0, end: 0.0 } },
					duration: self.duration_b,
					onTweenComplete: function() {
						self.destroy();
					}
				});
			}
		});
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Orb.extend( 'OrbWildcard', {
	
	color: 'white',
	
	init: function() {
		this.url = 'orb_chrome.png';
		Sprite.prototype.init.call(this);
		this.initShadow();
	},
	
	draw: function() {
		// this.setFrameX( Math.floor($G.logicClock / 2) % 32 );
		Sprite.prototype.draw.call(this);
		this.drawShadow();
	},
	
	pop: function() {
		var total_particles = count_keys( absorb.pplane.sprites );
		var num_particles = 80;
		
		for (var idx = 0; idx < num_particles; idx++) {
			var px = Math.floor( Math.random() * this.width );
			var py = Math.floor( Math.random() * this.height );
			
			absorb.pplane.createSprite( 'OrbParticle', {
				x: this.x + px,
				y: this.y + py,
				color: rand_array(absorb.color_order),
				xd: (px - (this.width / 2)) / 10,
				yd: (py - (this.height / 2)) / 10,
				timer: Math.floor( Math.random() * 30 ) + 30
			});
		}
		
		this.destroy();
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'Ring', {

	width: 160,
	height: 160,
	url: 'ring_white.png',
	collisions: true,
	solid: false,
	dieOffscreen: false,
	
	radius: 24,
	color: 'white',
	shadow: null,
	
	init: function() {
		this.url = 'ring_' + this.color + '.png';
		
		this.__parent.init.call(this);
		
		if (!this.shadow) {
			this.shadow = new Sprite();
			this.shadow.x = this.x;
			this.shadow.y = this.y;
			this.shadow.width = 160;
			this.shadow.height = 160;
			this.shadow.url = 'ring_' + this.color + '_trail_fade.png';
			this.shadow.zIndex = this.zIndex - 1; // under us
			this.shadow.plane = this.plane;
			this.shadow.port = this.port;
		}
		this.shadow.init();
		
		this.first_orb = true;
	},
	
	setup: function() {
		// register handlers for keys
		this.setKeyHandler( 'switch_left', 'switch_right' );
		// for (var key in absorb.colors) {
		for (var idx = 0, len = absorb.color_order.length; idx < len; idx++) {
			var key = absorb.color_order[idx];
			this.setKeyHandler( 'color_' + key );
		}
	},
	
	onKeyDown: function(key) {
		// handle keydown event
		if (absorb.orb_color_max == 1) return;
		
		switch (key) {
			case 'switch_left':
				var color_idx = find_idx_in_array( absorb.color_order, this.color );
				color_idx--;
				if (color_idx < 0) color_idx = absorb.orb_color_max - 1;
				this.switchColor( absorb.color_order[color_idx] );
				break;
			
			case 'switch_right':
				var color_idx = find_idx_in_array( absorb.color_order, this.color );
				color_idx++;
				if (color_idx >= absorb.orb_color_max) color_idx = 0;
				this.switchColor( absorb.color_order[color_idx] );
				break;
		}
		
		if (key.match(/color_(\w+)/)) {
			this.switchColor( RegExp.$1 );
		}
	},
	
	reset: function() {
		this.__parent.reset.call(this);
		if (this.shadow) this.shadow.reset();
	},
	
	logic: function(clock) {
		var pt = $P.getMouseCoords();
		if (pt) this.targetPt = pt;
		
		if (this.targetPt) {
			this.x += (((this.targetPt.x - 80) - this.x) * 0.25);
			this.y += (((this.targetPt.y - 80) - this.y) * 0.25);
			
			if (this.shadow) {
				this.shadow.x += (((this.targetPt.x - 80) - this.shadow.x) * 0.12);
				this.shadow.y += (((this.targetPt.y - 80) - this.shadow.y) * 0.12);
			}
			
			// collision detect
			var centerPt = this.centerPoint();
			var sprites = this.plane.findSprites({ category: 'orb' });

			for (var idx = 0, len = sprites.length; idx < len; idx++) {
				var sprite = sprites[idx];
				var dist = centerPt.getDistance( sprite.centerPoint() );

				if (dist < this.radius + sprite.radius) {
					// collision with orb!
					this.hit( sprite );
					idx = len;
				} // collision
			} // foreach sprite
			
			// $P.follow(this, 0.08);
			
			if (!ua.iphone) {
				var msx = this.port.virtualWidth - this.port.portWidth;
				var px = this.targetPt.x;
				if (px > 340) {
					px = tweenFrame(340, 640, (px - 340) / 320, 'EaseOut', 'Quadratic');
				}
				else if (px < 300) {
					px = tweenFrame(300, 0, (300 - px) / 300, 'EaseOut', 'Quadratic');
				}
				var tsx = (px / this.port.virtualWidth) * msx;
				var sx = this.port.scrollX + ((tsx - this.port.scrollX) * 0.06);
				this.port.setScroll( sx, 0 );
			}
		}
		
		if (this.shadow && ($G.logicClock % 4 == 0)) {
			if (this.shadow.frameX) this.shadow.setFrameX( this.shadow.frameX - 1 );
		}
		
		if (this.wildcard) {
			// flash colors wildly
			this.setFrameX( Math.floor(Math.random() * 5) );
			absorb.smlogo_back.setColor( absorb.highlight_colors[ rand_array(absorb.color_order) ] );
			
			var color = new Color( absorb.colors[ rand_array(absorb.color_order) ] );
			color.fadeTo( '#000000', absorb.smlogo_timer.getProgress() );
			$P.background.color = $P.div.style.backgroundColor = color.css();
		}
	},
	
	beginWildcard: function() {
		// begin wildcard bonus
		this.wildcard = true;
		this.setImage( 'rings.png' );
		this.shadow.setImage( 'ring_white_trail_fade.png' );
	},
	
	endWildcard: function() {
		// end wildcard bonus
		this.wildcard = false;
		this.setFrameX( 0 );
		this.setImage( 'ring_' + this.color + '.png' );
		this.shadow.setImage( 'ring_' + this.color + '_trail_fade.png' );
		
		absorb.smlogo_back.setColor( absorb.highlight_colors[ this.color ] );
		
		$P.background.color = $P.div.style.backgroundColor = absorb.bkgndColor.css();
	},
	
	switchColor: function(new_color) {
		// switch ring color
		var color_idx = find_idx_in_array( absorb.color_order, new_color );
		if (color_idx >= absorb.orb_color_max) return;
		if (new_color == this.color) return;
		if (this.wildcard) return;
		
		this.color = new_color;
		this.setImage( 'ring_' + this.color + '.png' );
		this.shadow.setImage( 'ring_' + this.color + '_trail_fade.png' );
		
		// $P.background.color = $P.div.style.backgroundColor = absorb.colors[ this.color ];
		absorb.bkgndColorTarget.set( absorb.colors[ this.color ] );
		
		absorb.smlogo_back.setColor( absorb.highlight_colors[ this.color ] );
		
		for (var idx = 0, len = absorb.life_orbs.length; idx < len; idx++) {
			absorb.life_orbs[idx].setColor( this.color );
		}
		
		if (ua.mobile) {
			// update mobile onscreen controls to match new color
			absorb.hud.findSprites({ type: 'MobileColorSwitch' }).each( function(sprite) {
				sprite.update();
			} );
		}
		
		if (!this.first_orb) $A.playSound('switch_color');
	},
	
	hit: function(sprite) {
		// handle sprite hit
		switch (sprite.type) {
			case 'OrbClock':
				if (!absorb.bonus_enabled) {
					sprite.pop();
					absorb.clockBonus();
				}
				break;
		
			case 'OrbClockFast':
				if (!absorb.bonus_enabled) {
					sprite.pop();
					absorb.clockBonus('fast');
				}
				break;
			
			case 'OrbExtraLife':
				// 1up
				sprite.pop();
				absorb.lives++;
				absorb.dirty_display = true;
				absorb.bkgndColor.set( '#FFFFFF' );
				$A.playSound('beat_challenge');
				break;
				
			case 'OrbDark':
				sprite.pop();
				if (!this.wildcard) {
					absorb.lives--;
					absorb.dirty_display = true;
				
					absorb.bkgndColor.set( '#000000' );
					this.shadow.setFrameX(7);
				
					// death?
					if (!absorb.lives) {
						absorb.gameOver();
					}
				}
				break;
			
			case 'OrbWildcard':
				if (!absorb.bonus_enabled) {
					sprite.pop();
					absorb.wildcardBonus();
				}
				break;
			
			case 'Orb':
				if ((sprite.color == this.color) || this.first_orb || this.wildcard) {
					// good orb
					sprite.pop();
					
					this.shadow.setFrameX(7);
					
					if (this.first_orb) {
						// switch color on first orb
						this.switchColor( sprite.color );
					}
					delete this.first_orb;
					$A.playSound('good_orb');
					
					absorb.score += absorb.score_per_orb;
					absorb.orbs[sprite.color]++;
					absorb.dirty_display = true;
					
					if ((absorb.score >= absorb.next_level_at) && !absorb.bonus_enabled) {
						absorb.nextLevel();
					} // next level
				}
				else {
					// bad orb
					sprite.bad_pop();
					$A.playSound('bad_orb');
					
					absorb.bkgndColor.set( '#000000' );
					this.shadow.setFrameX(7);
					
					absorb.splane.createSprite( 'ScreenFlash' );
					
					// death?
					if (absorb.state == 'game') {
						absorb.lives--;
						absorb.dirty_display = true;
					
						if (!absorb.lives) {
							absorb.gameOver();
						}
					}
				}
				break;
		}
	},
	
	pop: function() {
		// we're dead
		// to help the effect, kill all existing particles that may be around
		absorb.pplane.deleteAll();
		
		for (var idx = 0; idx < 90; idx++) {
			var px = Math.floor( Math.random() * this.width );
			var py = Math.floor( Math.random() * this.height );
			
			absorb.pplane.createSprite( 'OrbParticle', {
				x: this.x + px,
				y: this.y + py,
				color: this.color,
				xd: (px - (this.width / 2)) / 5,
				yd: (py - (this.height / 2)) / 5,
				timer: Math.floor( Math.random() * 30 ) + 30
			});
		}
		
		// repel all sprites nearby
		var centerPt = this.centerPoint();
		
		var sprites = this.plane.findSprites({ category: 'orb' });
		for (var idx = 0, len = sprites.length; idx < len; idx++) {
			var sprite = sprites[idx];
			var sCenter = sprite.centerPoint();
			var distance = sCenter.getDistance( centerPt );
			if (distance < 300) {
				var angle = sCenter.getAngle( centerPt );
				var delta = (new Point()).project( angle, (300 - distance) / 20 );
				sprite.xd -= delta.x;
				sprite.yd -= delta.y;
			} // nearby
		} // foreach sprite
		
		$A.playSound('explosion');
		this.destroy();
	},
	
	draw: function() {
		this.__parent.draw.call(this);
		if (this.shadow) this.shadow.draw();
	},
	
	destroy: function() {
		this.__parent.destroy.call(this);
		if (this.shadow) this.shadow.destroy();
	}
	
} );

// ScreenFlash Sprite

function ScreenFlash() {
	// class constructor
	this.timer = 10;
	this.xd = 0;
	this.yd = 0;
	
	this.collisions = false;
	this.dieOffscreen = false;
}

ScreenFlash.prototype = new CustomSprite();
ScreenFlash.prototype.type = 'ScreenFlash';
ScreenFlash.prototype.width = 320;
ScreenFlash.prototype.height = 480;

ScreenFlash.prototype.init = function() {
	// setup background color plus text
	this.x = this.plane.scrollX;
	
	// call super's init
	CustomSprite.prototype.init.call(this);
	
	// style it up
	// this.div.className = 'particle_' + this.color;
	this.style.backgroundColor = '#f00';
};

ScreenFlash.prototype.logic = function() {
	// flash 3 times then die
	if (this.visible) this.hide();
	else this.show();
	
	// time to live
	this.timer--;
	if (!this.timer) this.destroy();
};

ScreenFlash.prototype.draw = function() {
	// setup background color plus text
	this.x = this.plane.scrollX;
	
	// call super's init
	CustomSprite.prototype.draw.call(this);
};

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

Sprite.extend( 'TextLink', {

	width: 64,
	height: 16,
	url: 'text.png',
	zIndex: 20,
	
	onMouseOver: function() {
		this.div.style.cursor = 'pointer';
	}
	
} );

// absOrb v1
// Copyright (c) 2010 Gold Cartridge & Effect Games LLC

$G.preloadImage( '/images/backgrounds/background_640px.png' );
$G.preloadImage( '/images/ui/frame-top.png' );
$G.preloadImage( '/images/ui/frame-left.png' );
$G.preloadImage( '/images/ui/frame-right.png' );
$G.preloadImage( '/images/ui/frame-bottom.png' );
$G.preloadImage( '/images/logos/logos_title_blue.png' );
$G.preloadImage( '/images/logos/logos_title_red.png' );
$G.preloadImage( '/images/logos/logos_title_green.png' );
$G.preloadImage( '/images/logos/logos_title_yellow.png' );
$G.preloadImage( '/images/sprites/rings/ring_blue_absorb02.png' );
$G.preloadImage( '/images/ui/combo_button_play_curly.png' );
$G.preloadImage( '/images/logos/logo_small.png' );
$G.preloadImage( '/images/ui/curlybraces_left.png' );
$G.preloadImage( '/images/ui/curlybraces_right.png' );
$G.preloadImage( '/images/ui/gameover-lay.png' );
$G.preloadImage( '/images/ui/gameover-text.png' );
$G.preloadImage( '/images/ui/credits_text_effectgames.png' );
$G.preloadImage( '/images/ui/credits_text_goldcartridge.png' );
$G.preloadImage( '/images/backgrounds/background_credits.png' );
// $G.preloadImage( '/images/backgrounds/background_options.png' );

$G.preloadImage( '/images/ui/howtoplay/revised/01.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/02a.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/02b.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/03.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/04.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/05.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/07.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/08.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/09.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/10.png' );
$G.preloadImage( '/images/ui/howtoplay/revised/11.png' );

if (typeof(ua.android) == 'undefined') {
	ua.android = !!navigator.userAgent.match(/android/i);
}
if (typeof(ua.mobile) == 'undefined') {
	ua.mobile = (ua.iphone || ua.android);
}

var absorb = {
	
	native_colors: {
		blue: '#70E2F3',
		pink: '#FB00B7',
		green: '#3FEB00',
		orange: '#FB7000',
		white: '#FFFFFF'
	},
	native_color_order: ['blue', 'pink', 'green', 'orange'],
	
	native_highlight_colors: {
		blue: '#70E2F3',
		pink: '#FB00B7',
		green: '#3FEB00',
		orange: '#FB7000',
		white: '#FFFFFF'
	},
	
	chrome_colors: {
		blue: '#0D75BB',
		red: '#EC1B23',
		green: '#39B44A',
		yellow: '#FEF201',
		white: '#FFFFFF'
	},
	chrome_color_order: ['blue', 'red', 'green', 'yellow'],
	
	chrome_highlight_colors: {
		blue: '#0088FF',
		green: '#00FF00',
		red: '#FF0000',
		yellow: '#FEF201',
		white: '#FFFFFF'
	},
	
	colors: null,
	color_order: null,
	gravity_mod: new Point(),
	orb_probability_mod: 0,
	
	levels: [
		{ /* level 0 doesn't exist */ },
		{ // level 1
			gravity: (new Point()).project( 270, 0.6 ),
			orb_probability: 0.03,
			orb_color_max: 1,
			msg: "01.png",
			behavior: 'standard'
		},
		{ // level 2
			gravity: (new Point()).project( 270, 0.7 ),
			orb_probability: 0.035,
			orb_color_max: 2,
			msg: ua.mobile ? "ingamemessage_01-handheld.png" : "ingamemessage_01-desktop.png",
			behavior: 'standard'
		},
		{ // level 3
			gravity: (new Point()).project( 270, 0.8 ),
			orb_probability: 0.04,
			orb_color_max: 3,
			behavior: 'standard',
			msg: "ingamemessage_chromeorb.png",
			want_orb: 'OrbWildcard'
		},
		{ // level 4
			gravity: (new Point()).project( 270, 0.95 ),
			orb_probability: 0.045,
			orb_color_max: 4
		},
		{ // level 5
			gravity: (new Point()).project( 270, 1.1 ),
			orb_probability: 0.05
		},
		{ // level 6
			gravity: (new Point()).project( 270, 1.2 ),
			orb_probability: 0.055
		},
		{ // level 7
			gravity: (new Point()).project( 270, 1.5 ),
			orb_probability: 0.06
		},
		{ // level 8
			gravity: (new Point()).project( 270, 1.75 ),
			orb_probability: 0.065
		},
		{ // level 9
			gravity: (new Point()).project( 270, 2.0 ),
			orb_probability: 0.07
		},
		{ // level 10
			gravity: (new Point()).project( 270, 2.25 ),
			orb_probability: 0.1
		},
		{ // level 11
			gravity: (new Point()).project( 270, 2.5 ),
			orb_probability: 0.15
		},
		{ // level 12
			gravity: (new Point()).project( 270, 3.0 ),
			orb_probability: 0.2
		},
		{ // level 13
			gravity: (new Point()).project( 270, 3.5 ),
			orb_probability: 0.3
		},
		{ // level 14
			gravity: (new Point()).project( 270, 4.0 ),
			orb_probability: 0.4
		},
		{ // level 15
			gravity: (new Point()).project( 270, 4.5 ),
			orb_probability: 0.45
		},
		{ // level 16 (kill screen)
			gravity: (new Point()).project( 270, 5.0 ),
			orb_probability: 0.5
		},
		{ // level 17 (just in case)
			gravity: (new Point()).project( 270, 6.0 ),
			orb_probability: 0.6
		},
		{ // level 18 (just in case)
			gravity: (new Point()).project( 270, 7.0 ),
			orb_probability: 0.7
		},
		{ // level 19 (just in case)
			gravity: (new Point()).project( 270, 8.0 ),
			orb_probability: 0.8
		},
		{ // level 20 (just in case)
			gravity: (new Point()).project( 270, 9.0 ),
			orb_probability: 0.9
		}
	],
	
	behaviors: {
		wind: {
			behavior: 'wind',
			wind_max_degrees: 40,
			msg: "ingamemessage_windy.png"
		},
		reverse: {
			behavior: 'reverse',
			msg: "ingamemessage_rewind.png"
		},
		magnetic: {
			behavior: 'magnetic',
			msg: 'ingamemessage_magnetic.png'
		},
		repulsion: {
			behavior: 'repulsion',
			msg: 'ingamemessage_repulsion.png'
		}
	},
	behavior_list: ['wind', 'reverse', 'magnetic', 'repulsion'],
	
	setup: function() {
		// set colors based on game theme
		if ($G.id.match(/chrome/)) {
			this.colors = this.chrome_colors;
			this.color_order = this.chrome_color_order;
			this.highlight_colors = this.chrome_highlight_colors;
		}
		else {
			this.colors = this.native_colors;
			this.color_order = this.native_color_order;
			this.highlight_colors = this.native_highlight_colors;
		}
		
		if (ua.mobile) {
			for (var idx = 1, len = this.levels.length; idx < len; idx++) {
				var level = this.levels[idx];
				level.orb_probability /= 2;
			}
		}
		
		this.bkgnd = $I.getImageSize( 'background_640px.png' );
		this.bkgndCenterOffset = (this.bkgnd.width / 2) - ($P.portWidth / 2);
		
		$P.setVirtualSize(640, 480);
		
		$P.setBackground({
			color: '#000000',
			url: 'background_640px.png',
			xMode: 'fit'
		});
		$P.setScroll( 0, 0 );
		$P.setBackgroundOffset( this.bkgndCenterOffset, 0 );
		
		this.bkgndColor = new Color('#000000');
		this.bkgndColorTarget = new Color('#000000');
		
		this.splane = new SpritePlane('sprites');
		this.splane.setZIndex( 5 );
		this.splane.setOffscreenDistance( 1.0 );
		$P.attach( this.splane );
		
		this.pplane = new SpritePlane('particles');
		this.pplane.setZIndex( 6 );
		this.pplane.setOffscreenDistance( 0.0 );
		$P.attach( this.pplane );
		
		this.hud = new SpritePlane('hud');
		this.hud.setScrollSpeed( 0 );
		this.hud.setZIndex( 7 );
		$P.attach( this.hud );
		
		this.ui = new SpritePlane('ui');
		this.ui.setScrollSpeed( 0 );
		this.ui.setZIndex( 10 );
		this.ui.setLogic( false );
		$P.attach( this.ui );
		
		this.ui.createSprite( StaticImageSprite, { url: 'frame-top.png', x:0, y:0 } );
		this.ui.createSprite( StaticImageSprite, { url: 'frame-left.png', x:0, y:60 } );
		this.ui.createSprite( StaticImageSprite, { url: 'frame-right.png', x:320-13, y:60 } );
		this.ui.createSprite( StaticImageSprite, { url: 'frame-bottom.png', x:13, y:400, zIndex: 8 } );
		
		this.smlogo = this.ui.createSprite( StaticImageSprite, { url: 'logo_small.png', x:160-40, y:4, zIndex: 13, visible: false } );
		this.smlogo_back = this.ui.createSprite( 'LogoTimerBack', { x: this.smlogo.x + 35, y: this.smlogo.y + 10, zIndex: 11, visible: false } );
		this.smlogo_timer = this.ui.createSprite( 'LogoTimer', { x: this.smlogo_back.x - 1, y: this.smlogo_back.y - 1, zIndex: 12, visible: false } );
	},
	
	reset: function() {
		// cleanup between title and game, or game and title
		if (this.ring) this.ring.destroy();
		delete this.ring;
		$G.clearSchedule();
		
		this.splane.deleteAll();
		this.pplane.deleteAll();
		this.hud.deleteAll();
		
		this.ui.findSprites({ type: 'TextLink' }).each( function(sprite) { sprite.destroy(); } );
	},
	
	titleSwitchNextColor: function() {
		// transition to desired color
		this.title_color_idx++;
		if (this.title_color_idx >= this.color_order.length) this.title_color_idx = 0;
		
		this.title_color = this.color_order[ this.title_color_idx ];
		
		this.bkgndColorTarget.set( this.colors[this.title_color] );
		
		for (var idx = 0; idx < 2; idx++) absorb.pplane.createSprite( 'OrbShockwave', {
			x: 80,
			y: 71,
			color: this.title_color,
			zIndex: 1,
			wave: '01',
			duration_a: 30,
			duration_b: 40
		} );
		
		var self = this;
		$G.scheduleEvent( 10, function() {
			absorb.splane.getSprite('title').setImage( 'logos_title_' + absorb.title_color + '.png' );
			
			for (var idx = 0; idx < 2; idx++) absorb.pplane.createSprite( 'OrbShockwave', {
				x: 80,
				y: 71,
				color: absorb.title_color,
				zIndex: 1,
				wave: '02',
				duration_a: 40,
				duration_b: 160
			} );
		} );
		
		$G.scheduleEvent( 60 * 10, function() { absorb.titleSwitchNextColor(); } );
	},
	
	titleScreen: function() {
		this.reset();
		this.smlogo.hide();
		this.smlogo_back.hide();
		this.smlogo_timer.hide();
		
		$P.setBackground({
			color: this.bkgndColor.css(),
			url: 'background_640px.png',
			xMode: 'fit'
		});
		$P.setScroll( 0, 0 );
		$P.setBackgroundOffset( this.bkgndCenterOffset, 0 );
		
		/* this.splane.createSprite( StaticImageSprite, {
			id: 'title_halo',
			url: 'ring_blue_absorb02.png',
			x: 80,
			y: 71,
			zIndex: 1
		} ); */
		this.splane.createSprite( StaticImageSprite, {
			id: 'title',
			url: 'logos_title_blue.png',
			x: 73,
			y: 113,
			zIndex: 2
		} );
		
		this.title_color_idx = -1;
		this.titleSwitchNextColor();
		
		var play_button = this.splane.createSprite( 'GameButton', {
			url: 'combo_button_play_curly.png',
			x: 18,
			y: 270,
			zIndex: 11,
			opacity: 0,
			onMouseUp: function() { absorb.startNewGame(); }
		} ).captureMouse();
		if (ua.ie) play_button.setOpacity(1.0);
		else play_button.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 60,
			delay: 0
		});
		
		var tutorial_button = this.splane.createSprite( 'GameButton', {
			url: 'combo_button_how-to-play.png',
			x: 18,
			y: play_button.y + play_button.height + 5,
			zIndex: 11,
			opacity: 0,
			onMouseUp: function() { absorb.beginTutorial(); }
		} ).captureMouse();
		if (ua.ie) tutorial_button.setOpacity(1.0);
		else tutorial_button.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 60,
			delay: 30
		});
		
		var design_button = this.splane.createSprite( 'GameButton', {
			url: 'combo_button_design-notes.png',
			x: 18,
			y: tutorial_button.y + tutorial_button.height + 5,
			zIndex: 11,
			opacity: 0,
			onMouseOver: function() {}
			// onMouseUp: function() { absorb.designNotes(); }
		} ).captureMouse();
		if (ua.ie) design_button.setOpacity(1.0);
		else design_button.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 0.5 } },
			duration: 60,
			delay: 60
		});
		
		this.state = 'title';
		
		this.bkgndColorTarget.set( this.colors[this.color_order[0]] );
		
		this.ui.createSprite( 'TextLink', {
			frameX: 3, // credits
			x: 10,
			y: 463,
			onMouseUp: function() { absorb.creditsScreen(); }
		} ).captureMouse();
		
		this.ui.createSprite( 'TextLink', {
			frameX: 2, // options
			x: 244,
			y: 463,
			opacity: 0.5,
			onMouseOver: function() {}
			// onMouseUp: function() { absorb.optionsScreen(); }
		} ).captureMouse();
		
		$P.showCursor();
		if (!$A.getTrack('music_title').isPlaying()) {
			$A.getTrack('music_title').rewind().setVolume(1).play();
		}
	},
	
	creditsScreen: function() {
		// show credits screen
		this.reset();
		$A.playSound('good_orb');
		
		this.smlogo.show();
		this.smlogo_back.show();
		this.smlogo_back.setColor('#000000');
		this.smlogo_timer.hide();
		
		$P.setBackground({
			color: '#000000',
			url: 'background_credits.png',
			xMode: 'fit'
		});
		$P.setScroll( 0, 0 );
		$P.setBackgroundOffset( 0, 0 );
		
		var text1 = this.hud.createSprite( StaticImageSprite, { url: 'credits_text_goldcartridge.png', x: 18, y: 85, opacity: 0 } );
		if (ua.ie) text1.setOpacity(1.0);
		else text1.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 60,
			delay: 0
		});
		
		var button1 = this.hud.createSprite( 'GameButton', {
			url: 'combo_button_goldcartridge.png',
			x: 18,
			y: 185,
			opacity: 0,
			onMouseUp: function() {
				window.open('http://www.goldcartridge.com/');
			}
		} ).captureMouse();
		if (ua.ie) button1.setOpacity(1.0);
		else button1.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 60,
			delay: 30
		});
		
		var button2 = this.hud.createSprite( 'GameButton', {
			url: 'combo_button_effectgames.png',
			x: 18,
			y: 255,
			opacity: 0,
			onMouseUp: function() {
				window.open('http://www.effectgames.com/');
			}
		} ).captureMouse();
		if (ua.ie) button2.setOpacity(1.0);
		else button2.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 60,
			delay: 60
		});
		
		var text2 = this.hud.createSprite( StaticImageSprite, { url: 'credits_text_effectgames.png', x: 18, y: 324, opacity: 0 } );
		if (ua.ie) text2.setOpacity(1.0);
		else text2.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 60,
			delay: 90
		});
		
		this.ui.createSprite( 'TextLink', {
			frameX: 5, // back
			x: 20,
			y: 35,
			onMouseUp: function() { $A.playSound('time_tick'); absorb.titleScreen(); }
		} ).captureMouse();
		
		this.ui.createSprite( 'TextLink', {
			frameX: 3, // credits
			x: 10,
			y: 463,
			opacity: 0.5,
			onMouseOver: function() {}
		} ).captureMouse();
		
		this.ui.createSprite( 'TextLink', {
			frameX: 2, // options
			x: 244,
			y: 463,
			opacity: 0.5,
			onMouseOver: function() {}
			// onMouseUp: function() { absorb.optionsScreen(); }
		} ).captureMouse();
		
		$P.showCursor();
	},
	
	optionsScreen: function() {
		
	},
	
	designNotes: function() {
		
	},
	
	beginTutorial: function() {
		this.startNewGame('tutorial');
		this.orb_probability = 0;
		
		$G.scheduleEvent( 60 * 1, function() { absorb.showMessage('01.png', 5 * 60); } );
		$G.scheduleEvent( 60 * 6, function() { absorb.showMessage(ua.mobile ? '02b.png' : '02a.png', 5 * 60); } );

		$G.scheduleEvent( 60 * 12, function() {
			absorb.showMessage('03.png', 5 * 60); 
			absorb.splane.createSprite( 'Orb', {
				id: 'tut_orb_1',
				x: absorb.ring.centerPointX() - 30,
				y: -30,
				color: absorb.color_order[0],
				behavior: 'standard',
				screenLoop: true,
				dieOffscreen: false,
				onPop: function() {
					absorb.showMessage('04.png', 5 * 60);
					$G.scheduleEvent( 60 * (6 * 1), function() { absorb.showMessage('05.png', 5 * 60); } );
					$G.scheduleEvent( 60 * (6 * 2), function() {
						absorb.tutorialPhase2();
					} );
				} // popped blue orb
			}); // create blue orb
		} );
	},
	
	tutorialPhase2: function() {
		this.msg_cookie = {};
		absorb.showMessage( ua.mobile ? "ingamemessage_01-handheld.png" : "ingamemessage_01-desktop.png", 5 * 60);
		
		// unlock red ring color
		absorb.orb_color_max = 2;
		
		$G.scheduleEvent( 60 * (6 * 1), function() {
			absorb.showMessage('07.png', 5 * 60);
			absorb.splane.createSprite( 'Orb', {
				id: 'tut_orb_2',
				x: absorb.ring.centerPointX() - 30,
				y: -30,
				color: absorb.color_order[1],
				behavior: 'standard',
				screenLoop: true,
				dieOffscreen: false,
				onBadPop: function() {
					absorb.tutorialPhase2();
				},
				onPop: function() {
					absorb.showMessage('08.png', 5 * 60);
					$G.scheduleEvent( 60 * (6 * 1), function() { absorb.showMessage('09.png', 5 * 60); } );
					$G.scheduleEvent( 60 * (6 * 2), function() { absorb.showMessage('10.png', 5 * 60); } );
					$G.scheduleEvent( 60 * (6 * 3), function() {
						absorb.showMessage('11.png', 5 * 60); 
						absorb.splane.createSprite( 'OrbDark', {
							id: 'tut_orb_3',
							x: absorb.ring.centerPointX() - 30,
							y: -30,
							behavior: 'standard',
							screenLoop: true,
							dieOffscreen: false
						} );
					} );
				} // popped red orb
			} ); // create red orb
		} );
	},
	
	showMessage: function(msg, hang_time) {
		if (this.msg_cookie[msg]) return;
		if (!hang_time) hang_time = 5 * 60;
		this.hud.createSprite( 'InGameMessage', {
			url: msg,
			hang_time: hang_time
		});
		this.msg_cookie[msg] = 1;
	},
	
	loadLevel: function(idx) {
		Debug.trace("Loading level: " + idx);
		this.level_idx = idx;
		this.level = this.levels[ this.level_idx ];
		Debug.trace( "Level props: " + dumper(this.level) );
		
		this.msg = '';
		for (var key in this.level) {
			this[key] = this.level[key];
		}
		this.gravity = this.level.gravity.clone();
		
		if (!this.level.behavior || this.want_behavior) {
			if (this.want_behavior || probably(0.75)) {
				// special level behavior
				this.behavior = this.want_behavior ? this.want_behavior : rand_array( this.behavior_list );
				Debug.trace("Activating special behavior: " + this.behavior + ": " + dumper(this.behaviors[this.behavior]));
				for (var key in this.behaviors[this.behavior]) {
					this[key] = this.behaviors[this.behavior][key];
				}
				switch (this.behavior) {
					case 'reverse':
						this.gravity.y = 0 - this.gravity.y;
						break;
				}
			}
			else {
				this.behavior = 'standard';
			}
			delete this.want_behavior;
		}
		
		if (this.msg) {
			this.showMessage( this.msg );
		}
		this.msg = '';
		
		this.gravity_mod.set( 1.0, 1.0 );
		this.orb_probability_mod = 1.0;
		
		Debug.trace("Gravity: " + dumper(this.gravity));
	},
	
	startNewGame: function(target_state) {
		this.reset();
		
		$A.playSound('start_game');
		$A.getTrack('music_title').fadeOut(60);
		
		this.startClock = $G.logicClock;
		this.elapsed = 0;
		this.score = 0;
		this.lives = 5;
		
		this.orbs = {};
		for (var key in this.colors) {
			this.orbs[key] = 0;
		}
		
		this.msg_cookie = {};
		
		this.loadLevel(1);
		
		this.score_per_orb = 10;
		this.next_level_at = 70;
		this.next_level_gap = 150;
		this.next_level_gap_inc = 70;
		
		$P.setBackground({
			color: this.colors[this.title_color],
			url: 'background_640px.png',
			xMode: 'fit'
		});
		$P.setScroll( 160, 0 );
		$P.setBackgroundOffset( 0, 0 );
		this.bkgndColor.set( this.colors[this.title_color] );
		this.bkgndColorTarget.set( '#000000' );
		
		this.lightPt = new Point(320, 480);
		
		this.state = target_state ? target_state : 'game';
		if (this.state == 'tutorial') this.lives = 1;
		
		this.ring = this.splane.createSprite( 'Ring', {
			x: 320 - 80, y: 400 - 80,
			zIndex: this.splane.zIndex + 1
		} );
		
		this.smlogo.show();
		this.smlogo_back.show();
		this.smlogo_back.setColor('#000000');
		this.smlogo_timer.hide();
		
		this.hud.createSprite( StaticImageSprite, { id: 'left_brace', url: 'curlybraces_left.png', x:-1000, y:395, zIndex: 9  } );
		this.hud.createSprite( StaticImageSprite, { id: 'right_brace', url: 'curlybraces_right.png', x:-1000, y:395, zIndex: 9  } );
		
		this.score_hud = new TextSprite('score_hud');
		this.score_hud.setFont( 'OCRBStdBold18' );
		this.score_hud.setTableSize( 8, 1 );
		this.score_hud.setTracking( 0.6, 1.0 );
		this.score_hud.x = 218;
		this.score_hud.y = 430;
		this.score_hud.zIndex = 9;
		this.score_hud.score = -1;
		this.hud.attach( this.score_hud );
		
		this.time_hud = new TextSprite('time_hud');
		this.time_hud.setFont( 'OCRBStdBold18' );
		this.time_hud.setTableSize( 6, 1 );
		this.time_hud.setTracking( 0.6, 1.0 );
		this.time_hud.x = 22;
		this.time_hud.y = 430;
		this.time_hud.zIndex = 9;
		this.time_hud.elapsed = -1;
		this.hud.attach( this.time_hud );
		
		this.life_orbs = [];
		this.dirty_display = true;
		this.update_hud();
		
		this.ui.createSprite( 'TextLink', {
			frameX: 0, // exit
			x: 20,
			y: 35,
			onMouseUp: function() { absorb.exitGame(); }
		} ).captureMouse();
		
		this.ui.createSprite( 'TextLink', {
			frameX: 1, // pause
			x: 234,
			y: 35,
			onMouseUp: function() { $G.pause(); }
		} ).captureMouse();
		
		$P.hideCursor();
		if (this.state == 'game') $A.getTrack('music_level').rewind().play();
	},
	
	exitGame: function() {
		switch (this.state) {
			case 'game': this.gameOver(); break;
			case 'tutorial': this.titleScreen(); break;
			case 'death': this.titleScreen(); break;
		}
	},
	
	update_hud: function(force) {
		// update heads-up displays
		if (!this.bonus_enabled || (this.bonus_type != 'wildcard')) {
			if ((this.life_orbs.length != this.lives) || force) {
				while (this.lives > this.life_orbs.length) {
					this.life_orbs.push( this.hud.createSprite( 'LifeOrb', { x: -50, y: 387, zIndex: 9, color: this.ring.color } ) );
				}
				while (this.lives < this.life_orbs.length) {
					this.life_orbs.pop().destroy();
				}
			
				this.hud.getSprite('left_brace').x = 6 - (this.life_orbs.length * 10);
				this.hud.getSprite('right_brace').x = 154 + (this.life_orbs.length * 10);
				var xstart = 144 - (this.life_orbs.length * 10);
				var zstart = 9;
			
				for (var idx = 0, len = this.life_orbs.length; idx < len; idx++) {
					var orb = this.life_orbs[idx];
					orb.x = xstart + (idx * 20);
					if (idx < len / 2) {
						orb.setZIndex( zstart + idx );
					}
					else {
						orb.setZIndex( zstart + ((len - 1) - idx) );
					}
				}
			
				if (!this.life_orbs.length) {
					this.hud.getSprite('left_brace').hide();
					this.hud.getSprite('right_brace').hide();
				}
			}
		}
		
		if ((this.score != this.score_hud.score) || force) {
			var txt = '' + this.score;
			while (txt.length < 8) txt = ' ' + txt;
			this.score_hud.setString( 0, 0, txt );
			this.score_hud.score = this.score;
		}
		
		this.dirty_display = false;
	},
	
	nextLevel: function() {
		// next level!  yay!
		this.loadLevel( this.level_idx + 1 );
		
		var sprites = this.splane.findSprites({ category: 'orb' });
		for (var idx = 0, len = sprites.length; idx < len; idx++) {
			var sprite = sprites[idx];
			sprite.behavior = this.behavior;
		}
		
		// mobile on-screen controls
		if (ua.mobile) {
			this.hud.findSprites({ type: 'MobileColorSwitch' }).each( function(sprite) {
				sprite.destroy();
			} );
			
			var startx = (320 / 2) - ((this.orb_color_max * 66) / 2);
			for (var idx = 0, len = this.orb_color_max; idx < len; idx++) {
				this.hud.createSprite( 'MobileColorSwitch', {
					color: this.color_order[idx], 
					x: startx + (idx * 66), 
					y: 331, 
					zIndex: 20, 
					frameX: (this.ring.color == this.color_order[idx]) ? 1 : 0
				} );
			}
		}
		
		// play happy sound
		$A.playSound('level_up');
		
		// give joy (white bkgnd flash)
		this.bkgndColor.set( '#FFFFFF' );
		
		// next level is harder to get to!
		this.next_level_at += this.next_level_gap;
		this.next_level_gap += this.next_level_gap_inc;
	},
	
	clockBonus: function(fast) {
		// hit clock orb, begin timed slowdown
		Debug.trace("clock bonus begin");
		this.bonus_enabled = true;
		this.bonus_type = 'clock';
		
		if (fast) {
			this.gravity_mod.set( 1.0, 2.0 );
			this.orb_probability_mod = 2.0;
		}
		else {
			this.gravity_mod.set( 1.0, 0.25 );
			this.orb_probability_mod = 0.25;
		}
		
		this.smlogo_timer.show();
		this.smlogo_timer.setFrameX( 0 );
		this.smlogo_timer.timerStart = $G.logicClock;
		this.smlogo_timer.timerDuration = 480;
		
		// give joy (white bkgnd flash)
		this.bkgndColor.set( '#FFFFFF' );
		
		$A.playSound('time_bonus');
		$A.getTrack('music_level').fadeOut(20);
		
		$G.scheduleEvent( 120, function() { $A.playSound('time_tick'); } );
		$G.scheduleEvent( 240, function() { $A.playSound('time_tick'); } );
		$G.scheduleEvent( 360, function() { $A.playSound('time_tick'); } );
		
		$G.scheduleEvent( 480, function() {
			Debug.trace("clock bonus end");
			absorb.bonus_enabled = false;
			absorb.gravity_mod.set( 1.0, 1.0 );
			absorb.orb_probability_mod = 1.0;
			absorb.smlogo_timer.hide();
			$A.playSound('bonus_end');
			$A.getTrack('music_level').fadeIn(30);
		} );
	},
	
	wildcardBonus: function() {
		// hit wildcard orb, grab any color!
		Debug.trace("wildcard bonus begin");
		this.bonus_enabled = true;
		this.bonus_type = 'wildcard';
		
		this.ring.beginWildcard();
		
		this.smlogo_timer.show();
		this.smlogo_timer.setFrameX( 0 );
		this.smlogo_timer.timerStart = $G.logicClock;
		this.smlogo_timer.timerDuration = 480;
		
		// special HUD life display for this bonus
		this.loi = this.hud.createSprite( 'LifeOrbInfinite', { x: 160 - 42, y: 387, zIndex: 9, wildcard: true } );
		this.hud.getSprite('left_brace').x = 6 - (3 * 10);
		this.hud.getSprite('right_brace').x = 154 + (3 * 10);
		for (var idx = 0, len = this.life_orbs.length; idx < len; idx++) {
			this.life_orbs[idx].hide();
		}
		
		$A.playSound('wildcard_bonus');
		$A.getTrack('music_level').fadeOut(20);
		
		// this.bkgndColorTarget.set( '#FFFFFF' );
		
		$G.scheduleEvent( 120, function() { 
			// absorb.bkgndColorTarget.set( absorb.colors[ absorb.color_order[1] ] );
			$A.playSound('wildcard_tick'); 
		} );
		$G.scheduleEvent( 240, function() { 
			// absorb.bkgndColorTarget.set( absorb.colors[ absorb.color_order[2] ] );
			$A.playSound('wildcard_tick'); 
		} );
		$G.scheduleEvent( 360, function() { 
			// absorb.bkgndColorTarget.set( absorb.colors[ absorb.color_order[3] ] );
			$A.playSound('wildcard_tick'); 
		} );
		
		$G.scheduleEvent( 480, function() {
			Debug.trace("wildcard bonus end");
			absorb.bonus_enabled = false;
			absorb.smlogo_timer.hide();
			absorb.ring.endWildcard();
			// absorb.bkgndColorTarget.set( absorb.colors[absorb.ring.color] );
			
			absorb.loi.destroy();
			delete absorb.loi;
			for (var idx = 0, len = absorb.life_orbs.length; idx < len; idx++) {
				absorb.life_orbs[idx].show();
			}
			absorb.update_hud('force');
			
			absorb.bkgndColor.set( '#000000' );
			
			$A.playSound('bonus_end');
			$A.getTrack('music_level').fadeIn(30);
		} );
	},
	
	gameOver: function() {
		// all lives lost
		$G.clearSchedule();
		
		absorb.bonus_enabled = false;
		absorb.gravity_mod.set( 1.0, 1.0 );
		absorb.orb_probability_mod = 1.0;
		absorb.smlogo_timer.hide();
		
		var tutorial = (this.state == 'tutorial');
		this.state = 'death';
		$A.quiet();
		$A.playSound('game_over');
		
		this.ring.pop();
		delete this.ring;
		
		this.update_hud();
		
		if (ua.mobile) {
			absorb.hud.findSprites({ type: 'MobileColorSwitch' }).each( function(sprite) {
				sprite.destroy();
			} );
		}
				
		this.bkgndColorTarget.set( '#000000' );
		this.bkgndColor.set( '#000000' );
		$P.background.color = $P.div.style.backgroundColor = absorb.bkgndColor.css();
		
		this.smlogo_back.setColor( '#000000' );
		
		this.gravity.set( 0, 0 );
		
		if (tutorial) $G.scheduleEvent( 60 * 3, function() { absorb.titleScreen(); } );
		else $G.scheduleEvent( 60 * 3, function() { absorb.gameOverDisplay(); } );
	},
	
	gameOverDisplay: function() {
		$A.playSound( 'high_score' );
		$P.showCursor();
		
		var overlay = this.hud.createSprite( StaticImageSprite, { url: 'gameover-lay.png', zIndex: 7, opacity: 0 } );
		if (ua.ie) overlay.setOpacity(1.0);
		else overlay.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 120,
			delay: 60
		});
		
		var text = this.hud.createSprite( StaticImageSprite, { url: 'gameover-text.png', x:45, y:120, zIndex: 10, opacity: 0 } );
		if (ua.ie) text.setOpacity(1.0);
		else text.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 90,
			delay: 0
		});
		
		var stats_hud = new TextSprite('stats_hud');
		stats_hud.setFont( 'HelvBold14' );
		stats_hud.setTableSize( 5, 6 );
		stats_hud.setTracking( 0.65, 1.35 );
		stats_hud.x = 115;
		stats_hud.y = 150;
		stats_hud.zIndex = 10;
		stats_hud.visible = false;
		stats_hud.opacity = 1.0;
		this.hud.attach( stats_hud );
		
		for (var idx = 0, len = this.color_order.length; idx < len; idx++) {
			var color = this.color_order[idx];
			var value = '' + this.orbs[color];
			while (value.length < 4) value = ' ' + value;
			stats_hud.setString( 0, idx, value );
		}
		
		if (ua.ie) {
			stats_hud.setOpacity(1.0);
			stats_hud.show();
		}
		else {
			stats_hud.visible = true;
			stats_hud.tween({
				mode: 'EaseInOut',
				algorithm: 'Quadratic',
				properties: { opacity: { start: 0, end: 1.0 } },
				duration: 90,
				delay: 60
			});
		}
		
		var tweet_button = this.hud.createSprite( 'GameButton', {
			url: 'combo_button_twitter_sm.png',
			x: 18,
			y: 250,
			zIndex: 11,
			opacity: 0,
			onMouseUp: function() {
				var nice_time = '';
				if (absorb.elapsed >= 60) {
					var min = Math.floor(absorb.elapsed / 60);
					nice_time += '' + min + ' minute';
					if (min > 1) nice_time += 's';
				}
				var sec = absorb.elapsed % 60;
				if (sec > 0) {
					if (nice_time) nice_time += ' ';
					nice_time += '' + sec + ' second';
					if (sec > 1) nice_time += 's';
				}
				var tweet = "I scored " + absorb.score + " in " + nice_time + " in absOrb. " + location.href;
				window.open('http://twitter.com/home?status=' + encodeURIComponent(tweet));
			}
		} ).captureMouse();
		if (ua.ie) tweet_button.setOpacity(1.0);
		else tweet_button.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 90,
			delay: 120
		});
		
		var fb_button = this.hud.createSprite( 'GameButton', {
			url: 'combo_button_facebook_sm.png',
			x: 18,
			y: 250 + 40,
			zIndex: 11,
			opacity: 0,
			onMouseUp: function() {
				window.open(
					'http://www.facebook.com/sharer.php?u='+encodeURIComponent(location.href)+'&t='+encodeURIComponent('absOrb'),
					'sharer','toolbar=0,status=0,width=626,height=436'
				);
			}
		} ).captureMouse();
		if (ua.ie) fb_button.setOpacity(1.0);
		else fb_button.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 90,
			delay: 160
		});
		
		var retry_button = this.hud.createSprite( 'GameButton', {
			url: 'combo_button_play-again_sm.png',
			x: 18,
			y: 250 + 80,
			zIndex: 11,
			opacity: 0,
			onMouseUp: function() {
				absorb.startNewGame();
			}
		} ).captureMouse();
		if (ua.ie) retry_button.setOpacity(1.0);
		else retry_button.tween({
			mode: 'EaseInOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 0, end: 1.0 } },
			duration: 90,
			delay: 200
		});
	},
	
	freePoint: function(pt) {
		// check for orb collisions on point
		var sprites = this.splane.findSprites({ category: 'orb' });
		
		for (var idx = 0, len = sprites.length; idx < len; idx++) {
			var sprite = sprites[idx];
			var dist = pt.getDistance( sprite.centerPoint() );
			
			if (dist < 35) {
				return false;
			} // collision
		} // foreach sprite
		
		return true;
	},
	
	gameLogic: function() {
		if (probably( this.orb_probability * this.orb_probability_mod )) {
			// locate random area free of other orbs
			// this way orbs don't appear on top of each other
			var ystart = -30;
			switch (this.behavior) {
				case 'wind':
					// vary gravity to simulate wind
					var sine = Math.sin( DECIMAL_TO_RADIANS( $G.logicClock % 360 ) );
					var angle = 270 + (sine * this.wind_max_degrees);
					this.gravity.set(0,0).project( angle, this.level.gravity.y );
					break;
					
				case 'reverse':
					// spawn from bottom
					ystart = 510;
					break;
			}
			
			var pt;
			var done = false;
			var good = false;
			var count = 0;
			while (!done) {
				if (ua.mobile) pt = new Point( $P.scrollX + 30 + Math.floor( Math.random() * (320 - 60) ), ystart );
				else pt = new Point( 30 + Math.floor( Math.random() * (640 - 60) ), ystart );
				
				if (this.freePoint(pt)) { done = true; good = true; }
				count++;
				if (count > 10) { done = true; good = false; }
			}
			
			if (good) {
				var orb_type = 'Orb';
				if (this.want_orb) {
					orb_type = this.want_orb;
					delete this.want_orb;
				}
				else if ((this.level_idx >= 2) && probably(0.01) && !this.bonus_enabled) {
					orb_type = probably(0.5) ? 'OrbClockFast' : 'OrbClock';
				}
				else if ((this.level_idx >= 2) && probably(0.01)) orb_type = 'OrbExtraLife';
				else if ((this.level_idx >= 3) && probably(0.02)) orb_type = 'OrbDark';
				else if ((this.level_idx >= 3) && probably(0.015) && !this.bonus_enabled) orb_type = 'OrbWildcard';
			
				// spawn an orb
				this.splane.createSprite( orb_type, {
					x: pt.x - 30,
					y: pt.y - 30,
					color: rand_array(this.color_order, 0, this.orb_color_max),
					behavior: this.behavior
				});
			}
		}
		
		if (this.ring) {
			this.elapsed = Math.floor( ($G.logicClock - this.startClock) / $G.getTargetFPS() );
			if (this.elapsed != this.time_hud.elapsed) {
				var min = Math.floor( this.elapsed / 60 );
				var sec = this.elapsed % 60;
				if (sec < 10) sec = '0' + sec;
				this.time_hud.setString( 0, 0, '' + min + ':' + sec );
				this.time_hud.elapsed = this.elapsed;
			}
		}
		
		if (this.dirty_display) this.update_hud();
	},
	
	resumeMusic: function() {
		// resume music after a pause, or if music was re-enabled by the toolbar
		switch (absorb.state) {
			case 'game':
				$P.hideCursor();
				if (!this.bonus_enabled) $A.getTrack('music_level').fadeIn(60);
				break;
			
			case 'tutorial':
				$P.hideCursor();
				break;
			
			case 'title':
				$A.getTrack('music_title').fadeIn(60);
				break;
		}
	}
	
};

$G.addEventListener( 'loadgame', function() {
	absorb.setup();
	
	// $G.SmN = 4;
	
	$G.setKeyHandler( 'start', {
		onKeyDown: function() { $G.pause(); }
	} );
	$G.setResumeKey( 'start' );
	
	$G.setKeyHandler( 'exit', {
		onKeyDown: function() { absorb.exitGame(); }
	} );
	
	$G.addEventListener( 'pause', function() {
		$P.showCursor();
		$A.quiet();
		$A.playSound('pause');
	} );
	
	$G.addEventListener( 'resume', function() {
		$A.playSound('pause');
		absorb.resumeMusic();
	} );
	
	$G.addEventListener( 'enablemusic', function() {
		absorb.resumeMusic();
	} );
	
	$G.addEventListener( 'logic', function() {
		if ((absorb.state == 'game') || (absorb.state == 'tutorial')) absorb.gameLogic();
		
		if (!absorb.bkgndColor.isNearEqualTo(absorb.bkgndColorTarget)) {
			// fade background color towards target color
			absorb.bkgndColor.fadeTo( absorb.bkgndColorTarget, ua.mobile ? 0.5 : 0.02 );
			$P.background.color = $P.div.style.backgroundColor = absorb.bkgndColor.css();
		}
	} );
	
	$G.addEventListener( 'keydown', function(name, code, e) {
		switch (code) {
			case 67: absorb.want_orb = probably(0.5) ? 'OrbClockFast' : 'OrbClock'; break; // C
			case 68: absorb.want_orb = 'OrbDark'; break; // D
			case 69: absorb.want_orb = 'OrbExtraLife'; break; // E
			case 87: absorb.want_orb = 'OrbWildcard'; break; // W
			
			case 55: absorb.want_behavior = 'wind'; absorb.nextLevel(); break; // 7
			case 56: absorb.want_behavior = 'reverse'; absorb.nextLevel(); break; // 8
			case 57: absorb.want_behavior = 'magnetic'; absorb.nextLevel(); break; // 9
			case 48: absorb.want_behavior = 'repulsion'; absorb.nextLevel(); break; // 0
		}
	} );
	
	absorb.titleScreen();
} );


function RADIANS_TO_DECIMAL(_rad) { return _rad * 180.0 / Math.PI; }
function DECIMAL_TO_RADIANS(_dec) { return _dec * Math.PI / 180.0; }

function rand_array(arr, min, max) {
	// return random element from array
	if (!min) min = 0;
	if (!max) max = arr.length;
	return arr[ min + Math.floor(Math.random() * (max - min)) ];
}

function count_keys(hash) {
	var count = 0;
	for (var key in hash) count++;
	return count;
}

function find_idx_in_array(arr, elem) {
	// return idx of elem in arr, or -1 if not found
	for (var idx = 0, len = arr.length; idx < len; idx++) {
		if (arr[idx] == elem) return idx;
	}
	return -1;
}

