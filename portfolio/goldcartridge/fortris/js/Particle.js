// Fortris 1.0
// Copyright (c) 2011 GoldCartridge.com

// This class represents a 1x1 particle, which is simply a DIV with a background color (no image)
// These are thrown out by projectiles and used for block explosions as well.
// Animation is controlled by 'angle' and 'speed' properties.

// There are three 'states' for the projectile:
// 0: Initial state: starts out invisible and fades in, while still moving.  When faded in completely, sets state to 1.
// 1: Standard state: moves in set direction and speed, counts down.  When counter hits zero, sets state to 2.
// 2: Ending state: speed slows down and opacity fades out.  When opacity hits zero, particle dies.

Sprite.extend( 'Particle', {
	
	width: 1,
	height: 1,
	opacity: 0,
	baseClass: 'particle',
	
	angle: 0,
	speed: 0,
	localOpacity: 0,
	
	init: function() {
		// setup opacity and counter based on initial state
		switch (this.state) {
			case 0: this.localOpacity = 0; break;
			case 1: this.localOpacity = 1.0; this.counter = 20; break;
			case 2: this.localOpacity = 1.0; break;
		}
		
		Sprite.prototype.init.call(this);
		
		this.pt = new Point( this.x, this.y );
	},
	
	logic: function() {
		// project (move) our 2D point by our angle and speed
		// then update our x and y props which actually position the sprite onscreen
		this.pt.project( this.angle, this.speed );
		this.x = this.pt.x;
		this.y = this.pt.y;
		
		// kill particle if it happens to fall offscreen on any side
		if ((this.x < 0) || (this.x >= Port.width) || (this.y < 0) || (this.y >= Port.height)) {
			this.destroy();
			return;
		}
		
		// behavior differs based on state
		switch (this.state) {
			case 0:
				// fade in
				this.localOpacity += 0.1;
				if (this.localOpacity >= 1.0) { this.localOpacity = 1.0; this.state = 1; this.counter = 50; }
			break;
			
			case 1:
				// move and count down
				this.counter--;
				if (!this.counter) { this.state = 2; }
			break;
			
			case 2:
				// fade out and slow down
				this.speed *= 0.98;
				this.localOpacity -= 0.02;
				if (this.localOpacity < 0.1) { this.destroy(); }
			break;
		}
		
		// calculate opacity and fog of war
		this.opacity = this.localOpacity * Fortris.getFogOfWar(this.pt);
	}
	
} );
