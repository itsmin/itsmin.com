// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

var Game = {
	
	// mouse button constants
	LEFT_BUTTON: 0,
	MIDDLE_BUTTON: 1,
	RIGHT_BUTTON: 2,
	
	// common key constants
	LEFT_ARROW: 37,
	RIGHT_ARROW: 39,
	UP_ARROW: 38,
	DOWN_ARROW: 40,
	SPACE_BAR: 32,
	ESCAPE: 27,
	ENTER: 13,
	BACKSPACE: 8,
	TAB: 9,
	
	// key code map
	keyMap: {
		8: 'Backspace',
		9: 'Tab',
		27: 'Escape', 
		32: 'Space',
		192: 'Tilde',
		187: 'Equals',
		189: 'Dash',
		45: 'Insert',
		36: 'Home',
		33: 'Page Up',
		144: 'Num Lock',
		111: 'Slash (Keypad)',
		106: 'Asterisk (Keypad)',
		109: 'Dash (Keypad)',
		219: 'Left Bracket',
		221: 'Right Bracket',
		220: "Backslash",
		46: 'Delete',
		35: 'End',
		34: 'Page Down',
		103: '7 (Keypad)',
		104: '8 (Keypad)',
		105: '9 (Keypad)',
		107: 'Plus (Keypad)',
		186: 'Semicolon',
		222: 'Quote',
		13: 'Enter',
		100: '4 (Keypad)',
		101: '5 (Keypad)',
		102: '6 (Keypad)',
		188: 'Comma',
		190: 'Period',
		191: 'Slash',
		38: 'Up Arrow',
		97: '1 (Keypad)',
		98: '2 (Keypad)',
		99: '3 (Keypad)',
		17: 'Control',
		37: 'Left Arrow',
		40: 'Down Arrow',
		39: 'Right Arrow',
		96: '0 (Keypad)',
		110: 'Period (Keypad)',
		16: 'Shift',
		18: 'Alt/Option',
		224: 'Meta/Cmd'
	},
	
	// images to load before anything else (i.e. preloader images)
	preloadImages: [],
	
	// game definition
	fps: 60,
	images: [],
	audio: [],
	
	init: function() {
		// setup
		Debug.init();
		Debug.trace("Initializing engine");
		
		if (window.CookieTree) {
			this.cookie = new CookieTree();
		}
		
		this.fireEvent( 'init' );
		
		Debug.trace("Initializing Port");
		Port.init();
		this.addEventListener( 'resize', function() { Port.resize(); } );
		this.addEventListener( 'mouseDown', function(pt, e) { Port.mouseDown(pt, e); } );
		// this.addEventListener( 'mouseMove', function(pt, e) { Port.mouseMove(pt, e); } );
		// this.addEventListener( 'mouseUp', function(pt, e) { Port.mouseUp(pt, e); } );
		this.fireEvent( 'resize' );
		
		Debug.trace("Initializing Audio Manager");
		AudioManager.init();
		
		// preload stuff
		Debug.trace("Preloading images");
		ImageLoader.load( this.preloadImages, [this, 'load'] );
	},
	
	load: function() {
		// load game images and audio, show preloader
		Debug.trace("Initializing preloader");
		this.preloaderDiv = Port.addDiv({
			id: 'preloader',
			x: 'center',
			y: 'center',
			width: 256,
			height: 256 + 20,
			opacity: 0,
			html: '<div id="load_logo"></div><div id="load_bar"><div id="load_bar_inner"></div></div>'
		});
		this.preloaderDiv.fadeIn(30, 'EaseInOut', 'Quadratic');
		
		Debug.trace("Loading resources");
		ImageLoader.load( this.images );
		AudioManager.load( this.audio );
		
		setTimeout( function() { Game.monitorLoadProgress(); }, 100 );
	},
	
	monitorLoadProgress: function() {
		// check image and audio load progress
		var progress = ( ImageLoader.getLoadProgress() + AudioManager.getLoadProgress() ) / 2;
		$('load_bar_inner').style.left = '' + Math.floor( -256 + (progress * 256) ) + 'px';
		
		if (progress >= 1.0) {
			Debug.trace( 'Game', "Core load complete" );
						
			this.preloaderDiv.fadeOut( 30, 'EaseInOut', 'Quadratic', function() {
				Port.removeDiv( Game.preloaderDiv ); delete Game.preloaderDiv;
				Game.fireEvent( 'load' );
				Game.run();
			} );
		}
		else {
			setTimeout( function() { Game.monitorLoadProgress(); }, 100 );
		}
	},
	
	inGame: false,
	logicClock: 0,
	logicNow: 0,
	drawClock: 0,
	skipFrames: false,
	
	run: function() {
		// enter main loop
		if (!this.inGame) {
			Debug.trace('Game', "Entering main loop");
			this.lastFrame = this.lastFrameEnd = hires_time_now();
			this.now = hires_time_now();
			this.logicNow = this.now - (1 / this.fps);
			this.inGame = true;
			this.fireEvent('run');
			this.loop();
		}
	},
	
	stop: function() {
		// suspend main loop
		if (this.inGame) {
			Debug.trace('Game', "Stopping main loop");
			this.inGame = false;
			if (this.loopTimer) clearTimeout( this.loopTimer );
			this.loopTimer = null;
			this.fireEvent('stop');
		}
	},
	
	step: function() {
		// execute exactly one frame then return
		if (!this.inGame) {
			this.inGame = true;
			this.now = hires_time_now();
			this.logicNow = this.now - (1 / this.fps);
			this.logic();
			this.draw();
			this.inGame = false;
			this.fireEvent('step');
		}
	},
	
	loop: function() {
		// run one iteration of the main loop, and schedule the next one
		this.loopTimer = null;

		if (this.inGame) {
			var maxDelay = 1 / this.fps;
			var now = this.now = hires_time_now();
			
			if (this.skipFrames) {
				while ((this.logicNow < now) && this.inGame) {
					this.logic();
					this.logicNow += maxDelay;
				}
			}
			else {
				this.logic();
			}
			
			this.draw();
			
			if (this.inGame) {
				// schedule next frame, trying to maintain target frame rate
				var endNow = hires_time_now();
				var actualLastDelay = endNow - this.lastFrameEnd;
				if (!this.lastSleep) this.lastSleep = maxDelay;

				var delay = this.lastSleep - (actualLastDelay - maxDelay);
				if (delay > maxDelay) delay = maxDelay;
				else if (delay < 0.001) delay = 0.001;
				
				this.loopTimer = setTimeout( function() { Game.loop(); }, delay * 1000 );
				
				this.lastFrame = now;
				this.lastFrameEnd = endNow;
				this.lastSleep = delay;
			}
		}
	},
	
	logic: function() {
		// perform logic operations for current frame
		this.fireEvent( 'logic', this.logicClock );
		Port.logic();
		TweenManager.logic();
		
		// check for scheduled events at this point in time
		if (this._schedule[this.logicClock]) {
			var _evs = this._schedule[this.logicClock];
			for (var _idx = 0, _len = _evs.length; _idx < _len; _idx++) {
				var _ev = _evs[_idx];
				if (typeof(_ev.handler) == 'function') {
					_ev.handler.apply( window, _ev.args );
				}
				else if (isa_array(_ev.handler)) {
					// PHP style object callback
					// _ev.handler[0] is object ref, _ev.handler[1] is function ref (or string)
					if (typeof(_ev.handler[1]) == 'function') _ev.handler[1].apply(_ev.handler[0], _ev.args);
					else _ev.handler[0][ _ev.handler[1] ].apply(_ev.handler[0], _ev.args);
				}
				else if (window[_ev.handler]) window[_ev.handler].apply(window, _ev.args);
				else return alert("Unsupported handler type for scheduled event: " + _ev.handler);
			}
			delete this._schedule[this.logicClock];
		}
		
		this.logicClock++;
	},
	
	draw: function() {
		// perform draw operations for current frame
		this.fireEvent( 'draw', this.drawClock );
		Port.draw();
		this.drawClock++;
	},
	
	keys: {},
	keysActive: true,
	mouseActive: true,
	mouseObj: null,
	
	keyDown: function(e) {
		// handle keydown event
		if (!this.keysActive) return true;
		var code = e.keyCode;
		
		// passthrough all events if metaKey or ctrlKey were held
		if (e && (e.metaKey || e.ctrlKey)) return true;
		
		if (this.inGame && !this.keys[code]) {
			this.keys[code] = true;
			this.fireEvent( 'keydown', code, e );
			stop_event(e);
		}
	},
	
	keyUp: function(e) {
		// handle keyup event
		if (!this.keysActive) return true;
		var code = e.keyCode;
		
		// passthrough all events if metaKey or ctrlKey were held
		if (e && (e.metaKey || e.ctrlKey)) return true;
		
		if (this.inGame && this.keys[code]) {
			this.keys[code] = false;
			this.fireEvent( 'keyup', code, e );
			stop_event(e);
		}
	},
	
	isKeyDown: function(code) {
		// return true if key is down, false otherwise
		return this.keys[code];
	},
	
	resetKeys: function() {
		// reset all keys to up state
		this.keys = {};
	},
	
	mouseWheel: function(e) {
		// handle mouse wheel movement
		if (this.inGame && this.mouseActive) {
			var _delta = 0;

			if (e.wheelDelta) {
				_delta = e.wheelDelta / 120;
			}
			else if (e.detail) {
				_delta = -e.detail / 3;
			}
			if (!_delta) return true;

			_delta = 0 - _delta;
			
			this.fireEvent( 'mousewheel', _delta, e );
		}
	},
	
	getGameMouseCoords: function(e) {
		// translate mouse coords to game world coords
		var pt = new Point( e.pageX, e.pageY );
		
		if (!Port.div || !Port.scaleFactor) {
			pt.inPort = false;
			return pt;
		}
		
		var rect = new Rect( Port.x, Port.y, Port.width, Port.height );
		rect.inset( Math.floor( (Port.width - (Port.width * Port.scaleFactor)) / 2 ), Math.floor( (Port.height - (Port.height * Port.scaleFactor)) / 2 ) );
		
		// constrain bounds to port
		pt.inPort = true;
		if (pt.x < rect.left) { pt.x = rect.left; pt.inPort = false; }
		else if (pt.x >= rect.right) { pt.x = rect.right - 1; pt.inPort = false; }
		if (pt.y < rect.top) { pt.y = rect.top; pt.inPort = false; }
		else if (pt.y >= rect.bottom) { pt.y = rect.bottom - 1; pt.inPort = false; }
		
		// adjust pt to port space and scale
		pt.offset( 0 - rect.left, 0 - rect.top );
		pt.x /= Port.scaleFactor;
		pt.y /= Port.scaleFactor;
		
		return pt;
	},
	
	mouseDown: function(e) {
		if (this.inGame && this.mouseActive) {
			var pt = this.getGameMouseCoords(e);
			if (pt.inPort) {
				this.fireEvent( 'mouseDown', pt, e );
			} // mouse in port
		} // mouseActive
	},
	
	mouseMove: function(e) {
		if (this.inGame && this.mouseActive) {
			var pt = this.getGameMouseCoords(e);
			if (this.mouseObj && this.mouseObj.mouseMove) {
				this.mouseObj.mouseMove(pt, e);
			}
			this.fireEvent( 'mouseMove', pt, e );
		} // mouseActive
	},
	
	mouseUp: function(e) {
		if (this.inGame && this.mouseActive) {
			var pt = this.getGameMouseCoords(e);
			if (this.mouseObj) {
				if (this.mouseObj.mouseUp) this.mouseObj.mouseUp(pt, e);
				delete this.mouseObj;
			}
			this.fireEvent( 'mouseUp', pt, e );
		} // mouseActive
	},
	
	addEventListener: function(_name, _func) {
		// set handler in object
		_name = _name.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers) this.handlers = {};
		if (!this.handlers[_name]) this.handlers[_name] = [];
		this.handlers[_name].push( _func );
	},
	
	removeEventListener: function(_name, _func) {
		// remove single handler from list
		_name = _name.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers) this.handlers = {};
		if (!this.handlers[_name]) this.handlers[_name] = [];
		delete_from_array( this.handlers[_name], _func );
	},
	
	clearAllHandlers: function(_name) {
		// clear custom handler
		_name = _name.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers) this.handlers = {};
		if (this.handlers[_name]) this.handlers[_name] = [];
	},
	
	fireEvent: function(_name) {
		// fire specified handler
		// accepts variable argument list, passes extra args to callback
		_name = _name.toString().toLowerCase().replace(/^on/, '');
		if (!this.handlers) this.handlers = {};
		var _args = array_slice( arguments, 1 );

		if (this.handlers[_name]) {
			var _handlers = always_array( this.handlers[_name] );
			for (var _idx = 0, _len = _handlers.length; _idx < _len; _idx++) {
				var _result = false;
				var _handler = _handlers[_idx];
				if (typeof(_handler) == 'function') _result = _handler.apply(window, _args);
				else if (isa_array(_handler)) {
					// PHP style object callback
					// handler[0] is object ref, handler[1] is function ref (or string)
					if (typeof(_handler[1]) == 'function') _result = _handler[1].apply(_handler[0], _args);
					else _result = _handler[0][ _handler[1] ].apply(_handler[0], _args);
				}
				else if (window[_handler]) _result = window[_handler].apply(window, _args);
				// else if (typeof(handler) == 'string') result = eval(handler);
				else return alert("Unsupported handler type: " + _name + ": " + _handler);
				if (_result === false) return _result;
			} // foreach handler
		}

		return true;
	},
	
	_schedule: {},
	
	scheduleEvent: function(_time, _handler) {
		// schedule handler to fire in the future
		// accepts variable argument list, passes extra args to fireHandler
		if (!_time || (_time < 0)) _time = 0;
		_time += this.logicClock;
		if (!this._schedule[_time]) this._schedule[_time] = [];
		this._schedule[_time].push( {
			handler: _handler,
			args: array_slice( arguments, 2 )
		} );
	},
	
	clearSchedule: function() {
		// clear all future events
		this._schedule = {};
	}
	
};

// shortvuts
var $A = AudioManager;
var $I = ImageLoader;
var $T = TweenManager;
var $D = Debug;
var $P = Port;
var $G = Game;

window.addEventListener( 'mousedown', function(e) { Game.mouseDown(e); }, false );
window.addEventListener( 'mousemove', function(e) { Game.mouseMove(e); }, false );
window.addEventListener( 'mouseup', function(e) { Game.mouseUp(e); }, false );

window.addEventListener( 'keydown', function(e) { Game.keyDown(e); }, false );
window.addEventListener( 'keyup', function(e) { Game.keyUp(e); }, false );
window.addEventListener( 'DOMMouseScroll', function(e) { Game.mouseWheel(e); }, false);

document.addEventListener( "DOMContentLoaded", function() {
	document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
	Game.init();
}, false );

window.addEventListener( "resize", function(e) {
	// Port.resize(e);
	Game.fireEvent( 'resize' );
}, false );

window.onorientationchange = function() {
	Game.fireEvent( 'resize' );
};
