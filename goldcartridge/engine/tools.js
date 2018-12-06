// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

function $(thingy) {
	// universal DOM lookup function, extends object with hide/show/addClass/removeClass
	// can pass in ID or actual DOM object reference
	var obj = (typeof(thingy) == 'string') ? document.getElementById(thingy) : thingy;
	if (obj && !obj.setOpacity) {
		obj.hide = function() { this.style.display = 'none'; return this; };
		obj.show = function() { this.style.display = ''; return this; };
		obj.addClass = function(name) { this.removeClass(name); this.className += ' ' + name; return this; };
		
		obj.removeClass = function(name) {
			var classes = this.className.split(/\s+/);
			var idx = find_idx_in_array( classes, name );
			if (idx > -1) {
				classes.splice( idx, 1 );
				this.className = classes.join(' ');
			}
			return this;
		};
		
		obj.setOpacity = function(opacity) {
			// set opacity on DOM element (0.0 - 1.0)
			if (opacity == 0.0) {
				this.style.opacity = 1.0;
				this.style.visibility = 'hidden';
			}
			else if (opacity == 1.0) {
				this.style.opacity = 1.0;
				this.style.visibility = 'visible';
			}
			else {
				this.style.opacity = opacity;
				this.style.visibility = 'visible';
			}
			return this;
		};
		
		obj._animate = function() {
			this.style.opacity = tweenFrame( this._startOpacity, this._endOpacity, this._frameIdx / this._numFrames, this._tweenMode, this._tweenAlgo );
			this._frameIdx++;
			if (this._frameIdx > this._numFrames) {
				this.style.opacity = (this._endOpacity == 1.0) ? '' : this._endOpacity;
				delete this._tweenMode;
				delete this._tweenAlgo;
				delete this._numFrames;
				delete this._frameIdx;
				delete this._startOpacity;
				delete this._endOpacity;
				delete this._animating;
				
				if (this._callback) fire_callback( this._callback );
				delete this._callback;
			}
			else {
				var self = this;
				setTimeout( function() { self._animate(); }, 1000 / Game.fps );
			}
		};
		
		obj.fadeIn = function(numFrames, mode, algo, callback) {
			// fade object in over N frames
			if (!mode) mode = 'EaseIn';
			if (!algo) algo = 'Linear';
			this._tweenMode = mode;
			this._tweenAlgo = algo;
			this._numFrames = numFrames;
			this._frameIdx = 0;
			this._startOpacity = 0.0;
			this._endOpacity = 1.0;
			this._callback = callback || null;
			if (!this._animating) {
				this._animating = true;
				this._animate();
			}
			return this;
		};
		
		obj.fadeOut = function(numFrames, mode, algo, callback) {
			// fade object in over N frames
			if (!mode) mode = 'EaseIn';
			if (!algo) algo = 'Linear';
			this._tweenMode = mode;
			this._tweenAlgo = algo;
			this._numFrames = numFrames;
			this._frameIdx = 0;
			this._startOpacity = 1.0;
			this._endOpacity = 0.0;
			this._callback = callback || null;
			if (!this._animating) {
				this._animating = true;
				this._animate();
			}
			return this;
		};
	}
	return obj;
}

function find_idx_in_array(arr, elem) {
	// return idx of elem in arr, or -1 if not found
	for (var idx = 0, len = arr.length; idx < len; idx++) {
		if (arr[idx] == elem) return idx;
	}
	return -1;
}

function find_in_array(arr, elem) {
	// return true if elem is found in arr, false otherwise
	for (var idx = 0, len = arr.length; idx < len; idx++) {
		if (arr[idx] == elem) return true;
	}
	return false;
}

function delete_from_array(arr, elem) {
	// if elem is located in arr, delete it
	var idx = find_idx_in_array(arr, elem);
	if (idx > -1) arr.splice(idx, 1);
}

function fire_callback(callback) {
	// fire callback, which can be a function name, ref, or special object ref
	// inline arguments are passed verbatim to callback function
	var args = array_slice( arguments, 1 );
	
	if (isa_array(callback)) {
		var obj = callback[0];
		var func = callback[1];
		// assert(obj[func], "fire_callback: Object does not contain method: " + func);
		return obj[func].apply(obj, args);
	}
	else if (typeof(callback) == 'function') {
		return callback.apply(null, args);
	}
	else {
		return window[callback].apply(null, args);
	}
}

