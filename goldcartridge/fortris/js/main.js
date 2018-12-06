// Fortris 1.0
// Copyright (c) 2011 GoldCartridge.com

// Alpha Version: Set debug mode
Debug.enabled = true;

// Game Options
Port.width = 1024;
Port.height = 768;
Game.fps = 60;

// normally do not scale up
Port.scaleUp = false;

// However, if browser is in "full screen" mode, allow scaling up
Port.scaleUpFullscreen = true;

// Preload Gold Cartridge logo for preloader
Game.preloadImages = [
	'images/misc/goldcartridge_logo.gif'
];

// Game images to load
Game.images = [
	'images/backgrounds/main.png',
	'images/backgrounds/playfield.png',
	'images/fonts/font-strip-DINEngschriftStd-24x48b.png',
	'images/misc/plume.png',
	'images/projectiles/blue.png',
	'images/projectiles/green.png',
	'images/projectiles/mask-highlights.png',
	'images/projectiles/mask-invert.png',
	'images/projectiles/mask-midtones.png',
	'images/projectiles/mask-shadows.png',
	'images/projectiles/red.png',
	'images/projectiles/white.png',
	'images/projectiles/yellow.png',
	'images/tiles/floating.png',
	'images/tiles/next.png',
	'images/tiles/placed.png',
	'images/tiles/debris.png',
	'images/ui/icon-buttons.png',
	'images/ui/ingame-logo.png',
	'images/ui/ingame-placed.png',
	'images/ui/ingame-score.png',
	'images/ui/rotate.png'
];

// Audio files will go here (not implemented yet)
Game.audio = [
	
];

