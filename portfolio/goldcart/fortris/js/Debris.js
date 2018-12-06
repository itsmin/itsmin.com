// Fortris 1.0
// Copyright (c) 2011 GoldCartridge.com

// This sprite represents a single piece of debris from a block explosion.
// 8 of these are thrown out at random directions when a block explodes.

Sprite.extend( 'Debris', {
	
	width: 20,
	height: 20,
	className: 'debris',
	
	init: function() {
		// initialize sprite
		this.pt = new Point( this.x, this.y );
		Sprite.prototype.init.call(this);
	},
	
	logic: function() {
		// executed for every logic frame
		
		// project (move) our 2D point by our angle and speed
		// then update our x and y props which actually position the sprite onscreen
		this.pt.project( this.angle, this.speed );
		this.x = this.pt.x;
		this.y = this.pt.y;
		
		// kill debris if it happens to fall offscreen on any side
		if ((this.x < 0) || (this.x >= Port.width) || (this.y < 0) || (this.y >= Port.height)) {
			this.destroy();
			return;
		}
		
		// animate rotation and speed, easing towards 0
		this.rotate += this.rotateSpeed;
		if (this.rotate >= 360) this.rotate -= 360;
		else if (this.rotate < 0) this.rotate += 360;
		
		this.rotateSpeed *= 0.99;
		
		this.speed *= 0.98;
		
		// simple lifespan counter
		// when it hits zero, fade out and die
		if (this.counter) this.counter--;
		else {
			this.opacity -= 0.015;
			if (this.opacity < 0.1) { this.destroy(); }
		}
	}
	
} );