function array_slice(array, start, end) {
	// return an excerpt from the array, leaving original array intact
	if (!end) end = array.length;
	var slice = [];
	
	for (var idx = start; idx < end; idx++) {
		if (idx < array.length) slice.push( array[idx] );
	}
	
	return slice;
}

function always_array(obj, key) {
	// if object is not array, return array containing object
	// if key is passed, work like XMLalwaysarray() instead
	// apparently MSIE has weird issues with obj = always_array(obj);
	
	if (key) {
		if ((typeof(obj[key]) != 'object') || (typeof(obj[key].length) == 'undefined')) {
			var temp = obj[key];
			delete obj[key];
			obj[key] = new Array();
			obj[key][0] = temp;
		}
		return null;
	}
	else {
		if ((typeof(obj) != 'object') || (typeof(obj.length) == 'undefined')) { return [ obj ]; }
		else return obj;
	}
}

function isa_hash(arg) {
	// determine if arg is a hash
	return( !!arg && (typeof(arg) == 'object') && (typeof(arg.length) == 'undefined') );
}

function isa_array(arg) {
	// determine if arg is an array or is array-like
	if (typeof(arg) == 'array') return true;
	return( !!arg && (typeof(arg) == 'object') && (typeof(arg.length) != 'undefined') );
}

function parseQueryString(queryString) {
	// parse query string into object
	var pair = null;
	var queryObject = new Object();
	queryString = queryString.replace(/^.*\?(.+)$/,'$1');
	
	while ((pair = queryString.match(/(\w+)=([^\&]*)\&?/)) && pair[0].length) {
		queryString = queryString.substring( pair[0].length );
		pair[2] = unescape(pair[2]);
		if (/^\-?\d+$/.test(pair[2])) pair[2] = parseInt(pair[2], 10);
		
		if (typeof(queryObject[pair[1]]) != 'undefined') {
			always_array( queryObject, pair[1] );
			array_push( queryObject[pair[1]], pair[2] );
		}
		else queryObject[pair[1]] = pair[2];
	}
	
	return queryObject;
}

function composeQueryString(queryObj) {
	// compose key/value pairs into query string
	// supports duplicate keys (i.e. arrays)
	var qs = '';
	for (var key in queryObj) {
		var values = always_array(queryObj[key]);
		for (var idx = 0, len = values.length; idx < len; idx++) {
			qs += (qs.length ? '&' : '?') + escape(key) + '=' + escape(values[idx]);
		}
	}
	return qs;
}

function getInnerWindowSize(dom) {
	// get size of inner window
	if (!dom) dom = window;
	var myWidth = 0, myHeight = 0;
	
	if( typeof( dom.innerWidth ) == 'number' ) {
		// Non-IE
		myWidth = dom.innerWidth;
		myHeight = dom.innerHeight;
	}
	else if( dom.document.documentElement && ( dom.document.documentElement.clientWidth || dom.document.documentElement.clientHeight ) ) {
		// IE 6+ in 'standards compliant mode'
		myWidth = dom.document.documentElement.clientWidth;
		myHeight = dom.document.documentElement.clientHeight;
	}
	else if( dom.document.body && ( dom.document.body.clientWidth || dom.document.body.clientHeight ) ) {
		// IE 4 compatible
		myWidth = dom.document.body.clientWidth;
		myHeight = dom.document.body.clientHeight;
	}
	return { width: myWidth, height: myHeight };
}

function stop_event(e) {
	// prevent default behavior for event
	// debugstr("stopping event from bubbling");
	if (e.preventDefault) {
		e.preventDefault();
		e.stopPropagation();
	}
	else {
		e.returnValue = false;
		e.cancelBubble = true;
	}
	return false;
}

var _newUnique = 772;
function get_unique_id() {
	// get a "unique" number for DOM element identification
	_newUnique++;
	return _newUnique;
}