// Create namespace for game
var Fortris = {
	
	// The 'pieces' object defines all the puzzle pieces
	// These arrays must always be 4x4, even if the piece itself is smaller
	pieces: [
		[
			[0,0,0,0],
			[0,1,1,0],
			[0,1,1,0],
			[0,0,0,0]
		],
		[
			[0,1,0,0],
			[0,1,0,0],
			[0,1,0,0],
			[0,1,0,0]
		],
		[
			[0,1,0,0],
			[0,1,0,0],
			[0,1,1,0],
			[0,0,0,0]
		],
		[
			[0,0,1,0],
			[0,0,1,0],
			[0,1,1,0],
			[0,0,0,0]
		],
		[
			[0,0,0,0],
			[0,1,0,0],
			[1,1,1,0],
			[0,0,0,0]
		],
		[
			[0,0,0,0],
			[0,1,1,0],
			[0,0,1,1],
			[0,0,0,0]
		],
		[
			[0,0,0,0],
			[0,1,1,0],
			[1,1,0,0],
			[0,0,0,0]
		]	
	],
		
	init: function() {
		// engine is being initialized
		this.prefs = Game.cookie.tree;
		if (typeof(this.prefs.sound) == 'undefined') this.prefs.sound = 1;
		if (typeof(this.prefs.music) == 'undefined') this.prefs.music = 1;
		AudioManager.enabled = (this.prefs.sound == 1);
	},
	
	load: function() {
		// engine is loaded, hook some events
		Game.addEventListener( 'logic', [this, 'logic'] );
		Game.addEventListener( 'run', [this, 'run'] );
		Game.addEventListener( 'stop', [this, 'stop'] );
		
		// augment debug info
		Debug.widget_custom = function() {
			var html = '';
			if (Fortris.splane) {
				// html += '<div>Tiles: ' + Fortris.playfield.numSprites + '</div>';
				html += '<div>Sprites: ' + Fortris.splane.numSprites + '</div>';
				html += '<div>Particles: ' + Fortris.pplane.numSprites + '</div>';
			}
			return html;
		};
		
		// perma-buttons for sound and music
		this.btn_music_toggle = Port.addDiv({
			className: 'icon_button ' + ((this.prefs.music == 1) ? 'music_on' : 'music_off'),
			width: 44,
			height: 44,
			x: Port.width - 44 - 44,
			y: (56 / 2) + 20 + 24,
			zIndex: 20,
			opacity: 0
		});
		this.btn_music_toggle.addEventListener( 'mouseup', function(e) {
			Debug.trace('mouseup on music button');
			
		}, false );
		this.btn_music_toggle.fadeIn(60, 'EaseInOut', 'Quadratic');
		
		this.btn_sound_toggle = Port.addDiv({
			className: 'icon_button ' + ((this.prefs.sound == 1) ? 'sound_on' : 'sound_off'),
			width: 44,
			height: 44,
			x: Port.width - 44 - 44 - 64,
			y: (56 / 2) + 20 + 24,
			zIndex: 20,
			opacity: 0
		});
		this.btn_sound_toggle.addEventListener( 'mouseup', function(e) {
			Debug.trace('mouseup on sound button');
			
		}, false );
		this.btn_sound_toggle.fadeIn(60, 'EaseInOut', 'Quadratic');
		
		// For future development:
		// When title screen is complete, call this.titleScreen() here
		// instead of this.startNewGame().
		
		// this.titleScreen();
		this.startNewGame();
	},
	
	reset: function() {
		// destroy everything onscreen
		Port.removeAll();
		Game.resetKeys();
		TweenManager.removeAll();
		
		delete this.playfield;
		delete this.splane;
		delete this.ui;
		delete this.hud;
	},
	
	titleScreen: function() {
		// show title screen
		this.reset();
		$A.quiet();
		
		this.mode = 'title';
		
		if (!Game.inGame) Game.run();
	},
	
	startNewGame: function() {
		// start new game
		this.reset();
		
		this.mode = 'game';
		
		// player's score and number of pieces placed
		this.stats = {
			score: 0,
			timer: 0,
			level: 1
		};
		
		// playfield plane for tile map
		this.playfield = new Playfield();
		this.playfield.zIndex = 2;
		Port.addPlane( this.playfield );
		
		// sprite plane for all sprites
		this.splane = new SpritePlane();
		this.splane.zIndex = 5;
		Port.addPlane( this.splane );
		
		// particle plane for particles (no collisions)
		this.pplane = new SpritePlane();
		this.pplane.div = Port.addDiv({ x:0, y:0, width:Port.width, height:Port.height, zIndex:8 });
		this.pplane.zIndex = 8;
		Port.addPlane( this.pplane );
		
		// UI plane holds UI bits, buttons, borders, labels
		this.ui = new SpritePlane();
		this.ui.zIndex = 10;
		this.ui.logicEnabled = false;
		Port.addPlane( this.ui );
		
		// create TextPlane which renders blocks placed and score readouts
		this.hud = new TextPlane();
		this.hud.zIndex = 10;
		this.hud.font = 'images/fonts/font-strip-DINEngschriftStd-24x48b.png';
		this.hud.charWidth = 24;
		this.hud.charHeight = 48;
		this.hud.trackingX = 0.65;
		this.hud.offsetY = 768;
		Port.addPlane( this.hud );
		
		// animate HUD so it moves onscreen from the bottom upward
		this.hud.tween( {
			mode: 'EaseOut',
			algorithm: 'Quintic',
			properties: { offsetY: { start: 768, end: 666, filter: Math.floor } },
			duration: 60,
			delay: 0
		} );
		
		// center playfield background image
		this.ui.createSprite( Sprite, {
			id: 'playfield_bkgnd',
			width: 240,
			height: 240,
			x: 400,
			y: 260,
			zIndex: 1,
			opacity: 0
		} ).fadeIn( 30 );
		
		// the little rotate icon thingy that I hate
		this.ui.createSprite( Sprite, {
			id: 'icon_rotate',
			width: 44,
			height: 44,
			x: 400 + 80 + 46,
			y: 260 + 80 + 45,
			opacity: 0,
			scale: 0.75,
			zIndex: 6
		} );
		
		// thin horiz border line at top and bottom of screen
		this.ui.createSprite( Sprite, {
			className: 'ingame_thin_divider',
			width: Port.width,
			height: 1,
			x: 0,
			y: 20
		} ).fadeIn( 60 );
		this.ui.createSprite( Sprite, {
			className: 'ingame_thin_divider',
			width: Port.width,
			height: 1,
			x: 0,
			y: Port.height - 20
		} ).fadeIn( 60 );
		
		// double border around entire play area
		this.ui.createSprite( Sprite, {
			className: 'ingame_double_border',
			width: Port.width - 64,
			height: Port.height - (56 + 40),
			x: 32,
			y: (56 / 2) + 20
		} ).fadeIn( 60 );
		
		// in-game title "FORTRIS" centered along bottom border
		this.ui.createSprite( Sprite, {
			id: 'ingame_title',
			width: 120,
			height: 40,
			x: ((Port.width / 2) - (120 / 2) + 10),
			y: Port.height - 40
		} ).fadeIn( 60 );
		
		// HUD label "TIME ELAPSED"
		this.ui.createSprite( Sprite, {
			id: 'ingame_timer',
			width: 110,
			height: 27,
			x: 50,
			y: Port.height - 125
		} ).fadeIn( 60 );
		
		// HUD label "LEVEL"
		this.ui.createSprite( Sprite, {
			id: 'ingame_level',
			width: 110,
			height: 27,
			x: 512 - 49,
			y: Port.height - 125
		} ).fadeIn( 60 );
		
		// HUD label "SCORE"
		this.ui.createSprite( Sprite, {
			id: 'ingame_score',
			width: 110,
			height: 34,
			x: Port.width - 156,
			y: Port.height - 125
		} ).fadeIn( 60 );
		
		// in-game buttons
		this.ui.createSprite( Sprite, {
			id: 'ingame_button_play',
			className: 'icon_button',
			frameX: 6,
			width: 44,
			height: 44,
			x: 32 + 24,
			y: (56 / 2) + 20 + 24,
			zIndex: 20
		} ).fadeIn( 60 ).div.addEventListener( 'mouseup', function(e) {
			// toggle pause / resume
			if (Game.inGame) Game.stop();
			else Game.run();
		}, false );
		
		this.ui.createSprite( Sprite, {
			className: 'icon_button',
			frameX: 2,
			width: 44,
			height: 44,
			x: 32 + 24 + 64,
			y: (56 / 2) + 20 + 24,
			zIndex: 20
		} ).fadeIn( 60 ).div.addEventListener( 'mouseup', function(e) {
			Debug.trace('mouseup on exit button');
			
		}, false );
		
		// schedule first piece to appear in 1 sec
		Game.scheduleEvent( 60, function(self) {
			self.spawnNextPiece();
		}, this );
		
		// start main loop if needed
		if (!Game.inGame) Game.run();
	},
	
	getRandPieceIdx: function() {
		// get random piece
		
		// For future development:
		// When more unique / special pieces are added to Fortris.pieces
		// you will not want to pick them until the level has advanced enough.
		
		return Math.floor( Math.random() * this.pieces.length );
	},
	
	spawnNextPiece: function() {
		// create new piece which appears in the center of the well
		this.splane.createSprite( Piece, {
			pieceIdx: this.getRandPieceIdx(),
			zIndex: this.splane.zIndex + 1
		} );
	},
	
	spawnProjectile: function() {
		// create randomly placed and aimed projectile
		var sargs = {
			rotate: Math.floor( Math.random() * 4 ) * 90,
			xd: 0, yd: 0,
			speed: 1.0 // Future Development: Increase speed as level increases.
		};
		var targets = [];
		var pf = this.playfield;
		var spawnDist = 100;
		
		switch (sargs.rotate) {
			case 0:
				// 12 o'clock
				sargs.xd = 0; sargs.yd = -1;
				var ty = pf.fieldTop + pf.fieldSize - 1;
				// look for placed tiles, and target those first
				for (var tx = pf.fieldLeft; tx < pf.fieldLeft + pf.fieldSize; tx++) {
					var hit = pf.rayTrace( tx, ty, sargs.xd, sargs.yd );
					if (hit == 1) targets.push(tx);
				}
				if (!targets.length) {
					// no targets found, so go for home
					for (var tx = pf.homeLeft; tx < pf.homeLeft + pf.homeSize; tx++) {
						targets.push(tx);
					}
				}
				var tx = rand_array(targets);
				sargs.x = (tx * 20) + 10 - (Projectile.prototype.width / 2);
				sargs.y = Port.height + spawnDist;
			break;
			
			case 90:
				// 3 o'clock
				sargs.xd = 1; sargs.yd = 0;
				var tx = pf.fieldLeft;
				// look for placed tiles, and target those first
				for (var ty = pf.fieldTop; ty < pf.fieldTop + pf.fieldSize; ty++) {
					var hit = pf.rayTrace( tx, ty, sargs.xd, sargs.yd );
					if (hit == 1) targets.push(ty);
				}
				if (!targets.length) {
					// no targets found, so go for home
					for (var ty = pf.homeTop; ty < pf.homeTop + pf.homeSize; ty++) {
						targets.push(ty);
					}
				}
				var ty = rand_array(targets);
				sargs.x = (0 - spawnDist) - Projectile.prototype.width;
				sargs.y = (ty * 20) + 10 - (Projectile.prototype.height / 2);
			break;
			
			case 180:
				// 6 o'clock
				sargs.xd = 0; sargs.yd = 1;
				var ty = pf.fieldTop;
				// look for placed tiles, and target those first
				for (var tx = pf.fieldLeft; tx < pf.fieldLeft + pf.fieldSize; tx++) {
					var hit = pf.rayTrace( tx, ty, sargs.xd, sargs.yd );
					if (hit == 1) targets.push(tx);
				}
				if (!targets.length) {
					// no targets found, so go for home
					for (var tx = pf.homeLeft; tx < pf.homeLeft + pf.homeSize; tx++) {
						targets.push(tx);
					}
				}
				var tx = rand_array(targets);
				sargs.x = (tx * 20) + 10 - (Projectile.prototype.width / 2);
				sargs.y = (0 - spawnDist) - Projectile.prototype.height;
			break;
			
			case 270:
				// 9 o'clock
				sargs.xd = -1; sargs.yd = 0;
				var tx = pf.fieldLeft + pf.fieldSize - 1;
				// look for placed tiles, and target those first
				for (var ty = pf.fieldTop; ty < pf.fieldTop + pf.fieldSize; ty++) {
					var hit = pf.rayTrace( tx, ty, sargs.xd, sargs.yd );
					if (hit == 1) targets.push(ty);
				}
				if (!targets.length) {
					// no targets found, so go for home
					for (var ty = pf.homeTop; ty < pf.homeTop + pf.homeSize; ty++) {
						targets.push(ty);
					}
				}
				var ty = rand_array(targets);
				sargs.x = Port.width + spawnDist;
				sargs.y = (ty * 20) + 10 - (Projectile.prototype.height / 2);
			break;
		}
		
		sargs.xd *= sargs.speed;
		sargs.yd *= sargs.speed;
		this.splane.createSprite( Projectile, sargs );
	},
	
	getFogOfWar: function(pt) {
		// get opacity for point to simulate fog of war
		// this is called by various sprites to calculate their opacity
		// pass in a point, and get out an opacity number between 0.0 and 1.0
		if (!this.homeCenterPt) this.homeCenterPt = new Point( Port.width / 2, Port.height / 2 );
		var dist = this.homeCenterPt.getDistance( pt );
		dist -= 300;
		if (dist < 0) dist = 0;
		if (dist > 200) dist = 200;
		dist = 200 - dist;
		dist /= 200;
		return dist;
	},
	
	updateHUD: function() {
		// update score, etc.
		var stats = this.stats;
		if (stats.timer != stats.oldTimer) {
			var mm = Math.floor(stats.timer / 60); if (mm < 10) mm = '0' + mm;
			var ss = stats.timer % 60; if (ss < 10) ss = '0' + ss;
			this.hud.setString( 4, 0, mm + ':' + ss );
			stats.oldTimer = stats.timer;
		}
		if (stats.level != stats.oldLevel) {
			this.hud.setPadInt( 32, 0, stats.level, 2 );
			stats.oldLevel = stats.level;
		}
		if (stats.score != stats.oldScore) {
			this.hud.setPadInt( 56, 0, stats.score, 6 );
			stats.oldScore = stats.score;
		}
	},
	
	logic: function(clock) {
		// called for every logic loop iteration
		switch (this.mode) {
			case 'game':
				// advance clock every second (fps must be 60)
				if (clock % 60 == 59) this.stats.timer++;
			
				// spawn projectiles
				
				// For future development:
				// Depending on level, spawn less or more projectiles by adjusting
				// the probably amount -- higher is more probable
				
				if (probably(0.005)) {
					Fortris.spawnProjectile();
				}
		
				this.updateHUD();
			break;
			
			case 'title':
				// The title screen has not been implemented yet.
			break;
		}
	},
	
	run: function() {
		// this is an event handler, called by the game engine
		// engine is starting
		if (this.ui) {
			var button = this.ui.get('ingame_button_play');
			if (button) {
				button.frameX = 5;
			}
		}
	},
	
	stop: function() {
		// this is an event handler, called by the game engine
		// engine is stopping
		if (this.ui) {
			var button = this.ui.get('ingame_button_play');
			if (button) {
				button.frameX = 6;
				button.draw(); // need to force this
			}
		}
	}
	
};

// hook events to initialize game, and run when it finishes loading
Game.addEventListener( 'init', [Fortris, 'init'] );
Game.addEventListener( 'load', [Fortris, 'load'] );
