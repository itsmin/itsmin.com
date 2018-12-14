// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

var Debug = {
	
	enabled: false,
	
	init: function() {
		// initialize debugging
		if (this.enabled) {
			Game.addEventListener( 'logic', [Debug, 'logic']);
			Game.addEventListener( 'run', [Debug, 'run']);
			Game.addEventListener( 'stop', [Debug, 'stop']);
			Game.addEventListener( 'step', [Debug, 'step']);
			Game.addEventListener( 'resize', [Debug, 'resize']);
			
			var div = this.div = document.createElement('div');
			div.id = 'debug_widget';			
			div.innerHTML = this.get_widget_html();
			document.getElementsByTagName('body')[0].appendChild(div);
		}
	},
	
	get_widget_html: function() {
		// get html for debug widget
		var html = '';
		
		html += '<div>';
			html += '<input type="button" value="Run" '+(Game.inGame ? 'disabled="disabled"' : '')+' onClick="Game.run()"/>';
			html += '<input type="button" value="Stop" '+(!Game.inGame ? 'disabled="disabled"' : '')+' onClick="Game.stop()"/>';
			html += '<input type="button" value="Step" '+(Game.inGame ? 'disabled="disabled"' : '')+' onClick="Game.step()"/>';
		html += '</div>';
		
		html += '<div>Target FPS:  ' + Game.fps + '</div>';
		html += '<div>Current FPS: ' + (Game.inGame ? this.fps.current : '---') + '</div>';
		html += '<div>Average FPS: ' + short_float( this.fps.average ) + '</div>';
		html += '<div>Frame Count: ' + this.fps.totalFrames + '</div>';
		html += '<div>Last Sleep:  ' + short_float( Game.lastSleep ) + '</div>';
		html += '<div>Port Scale:  ' + short_float( Port.scaleFactor ) + '</div>';
		
		if (this.widget_custom) html += this.widget_custom();
		
		return html;
	},
	
	trace: function(cat, msg) {
		// log entry to debug console
		if (!Debug.enabled) return false;
		if (!msg) { msg = cat; cat = 'Debug'; }
		if (window.console && window.console.log) window.console.log(cat + ': ' + msg);
	},
	
	fps: {
		current: 0,
		average: 0,
		frameCount: 0,
		lastSecond: 0,
		startTime: 0,
		totalFrames: 0
	},
	
	resetAverageFPS: function() {
		this.fps.totalFrames = 0;
		this.fps.startTime = 0;
	},
	
	run: function() {
		// main loop is starting
		this.resetAverageFPS();
		this.div.innerHTML = this.get_widget_html();
	},
	
	stop: function() {
		// exiting main loop
		this.div.innerHTML = this.get_widget_html();
	},
	
	step: function() {
		// stepping by one frame (user initiated)
		this.fps.totalFrames++;
		this.div.innerHTML = this.get_widget_html();
	},
	
	resize: function() {
		// window is being resized
		var self = this;
		setTimeout( function() { self.div.innerHTML = self.get_widget_html(); }, 1 );
	},
	
	logic: function(clock) {
		// calculate running fps
		var int_now = Math.floor(Game.now);
		if (int_now != this.fps.lastSecond) {
			this.fps.totalFrames += this.fps.frameCount;
			if (!this.fps.startTime) this.fps.startTime = int_now - 1;
			this.fps.average = this.fps.totalFrames / (int_now - this.fps.startTime);
			
			this.fps.current = this.fps.frameCount;
			this.fps.frameCount = 0;
			this.fps.lastSecond = int_now;
			this.div.innerHTML = this.get_widget_html();
		}
		this.fps.frameCount++;
	}
	
};
