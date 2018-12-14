// Fortris 1.0
// Copyright (c) 2011 GoldCartridge.com

// The 'Projectile' sprite are the multi-color incoming missiles which destroy your fortris.
// These only work at 90 degree increments, and can come from any side of the screen inward.
// They are made up of three layers (inner-divs); a shadow layer, a midtones layer, and a highlight layer
// All the "color" is created using CSS background-color and CSS masks (webkit only)
// Even though the images are 120x60, the sprite is 120x120 because it is rotated (this makes it much easier to deal with)
// The images are centered in the 120x120 div box.

// Projectiles have two states:
// 'standard': Flying inward.
// 'death': The death animation when we strike a block.

Sprite.extend( 'Projectile', {
	
	width: 120,
	height: 120,
	dieOffscreen: true,
	opacity: 0,
	
	xd: 0,
	yd: 0,
	state: '',
	shadowColors: ['#000088', '#004400', '#444400', '#440000'],
	midtoneColors: ['#46c0fa', 'rgb(34,163,44)', 'rgb(255,216,16)', 'rgb(248,0,0)'],
	
	init: function() {
		// initialize sprite
		if (!this.id) this.id = get_unique_id();
		
		// To accelerate things, we only update the CSS background colors every 4 frames
		// and each projectile randomizes which of the 4 frames it updates on.
		this.frameMod = Math.floor( Math.random() * 4 );
		
		// setup colors and state
		this.shadowColor = new Color( this.shadowColors[0] );
		this.midtoneColor = new Color( this.midtoneColors[0] );
		this.state = 'standard';
		
		// create our inner DIVs using HTML
		this.html = '<div id="'+this.id+'_shadows" class="projectile shadows" style="background-color:'+this.shadowColor.css()+';"></div>' + 
			'<div id="'+this.id+'_midtones" class="projectile midtones" style="background-color:'+this.midtoneColor.css()+';"></div>' + 
			'<div id="'+this.id+'_highlights" class="projectile highlights"></div>';
		
		Sprite.prototype.init.call(this);
		
		// this.style.display = 'none';
	},
	
	logic: function() {
		// move projectile
		this.x += this.xd;
		this.y += this.yd;
		
		// invoke function based on state
		if (this.state == 'standard') this.logic_standard();
		else if (this.state == 'death') this.logic_death();
	},
	
	logic_standard: function() {
		// check for collision
		var eyeDist = 20;
		var cx = 0, cy = 0;
		
		// based on our current rotation, calculate the position of the "eye"
		// for collision hit testing
		switch (this.rotate) {
			case 0:
				// 12 o'clock
				cx = this.centerPointX();
				cy = this.y + eyeDist;
			break;
			
			case 90:
				// 3 o'clock
				cx = this.x + this.width - eyeDist;
				cy = this.centerPointY();
			break;
			
			case 180:
				// 6 o'clock
				cx = this.centerPointX();
				cy = this.y + this.height - eyeDist;
			break;
			
			case 270:
				// 9 o'clock
				cx = this.x + eyeDist;
				cy = this.centerPointY();
			break;
		}
		
		// see if we hit anything
		var hit = Fortris.playfield.lookupTileFromGlobal( cx, cy );
		if ((hit == 1) || (hit == 3)) {
			// We hit a block, or one of the fortris walls
			// Debug.trace("Projectile hit: " + hit);
			if (hit == 1) {
				// we hit a block
				Fortris.playfield.setTileFromGlobal( cx, cy, 0 );
				
				// throw out tile debris
				for (var idx = 0; idx < 8; idx++) {
					Fortris.splane.createSprite( Debris, {
						x: cx - (cx % 20),
						y: cy - (cy % 20),
						frameX: Math.floor( Math.random() * 8 ),
						rotate: Math.random() * 360,
						rotateSpeed: (Math.random() * 10) - 5,
						scale: 0.75 + (Math.random() * 0.25),
						angle: (0 - this.rotate) + (Math.random() * 180),
						speed: 1 + (Math.random() * 2),
						opacity: 1.0,
						counter: 25
					} );
				}
			}
			else {
				// we hit the fortris, game over or lose a life
				// Future Development: Player should die or lose a life here
			}
			
			// whether we hit a block or the fortris, explode the projectile
			this.explode(cx, cy);
			return;
		}
		
		// fade colors based on distance
		if (Game.logicClock % 4 == this.frameMod) {
			// calculate our color based on distance from fortris center
			if (!this.homeCenterPt) this.homeCenterPt = new Point( Port.width / 2, Port.height / 2 );
			var dist = this.homeCenterPt.getDistance( cx, cy );
			dist -= 100;
			if (dist < 0) dist = 0;
			if (dist > 260) dist = 260;
			dist = 260 - dist;
			dist *= (3 / 260);
		
			// if (Game.logicClock % 8 == 0) Debug.trace("Projectile dist: " + dist);
		
			var fromColorIdx = Math.floor( dist );
			var toColorIdx = fromColorIdx + 1; if (toColorIdx > 3) toColorIdx = 3;
			var fadeAmount = dist - fromColorIdx;
		
			if (!this.shadowStyle) {
				var div = $(this.id + '_shadows');
				if (div) this.shadowStyle = div.style;
			}
			if (this.shadowStyle) {
				this.shadowColor.set( this.shadowColors[fromColorIdx] ).fadeTo( this.shadowColors[toColorIdx], fadeAmount );
				this.shadowStyle.backgroundColor = this.shadowColor.css();
			}
		
			if (!this.midtoneStyle) {
				var div = $(this.id + '_midtones');
				if (div) this.midtoneStyle = div.style;
			}
			if (this.midtoneStyle) {
				this.midtoneColor.set( this.midtoneColors[fromColorIdx] ).fadeTo( this.midtoneColors[toColorIdx], fadeAmount );
				this.midtoneStyle.backgroundColor = this.midtoneColor.css();
			}
			
			// fog of war
			this.opacity = Fortris.getFogOfWar( this.centerPoint() );
			
		} // every N frames
		
		// throw out particles constantly
		// these are the tail behind the projectile
		if ((Game.logicClock % 2 == 0) && (Fortris.pplane.numSprites < 200)) {
			Fortris.pplane.createSprite( Particle, {
				x: cx + ((Math.random() * 20) - 10),
				y: cy + ((Math.random() * 20) - 10),
				angle: (360 - this.rotate) + 270 + ((Math.random() * 30) - 15),
				speed: this.speed,
				color: this.midtoneColor.clone().fadeTo('#fff', Math.random() * 0.50).css(),
				state: 0
			} );
		}
		
		// update alert nib
	},
	
	explode: function(cx, cy) {
		// we hit something, explode
		this.state = 'death';
		this.xd *= 0.5;
		this.yd *= 0.5;
		
		// create an explosion "Plume" effect
		Fortris.splane.createSprite( Plume, {
			x: cx - 30,
			y: cy - 30
		} );
		
		if (!this.highlightStyle) {
			var div = $(this.id + '_highlights');
			if (div) this.highlightStyle = div.style;
		}
		
		// Tween fade our various layers in different ways
		if (this.highlightStyle) {
			TweenManager.add({
				target: this.highlightStyle,
				mode: 'EaseInOut',
				algorithm: 'Quadratic',
				properties: { opacity: { start: 1, end: 0 } },
				duration: 20,
				delay: 0
			});
		}
		
		if (this.midtoneStyle) {
			this.midtoneStyle.backgroundColor = '#fff';
			TweenManager.add({
				target: this.midtoneStyle,
				mode: 'EaseInOut',
				algorithm: 'Quadratic',
				properties: { opacity: { start: 0.5, end: 0 } },
				duration: 35,
				delay: 10
			});
		}
		
		if (this.shadowStyle) {
			this.shadowStyle.backgroundColor = '#fff';
			TweenManager.add({
				sprite: this,
				target: this.shadowStyle,
				mode: 'EaseInOut',
				algorithm: 'Quadratic',
				properties: { opacity: { start: 0.5, end: 0 } },
				duration: 45,
				delay: 20,
				onTweenComplete: function() {
					this.sprite.destroy();
				}
			});
		}
		
		// and throw out some white particles to add to the explosion effect
		if (Fortris.pplane.numSprites < 325) {
			for (var idx = 0; idx < 50; idx++) {
				Fortris.pplane.createSprite( Particle, {
					x: cx + ((Math.random() * 20) - 10),
					y: cy + ((Math.random() * 20) - 10),
					angle: Math.random() * 360,
					speed: 1.5,
					color: '#fff',
					state: 1
				} );
			}
		}
	},
	
	logic_death: function() {
		// at this point we already hit something and are fading out
		// slow down projectile (ease out)
		this.xd *= 0.95;
		this.yd *= 0.95;
	},
	
	destroy: function() {
		// bye bye projectile		
		Sprite.prototype.destroy.call(this);
	}
	
} );