function dumper(_obj, _max_levels, _indent) {
	// return pretty-printed object tree
	if (typeof(_max_levels) == 'undefined') _max_levels = 0;
	var _text = '';
	
	if (typeof(_obj) == 'undefined') return 'undefined';
	else if (typeof(_obj) == 'function') return '(function)';
	else if (_obj === null) return 'null';
		
	if (!_indent) {
		// _text = "var _obj = ";
		if (typeof(_obj) == 'object' && typeof(_obj.length) != 'undefined') _text += "[\n";
		else _text += "{\n";
		_indent = 1;
	}
	
	var _indentStr = '';
	for (var _k=0; _k<_indent; _k++) _indentStr += "\t";
	
	if (typeof(_obj) == 'object' && typeof(_obj.length) != 'undefined') {
		// type is array
		for (var _a = 0; _a < _obj.length; _a++) {
			if (typeof(_obj[_a]) != 'function') {
				if (typeof(_obj.length) != 'undefined') _text += _indentStr;
				else _text += _indentStr + _a + ": ";

				if (typeof(_obj[_a]) == 'object') {
					if (_obj[_a] == null) {
						_text += "null,\n";
					}
					else if (typeof(_obj[_a].length) != 'undefined') {
						if (_max_levels) _text += "[\n" + dumper( _obj[_a], _max_levels - 1, _indent + 1 ) + _indentStr + "],\n";
						else _text += "[...],\n";
					}
					else {
						if (_max_levels) _text += "{\n" + dumper( _obj[_a], _max_levels - 1, _indent + 1 ) + _indentStr + "},\n";
						else _text += "{...},\n";
					}
				}
				else if (typeof(_obj[_a]) == 'number') _text += _obj[_a] + ",\n";
				else _text += '"' + _obj[_a] + '",' + "\n";
			} // not _a function
		} // for _a in _obj
	} // array
	else {
		// type is object
		for (var _a in _obj) {
			if (typeof(_obj[_a]) != 'function') {
				if (typeof(_obj.length) != 'undefined') _text += _indentStr;
				else _text += _indentStr + _a + ": ";

				if (typeof(_obj[_a]) == 'object') {
					if (_obj[_a] == null) {
						_text += "null,\n";
					}
					else if (typeof(_obj[_a].length) != 'undefined') {
						if (_max_levels) _text += "[\n" + dumper( _obj[_a], _max_levels - 1, _indent + 1 ) + _indentStr + "],\n";
						else _text += "[...],\n";
					}
					else {
						if (_max_levels) _text += "{\n" + dumper( _obj[_a], _max_levels - 1, _indent + 1) + _indentStr + "},\n";
						else _text += "{...},\n";
					}
				}
				else if (typeof(_obj[_a]) == 'number') _text += _obj[_a] + ",\n";
				else _text += '"' + _obj[_a] + '",' + "\n";
			} // not _a function
		} // for _a in _obj
	} // object
	
	if (_indent == 1) {
		if (typeof(_obj) == 'object' && typeof(_obj.length) != 'undefined') _text += "]\n";
		else _text += "}\n";
	}

	return _text;
}

function rand_array(arr) {
	// return random element from array
	return arr[ parseInt(Math.random() * arr.length, 10) ];
}

function load_script(url) {
	var scr = document.createElement('SCRIPT');
	scr.type = 'text/javascript';
	scr.src = url;
	document.getElementsByTagName('HEAD')[0].appendChild(scr);
}

function merge_objects(a, b) {
	// merge keys from a and b into c and return c
	// b has precedence over a
	if (!a) a = {};
	if (!b) b = {};
	var c = {};

	// also handle serialized objects for a and b
	if (typeof(a) != 'object') eval( "a = " + a );
	if (typeof(b) != 'object') eval( "b = " + b );

	for (var key in a) c[key] = a[key];
	for (var key in b) c[key] = b[key];

	return c;
}

