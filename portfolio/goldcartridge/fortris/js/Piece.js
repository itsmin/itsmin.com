// Fortris 1.0
// Copyright (c) 2011 GoldCartridge.com

// This sprite renders an entire piece (4x4 blocks) and acts as the "next" piece shown in the center of the well
// and the sprite you rotate and "drag" around to be dropped onto the playfield.  When dropped, the sprite is
// destroyed, and the individual blocks are "drawn" onto the playfield.

// Piece has three states:
// 'intro': Just appeared, is fading in and rotating in the center of the well.
// 'initial': Waiting for user to click.
// 'drag': Being dragged by the user.  May go back to 'initial' if dropped on an illegal location.

Sprite.extend( 'Piece', {
	
	width: 20 * 4,
	height: 20 * 4,
	pieceIdx: 0,
	captureMouse: true,
	
	destRotate: 0,
	destScale: 1.0,
	destOpacity: 1.0,
	destOffsetX: 0,
	destOffsetY: 0,
	destX: 0,
	destY: 0,
	
	// the rotate_map is used to rotate the piece 90 degrees
	// it represents the coordinates to grab for each 4x4 position
	rotate_map: [
		[ [3,0], [3,1], [3,2], [3,3] ],
		[ [2,0], [2,1], [2,2], [2,3] ],
		[ [1,0], [1,1], [1,2], [1,3] ],
		[ [0,0], [0,1], [0,2], [0,3] ]
	],
	
	init: function() {
		Sprite.prototype.init.call(this);
		
		// grab the 4x4 array definition for our piece
		var piece = Fortris.pieces[ this.pieceIdx ];
		
		this.piece = piece;
		this.frame = 'next';
		this.state = 'intro';
		this.map = [];
		
		// copy piece block allocations to our map array
		for (var y = 0; y < 4; y++) {
			var row = this.map[y] = [];
			for (var x = 0; x < 4; x++) {
				row[x] = piece[y][x];
			}
		}
		
		// center in middle of fortris
		this.x = this.destX = 400 + 80;
		this.y = this.destY = 260 + 80;
		
		// start out rotate and scale for intro animation
		this.rotate = 360;
		this.scale = 0.0;
		this.opacity = 0.0;
		this.draw(); // prevent flicker
		
		// adjust so piece is centered visually and draw it
		this.calculateOffset();
		this.renderMap();
		
		// show rotate icon which i hate
		Fortris.ui.get('icon_rotate').stop().fadeIn( 60, { delay: 60 } );
	},
	
	calculateOffset: function() {
		// calculate X/Y visual offset based on tile map spacing
		// this is used only for centering piece in preview area
		var leftBias = 0;
		for (var x = 0; x < 4; x++) {
			for (var y = 0; y < 4; y++) {
				if (this.map[y][x]) { y = 4; x = 4; }
			}
			leftBias++;
		}
		
		var rightBias = 0;
		for (var x = 3; x >= 0; x--) {
			for (var y = 0; y < 4; y++) {
				if (this.map[y][x]) { y = 4; x = -1; }
			}
			rightBias++;
		}
		
		var topBias = 0;
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++) {
				if (this.map[y][x]) { y = 4; x = 4; }
			}
			topBias++;
		}
		
		var bottomBias = 0;
		for (var y = 3; y >= 0; y--) {
			for (var x = 0; x < 4; x++) {
				if (this.map[y][x]) { y = -1; x = 4; }
			}
			bottomBias++;
		}
		
		this.destOffsetX = (rightBias - leftBias) * 10;
		this.destOffsetY = (bottomBias - topBias) * 10;
	},
	
	mouseDown: function(pt, e) {
		// called automatically by engine when user clicks on our sprite
		// setup drag operation (or just a plain click for rotate)
		this.clickX = this.x;
		this.clickY = this.y;
		this.clickPt = pt.clone();
		this.clickTime = Game.logicClock;
		this.state = 'initial';
	},
	
	mouseMove: function(pt, e) {
		// called automatically by engine when user moves mouse after having clicked on our sprite
		// if state is initial, and mouse has moved more than 2 pixels in any direction, set state to drag.
		// if already dragging, simply update mouse position.
		switch (this.state) {
			case 'initial':
				if (pt.getDistance(this.clickPt) > 2) {
					this.state = 'drag';
					this.frame = 'floating';
					this.renderMap();
					
					// we are now dragging, so fade out rotation icon which i hate
					Fortris.ui.get('icon_rotate').stop().fadeOut( 60 );
				}
			
			case 'drag':
				this.x = this.destX = this.clickX + (pt.x - this.clickPt.x);
				this.y = this.destY = this.clickY + (pt.y - this.clickPt.y);
			break;
		}
	},
	
	mouseUp: function(pt, e) {
		// called automatically by engine when user releases mouse button, having clicked on our sprite
		// check for single click
		if ((this.state == 'initial') && (Game.logicClock - this.clickTime < 15)) {
			// click = rotate
			this.doRotate();
		}
		else {
			// user must have been dragging, so drop the piece
			if (Fortris.playfield.place(this)) {
				// piece placed successfully
				this.destroy();
				
				// increase count
				Fortris.stats.score++;
				
				// next piece
				
				// Note for future development:
				// You may not want to spawn new pieces continuously like this, because
				// the user can fortify their fortris too easily.  Increase delay?  Dunno.
				
				Game.scheduleEvent( 30, function() { Fortris.spawnNextPiece(); } );
			}
			else {
				// piece was not dropped successfully (out of bounds or collided with other placed blocks)
				// cancel, go back to center
				this.destX = 400 + 80;
				this.destY = 260 + 80;
				this.state = 'idle';
				this.frame = 'next';
				this.renderMap();
				
				// re-show rotate icon which i hate
				Fortris.ui.get('icon_rotate').stop().fadeIn( 60 );
			}
		}
	},
	
	renderMap: function() {
		// render our 16 tiles into HTML for our sprite content
		var html = '';
		
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++) {
				var ch = this.map[y][x];
				html += '<div class="tile '+(ch ? this.frame : '')+'" style="float:left;"></div>';
			}
		}
		
		html += '<div class="clear"></div>';
		this.div.innerHTML = html;
		this.draw();
	},
	
	doRotate: function() {
		// rotate our map by 90 degrees, and re-render
		var old_map = this.map;
		this.map = [];
		
		for (var x = 0; x < 4; x++) {
			var col = this.map[x] = [];
			for (var y = 0; y < 4; y++) {
				var rot_coords = this.rotate_map[x][y];
				col[y] = old_map[ rot_coords[1] ][ rot_coords[0] ];
			}
		}
		
		this.rotate = 90;
		
		this.calculateOffset();
		this.renderMap();
		
		// $A.playSound('rotate');
	},
	
	logic: function() {
		// animate rotation and scale to destination
		// Essentially what we are doing here is smoothly animating several properties towards
		// destination values.  For example, 'destRotate' is where we want 'ratate' to be, 
		// but it is smoothly eased-out towards it.  Same with destScale, destOpacity, etc.
		var smooth = (this.state == 'intro') ? 16 : 8;
		
		if (this.rotate != this.destRotate) {
			if (Math.abs(this.rotate - this.destRotate) <= 0.25) this.rotate = this.destRotate;
			else this.rotate += ((this.destRotate - this.rotate) / smooth);
		}
		if (this.scale != this.destScale) {
			if (Math.abs(this.scale - this.destScale) <= 0.004) this.scale = this.destScale;
			else this.scale += ((this.destScale - this.scale) / smooth);
		}
		if (this.opacity != this.destOpacity) {
			if (Math.abs(this.opacity - this.destOpacity) <= 0.004) this.opacity = this.destOpacity;
			else this.opacity += ((this.destOpacity - this.opacity) / smooth);
		}
		
		if (this.offsetX != this.destOffsetX) {
			if (Math.abs(this.offsetX - this.destOffsetX) <= 0.25) this.offsetX = this.destOffsetX;
			else this.offsetX += ((this.destOffsetX - this.offsetX) / smooth);
		}
		if (this.offsetY != this.destOffsetY) {
			if (Math.abs(this.offsetY - this.destOffsetY) <= 0.25) this.offsetY = this.destOffsetY;
			else this.offsetY += ((this.destOffsetY - this.offsetY) / smooth);
		}
		
		if (this.x != this.destX) {
			if (Math.abs(this.x - this.destX) <= 0.25) this.x = this.destX;
			else this.x += ((this.destX - this.x) / smooth);
		}
		if (this.y != this.destY) {
			if (Math.abs(this.y - this.destY) <= 0.25) this.y = this.destY;
			else this.y += ((this.destY - this.y) / smooth);
		}
	}
	
} );
