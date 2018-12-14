// Fortris 1.0
// Copyright (c) 2011 GoldCartridge.com

// The 'Plume' sprite is simply a semi-transparent explosion graphic overlay
// See the CSS class 'plume' and images/misc/plume.png.
// The sprite is immediately scale- and opacity-tweened, then auto-destroyed.  It does not move.

Sprite.extend( 'Plume', {
	
	width: 60,
	height: 60,
	className: 'plume',
	
	init: function() {
		// start at 25% scale and full opacity, then fade out while scaling up
		this.scale = 0.25;
		this.opacity = 1.0;
		Sprite.prototype.init.call(this);
		
		this.tween({
			mode: 'EaseOut',
			algorithm: 'Quadratic',
			properties: { opacity: { start: 1, end: 0 } },
			duration: 50,
			delay: 0,
			onTweenComplete: function() {
				this.target.destroy();
			}
		});
		
		this.tween({
			mode: 'EaseOut',
			algorithm: 'Quintic',
			properties: { scale: { start: 0.25, end: 1.0 } },
			duration: 50,
			delay: 0
		});
	},
	
	logic: function() {
		// nothing to do here, tweens are automatic
	}
	
} );
