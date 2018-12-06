// Fortris 1.0
// Copyright (c) 2011 GoldCartridge.com

// The 'Playfieid' is the 12x12 center tile area where you can place pieces.
// There is a 4x4 area in the center which is your "Fortris" that is unplayable.
// This sprite is represented by an HTML5 Canvas, to reduce the sprite count.

SpritePlane.extend( 'Playfield', {
	
	map: null,
	blockSize: 20,
	cols: 51,
	rows: 38,
	logicEnabled: false,
	
	fieldSize: 12,
	fieldLeft: 20,
	fieldTop: 13,
	
	homeSize: 4,
	homeLeft: 24,
	homeTop: 17,
	
	init: function() {
		// setup
		this.map = [];
		SpritePlane.prototype.init.call(this);
		
		this.width = this.fieldSize * this.blockSize;
		this.height = this.fieldSize * this.blockSize;
		
		// create html5 canvas object
		var canvas = this.canvas = document.createElement('canvas');
		if (!canvas.getContext) return alert("Sorry, no canvas support in your browser.");
		
		canvas.setAttribute('width', this.width );
		canvas.setAttribute('height', this.height );
		
		// set canvas position and add to DOM
		var style = this.style = canvas.style;
		style.position = 'absolute';
		style.left = '' + Math.floor(this.fieldLeft * this.blockSize) + 'px';
		style.top = '' + Math.floor(this.fieldTop * this.blockSize) + 'px';
		style.zIndex = this.zIndex;
		
		Port.div.appendChild( canvas );
		
		// get canvas 2d drawing context
		this.ctx = canvas.getContext('2d');
		this.ctx.clearRect(0, 0, this.width, this.height);
		
		// clear tile map (used for logic only)
		for (var y = 0; y < this.rows; y++) {
			this.map[y] = [];
			var row = this.map[y];
			for (var x = 0; x < this.cols; x++) {
				row[x] = 2;
			}
		}
		
		// set which tiles can be played
		for (var y = this.fieldTop; y < this.fieldTop + this.fieldSize; y++) {
			for (var x = this.fieldLeft; x < this.fieldLeft + this.fieldSize; x++) {
				this.map[y][x] = 0; // playable
			}
		}
		
		// and finally reset centermost tiles (cannot place blocks in home area)
		for (var y = this.homeTop; y < this.homeTop + this.homeSize; y++) {
			for (var x = this.homeLeft; x < this.homeLeft + this.homeSize; x++) {
				this.map[y][x] = 3; // no drop
			}
		}
	},
	
	destroy: function() {
		// shutdown
		SpritePlane.prototype.destroy.call(this);
		Port.div.removeChild( this.canvas );
		delete this.style;
		delete this.ctx;
		delete this.canvas;
	},
	
	rayTrace: function(tx, ty, xd, yd) {
		// trace invisible ray to see what gets hit
		while (!this.lookupTile(tx, ty)) {
			tx += xd;
			ty += yd;
		}
		return this.lookupTile(tx, ty);
	},
	
	lookupTile: function(tx, ty) {
		// lookup tile given tx and ty indexes
		var row = this.map[ty];
		if (typeof(row) == 'undefined') return 0;
		return row[tx] || 0;
	},
	
	lookupTileFromGlobal: function(x, y) {
		// lookup tile from global coords
		return this.lookupTile( Math.floor(x / this.blockSize), Math.floor(y / this.blockSize) );
	},
	
	setTile: function(tx, ty, frame) {
		// set or unset tile at location
		var id = 'tile_' + tx + '_' + ty;
		
		Debug.trace("Setting tile " + tx + 'x' + ty + " to " + frame);
		
		var x = Math.floor( tx - this.fieldLeft ) * this.blockSize;
		var y = Math.floor( ty - this.fieldTop ) * this.blockSize;
		
		this.ctx.clearRect(x, y, this.blockSize, this.blockSize);
		
		if (frame) {
			// draw image into canvas
			this.ctx.drawImage( ImageLoader.get(frame).img, x, y );
			this.map[ty][tx] = 1;
		}
		else {
			this.map[ty][tx] = 0;
		}
	},
	
	setTileFromGlobal: function(x, y, frame) {
		// set tile given global coordinates
		this.setTile( Math.floor(x / this.blockSize), Math.floor(y / this.blockSize), frame );
	},
	
	place: function(piece) {
		// attempt to place piece on playfield
		// this may or may not be successful, depending on location and blocks in use
		// piece must "fit" into area completely unoccupied by other blocks or illegal areas
		var tleft = Math.floor( (piece.x + piece.offsetX + (this.blockSize / 2)) / this.blockSize );
		var ttop = Math.floor( (piece.y + piece.offsetY + (this.blockSize / 2)) / this.blockSize );
		var good = true;
		
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++) {
				if (piece.map[y][x]) {
					var tx = tleft + x;
					var ty = ttop + y;
					if (this.map[ty][tx]) { good = false; x = 4; y = 4; }
				}
			} // x loop
		} // y loop
		
		if (good) {
			for (var y = 0; y < 4; y++) {
				for (var x = 0; x < 4; x++) {
					if (piece.map[y][x]) {
						var tx = tleft + x;
						var ty = ttop + y;
						this.setTile( tx, ty, 'placed' );
					}
				} // x loop
			} // y loop
		}
		
		return good;
	},
	
	draw: function() {
		// override SpritePlane.draw() to do "nothing"
		// as our 'sprites' are just tiles that never move
	}
	
} );