function serialize(thingy, glue) {
	// serialize anything into json
	// or perl object notation (just set glue to '=>')
	if (!glue) glue = ':'; // default to json
	var stream = '';
	
	if (typeof(thingy) == 'number') {
		stream += thingy;
	}
	else if (typeof(thingy) == 'string') {
		stream += '"' + thingy.replace(/([\"\\])/g, '\\$1').replace(/\r/g, "\\r").replace(/\n/g, "\\n") + '"';
	}
	else if (isa_hash(thingy)) {
		var num = 0;
		var buffer = [];
		for (var key in thingy) {
			buffer[num] = (key.match(/^[A-Za-z]\w*$/) ? key : ('"'+key+'"')) + glue + serialize(thingy[key], glue);
			num++;
		}
		stream += '{' + buffer.join(',') + '}';
	}
	else if (isa_array(thingy)) {
		var buffer = [];
		for (var idx = 0, len = thingy.length; idx < len; idx++) {
			buffer[idx] = serialize(thingy[idx], glue);
		}
		stream += '[' + buffer.join(',') + ']';
	}
	else {
		// unknown type, just return 0
		stream += '0';
	}
	
	return stream;
}

function get_menu_value(id) {
	var menu = $(id);
	if (!menu) return '';
	return menu.options[menu.selectedIndex].value;
}

function get_menu_text(id) {
	var menu = $(id);
	if (!menu) return '';
	return menu.options[menu.selectedIndex].text;
}

function set_menu_value(id, value, auto_add) {
	var menu = $(id);
	if (!menu) return false;
	for (var idx = 0, len = menu.options.length; idx < len; idx++) {
		if (menu.options[idx].value == value) {
			menu.selectedIndex = idx;
			return true;
		}
	}
	if (auto_add) {
		menu.options[menu.options.length] = new Option(value, value);
		menu.selectedIndex = menu.options.length - 1;
		return true;
	}
	return false;
}

function hires_time_now() {
	// return the Epoch seconds for like right now
	var now = new Date();
	return ( now.getTime() / 1000 );
}

function time_now() {
	// return the Epoch seconds for like right now
	var now = new Date();
	return parseInt( now.getTime() / 1000, 10 );
}

function short_float(value) {
	// Shorten floating-point decimal to 2 places, unless they are zeros.
	if (!value) value = 0;
	return value.toString().replace(/^(\-?\d+\.[0]*\d{2}).*$/, '$1');
}

function first_key(hash) {
	// return first key from hash (unordered)
	for (var key in hash) return key;
	return null; // no keys in hash
}

function num_keys(hash) {
	// count the number of keys in a hash
	var count = 0;
	for (var a in hash) count++;
	return count;
}

function probably(value) {
	// Calculate probability and return true or false
	if (typeof(value) == 'undefined') { return 1; }
	return ( Math.random() < value ) ? 1 : 0;
}

var ua;

(function() {
	// Browser detection
	var u = navigator.userAgent;
	var webkit = !!u.match(/WebKit/);
	var chrome = !!u.match(/Chrome/);
	var safari = !!u.match(/Safari/) && !chrome;
	var safari3 = safari && !!u.match(/Version\D[3456789]/);
	var safari2 = safari && !safari3;
	var ie = !!u.match(/MSIE/);
	var ie6 = ie && !!u.match(/MSIE\s+6/);
	var ie7 = ie && !!u.match(/MSIE\s+7/);
	var ie8 = ie && !!u.match(/MSIE\s+8/);
	var moz = !safari && !ie;
	var op = !!window.opera;
	var mac = !!u.match(/Mac/i);
	var ff = !!u.match(/Firefox/);
	var ff3 = !!u.match(/Firefox\D+3/);
	var iphone = !!u.match(/iPhone/);
	var ipad = !!u.match(/iPad/);
	var ios = iphone || ipad;
	var android = !!u.match(/android/i);
	
	var ver = 0;
	if (ff && u.match(/Firefox\D+(\d+(\.\d+)?)/)) {
		ver = parseFloat( RegExp.$1 );
	}
	else if (safari && u.match(/Version\D(\d+(\.\d+)?)/)) {
		ver = parseFloat( RegExp.$1 );
	}
	else if (chrome && u.match(/Chrome\D(\d+(\.\d+)?)/)) {
		ver = parseFloat( RegExp.$1 );
	}
	else if (ie && u.match(/MSIE\D+(\d+(\.\d+)?)/)) {
		ver = parseFloat( RegExp.$1 );
	}
	else if (op && u.match(/Opera\D+(\d+(\.\d+)?)/)) {
		ver = parseFloat( RegExp.$1 );
	}
	
	ua = {
		webkit: webkit,
		safari: safari,
		safari3: safari3,
		safari2: safari2,
		ie: ie,
		ie8: ie8,
		ie7: ie7,
		ie6: ie6,
		moz: moz,
		op: op,
		mac: mac,
		ff: ff,
		ff3: ff3,
		chrome: chrome,
		iphone: iphone,
		ipad: ipad,
		ios: ios,
		android: android,
		mobile: iphone || ipad || android,
		ver: ver
	};
})();
