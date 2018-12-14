// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

Class.create( 'Color', {
	
	red: 0,
	green: 0,
	blue: 0,
	alpha: 1.0,
	
	__construct: function() {
		this.set.apply( this, arguments );
	},
	
	set: function() {
		// set color from: another Color object, a hex 6, hex 3, css rgb() or css rgba()
		if (arguments.length == 1) {
			var thingy = arguments[0];
			if (thingy.__name == 'Color') {
				this.red = thingy.red;
				this.green = thingy.green;
				this.blue = thingy.blue;
				this.alpha = thingy.alpha;
			}
			else if (thingy.toString().match(/^\#?(\w{2})(\w{2})(\w{2})$/)) {
				// #ffffff
				var rgb = this._HEX2RGB(thingy);
				this.red = rgb.r / 255;
				this.green = rgb.g / 255;
				this.blue = rgb.b / 255;
			}
			else if (thingy.toString().match(/^\#?(\w{1})(\w{1})(\w{1})$/)) {
				// #fff
				var rgb = this._HEX2RGB(thingy);
				this.red = rgb.r / 255;
				this.green = rgb.g / 255;
				this.blue = rgb.b / 255;
			}
			else if (thingy.toString().match(/^rgb\((\d+)\D+(\d+)\D+(\d+)/)) {
				// rgb(255, 255, 255)
				this.red = RegExp.$1 / 255;
				this.green = RegExp.$2 / 255;
				this.blue = RegExp.$3 / 255;
			}
			else if (thingy.toString().match(/^rgba\((\d+)\D+(\d+)\D+(\d+)\D+(\d+(\.\d+)?)/)) {
				// rgba(255, 255, 255, 1.0)
				this.red = RegExp.$1 / 255;
				this.green = RegExp.$2 / 255;
				this.blue = RegExp.$3 / 255;
				this.alpha = parseFloat( RegExp.$4 );
			}
			else {
				alert("BAD COLOR FORMAT: " + thingy);
			}
		}
		else {
			this.red = (arguments[0] || 0) / 255;
			this.green = (arguments[1] || 0) / 255;
			this.blue = (arguments[2] || 0) / 255;
			if (typeof(arguments[3]) != 'undefined') this.alpha = parseFloat(arguments[3] || 0);
		}
		return this;
	},
	
	isEqualTo: function(color) {
		// return true if color is EXACTLY equal to our color (beware: internal props are floating point -- DANGER DANGER)
		if (color.__name != 'Color') color = new Color(color);
		return ((color.red == this.red) && (color.green == this.green) && (color.blue == this.blue) && (color.alpha == this.alpha));
	},
	
	isNearEqualTo: function(color) {
		// return true if color is NEAR equal to us (visibly equal, within 8-bit precision)
		if (color.__name != 'Color') color = new Color(color);
		var precision = 1.0 / 255;
		return (
			(Math.abs(color.red - this.red) <= precision) && 
			(Math.abs(color.green - this.green) <= precision) && 
			(Math.abs(color.blue - this.blue) <= precision) && 
			(Math.abs(color.alpha - this.alpha) <= precision)
		);
	},
	
	fadeTo: function(color, amount) {
		// ease our values towards a color by the specified amount (0.0 to 1.0)
		if (color.__name != 'Color') color = new Color(color);
		if (amount > 1.0) amount = 1.0;
		else if (amount < 0.0) amount = 0.0;
		
		this.red += ((color.red - this.red) * amount);
		this.green += ((color.green - this.green) * amount);
		this.blue += ((color.blue - this.blue) * amount);
		this.alpha += ((color.alpha - this.alpha) * amount);
		return this;
	},
	
	hex: function() {
		// return css hex 6 string for color
		return '#' + this._toHex(this.red * 255) + this._toHex(this.green * 255) + this._toHex(this.blue * 255);
	},
	
	css: function() {
		// return css rgb or rgba for color
		if (this.alpha == 1.0) {
			return 'rgb(' + Math.floor(this.red * 255) + ', ' + Math.floor(this.green * 255) + ', ' + Math.floor(this.blue * 255) + ')';
		}
		else {
			return 'rgba(' + Math.floor(this.red * 255) + ', ' + Math.floor(this.green * 255) + ', ' + Math.floor(this.blue * 255) + ', ' + (this.alpha * 1.0) + ')';
		}
	},
	
	toString: function() {
		// return color as string
		return this.css();
	},
	
	clone: function() {
		// copy color and return clone
		return new Color(this);
	},
	
	// internal methods:
	
	_hexDigitValueTable: {
		'0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9,
		'A':10, 'B':11, 'C':12, 'D':13, 'E':14, 'F':15
	},
	
	_toDec: function(hh) {
		hh = hh.toUpperCase();
		var high = hh.substring(0,1);
		var low = hh.substring(1,2);
		return ( (this._hexDigitValueTable[high] * 16) + this._hexDigitValueTable[low] );
	},

	_HEX2RGB: function(hex) {
		hex = hex.toString().replace(/^\#/, "").toUpperCase();
		if (hex.length == 3) hex = hex.substring(0,1) + '0' + hex.substring(1,2) + '0' + hex.substring(2,3) + '0';
		if (hex.length != 6) return null;

		return {
			r: this._toDec( hex.substring(0,2) ),
			g: this._toDec( hex.substring(2,4) ),
			b: this._toDec( hex.substring(4,6) )
		};
	},
	
	_toHex: function(v) { v=Math.round(Math.min(Math.max(0,v),255)); return("0123456789ABCDEF".charAt((v-v%16)/16)+"0123456789ABCDEF".charAt(v%16)); }
	
} );

