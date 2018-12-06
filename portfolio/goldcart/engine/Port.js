// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

var Port = {
	
	width: 1024,
	height: 768,
	
	planes: [],
	scaleUp: true,
	scaleDown: true,
	scaleUpFullscreen: true,
	
	virtualWidth: 0,
	virtualHeight: 0,
	scrollX: 0,
	scrollY: 0,
	
	background: { color: 'black', xDiv: 1, yDiv: 1 },
	backgroundOffsetX: 0,
	backgroundOffsetY: 0,
	
	init: function() {
		// initialize port
		this.div = $('game_port');
		assert( !!this.div, "Could not locate game port" );
		
		this.div.style.width = '' + this.width + 'px';
		this.div.style.height = '' + this.height + 'px';
		
		this.style = this.div.style;
	},
	
	setVirtualSize: function(vWidth, vHeight) {
		// set virtual (level) size
		this.virtualWidth = vWidth;
		this.virtualHeight = vHeight;
	},
	
	setScroll: function(sx, sy) {
		// scroll the port
		this.scrollX = sx;
		this.scrollY = sy;
		
		for (var idx = 0, len = this.planes.length; idx < len; idx++) {
			this.planes[idx].setScroll( sx, sy );
		}
	},
	
	setBackground: function(args) {
		// set background characteristics
		if (args) {
			for (var key in args) this.background[key] = args[key];
		}
		
		if (this.background.color) this.style.backgroundColor = this.background.color;
		if (this.background.url) {
			this.style.backgroundImage = 'url(' + this.background.url + ')';
			
			var size = $I.getImageSize( this.background.url );
			this.background.width = size.width;
			this.background.height = size.height;
		}
		this.updateBackgroundPosition();
	},
	
	updateBackgroundPosition: function() {
		// update background image position, called automatically when needed
		if (this.background.url) {
			var _bx = 0;
			var _by = 0;
			var _sx = this.scrollX;
			var _sy = this.scrollY;
			
			if (this.background.xMode) {
				if (this.background.xMode == 'infinite') {
					_bx = Math.floor( _sx * this.background.xDiv );
				}
				else if (this.background.xMode == 'fit') {
					if (this.virtualWidth == this.width) _bx = 0;
					else {
						var _maxx = this.background.width - this.width;
						_bx = Math.floor( (_sx * _maxx) / (this.virtualWidth - this.width) );
					}
				}
			} // xMode
			
			if (this.background.yMode) {
				if (this.background.yMode == 'infinite') {
					_by = Math.floor( _sy * this.background.yDiv );
				}
				else if (this.background.yMode == 'fit') {
					if (this.virtualHeight == this.height) _by = 0;
					else {
						var _maxy = this.background.height - this.height;
						_by = Math.floor( (_sy * _maxy) / (this.virtualHeight - this.height) );
					}
				}
			} // yMode
			
			_bx += this.backgroundOffsetX;
			_by += this.backgroundOffsetY;
			
			_bx = 0 - (_bx % this.background.width);
			_by = 0 - (_by % this.background.height);
			
			this.style.backgroundPosition = '' + _bx + 'px ' + _by + 'px';
		}
	},
	
	setBackgroundOffset: function(bx, by) {
		this.backgroundOffsetX = bx;
		this.backgroundOffsetY = by;
	},
	
	resize: function(e) {
		// zoom port to fit window, called automatically
		if (this.div) {
			var size = getInnerWindowSize();
			var horizScaleFactor = size.width / this.width;
			var vertScaleFactor = size.height / this.height;
			var scaleFactor = Math.min( horizScaleFactor, vertScaleFactor );
			
			var scaleUp = this.scaleUp;
			if (!scaleUp && this.scaleUpFullscreen && (screen.availWidth == size.width)) {
				scaleUp = true; // fullscreen
			}
			
			if ((scaleFactor > 1.0) && !scaleUp) scaleFactor = 1.0;
			else if ((scaleFactor < 1.0) && !this.scaleDown) scaleFactor = 1.0;
			this.scaleFactor = scaleFactor;
			
			var sty = this.style;
			
			if (ua.safari) sty.webkitTransform = 'translate3d(0px, 0px, 0px) scale('+scaleFactor+')';
			else if (ua.webkit) sty.webkitTransform = 'translate(0px, 0px) scale('+scaleFactor+')';
			else if (ua.ff) sty.MozTransform = 'translate(0px, 0px) scale('+scaleFactor+')';
			else if (ua.op) sty.OTransform = 'translate(0px, 0px) scale('+scaleFactor+')';
			else sty.transform = 'translate(0px, 0px) scale('+scaleFactor+')';
			
			var x = this.x = Math.floor( (size.width / 2) - (this.width / 2) );
			var y = this.y = Math.floor( (size.height / 2) - (this.height / 2) );
			
			sty.left = '' + x + 'px';
			sty.top = '' + y + 'px';
			
			// orientation
			this.orientation = (size.width > size.height) ? 'landscape' : 'portrait';
			
			// simulate landscape / portrait CSS links for browsers that don't support it
			var links = document.getElementsByTagName("link");
			var oris = ['landscape', 'portrait'];
			
			for (var idx = 0, len = links.length; idx < len; idx++) {
				var link = links[idx];
				if (link.getAttribute('rel') == 'stylesheet') {
					var media = '' + (link.getAttribute('media') || '');
					for (var idy = 0, ley = oris.length; idy < ley; idy++) {
						var ori = oris[idy];
						if ((media.indexOf(ori) > -1) && (ori != this.orientation)) link.disabled = true;
						else link.disabled = false;
					} // foreach orientation
				} // is stylesheet
			} // foreach link
		}
	},
	
	addDiv: function(args) {
		// quick-create DIV in port
		var div = $(document.createElement('div'));
		div.id = args.id || get_unique_id();
		div.className = args.className || '';
		var sty = div.style;
		sty.position = 'absolute';
		
		if (args.x == 'center') args.x = (Port.width / 2) - (args.width / 2);
		if (args.y == 'center') args.y = (Port.height / 2) - (args.height / 2);
		
		if (args.x) sty.left = '' + args.x + 'px';
		if (args.y) sty.top = '' + args.y + 'px';
		if (args.width) sty.width = '' + args.width + 'px';
		if (args.height) sty.height = '' + args.height + 'px';
		
		sty.zIndex = args.zIndex || 0;
		sty.opacity = args.opacity || '';
		div.innerHTML = args.html || '';
		
		if (args.style) {
			for (var key in args.style) sty[key] = args.style[key];
		}
		
		this.div.appendChild( div );
		return div;
	},
	
	removeDiv: function(thingy) {
		// remove div from port (pass id or div itself)
		var div = $(thingy);
		if (div) {
			this.div.removeChild( div );
		}
	},
	
	addPlane: function(plane) {
		// add plane to list
		plane.port = this;
		this.planes.push( plane );
		plane.init();
	},
	
	removeAll: function() {
		// remove all planes
		for (var idx = 0, len = this.planes.length; idx < len; idx++) {
			this.planes[idx].destroy();
		}
		this.planes = [];
	},
	
	logic: function() {
		// logic loop
		for (var idx = 0, len = this.planes.length; idx < len; idx++) {
			this.planes[idx].logic();
		}
	},
	
	draw: function() {
		// draw loop
		for (var idx = 0, len = this.planes.length; idx < len; idx++) {
			this.planes[idx].draw();
		}
		this.updateBackgroundPosition();
	},
	
	mouseDown: function(pt, e) {
		// handle mouseDown event
		for (var idx = 0, len = this.planes.length; idx < len; idx++) {
			var plane = this.planes[idx];
			if (plane.mouseDown) plane.mouseDown(pt, e);
		}
	}
	
};
