// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

function _RADIANS_TO_DECIMAL(_rad) { return _rad * 180.0 / Math.PI; }
function _DECIMAL_TO_RADIANS(_dec) { return _dec * Math.PI / 180.0; }

//
// Point class
//

function Point(_newX, _newY) {
	// class constructor
	this.x = _newX ? _newX : 0;
	this.y = _newY ? _newY : 0;
};

Point.prototype._isPoint = true;

Point.prototype.set = function() {
	// set point based on coords or object
	if (arguments.length == 1) {
		this.x = arguments[0].x;
		this.y = arguments[0].y;
	}
	else {
		this.x = arguments[0];
		this.y = arguments[1];
	}
	return this;
};

Point.prototype.offset = function() {
	// offset point based on coords or object
	if (arguments.length == 1) {
		this.x += arguments[0].x;
		this.y += arguments[0].y;
	}
	else {
		this.x += arguments[0];
		this.y += arguments[1];
	}
	return this;
};

Point.prototype.floor = function() {
	// convert x and y to ints
	this.x = Math.floor(this.x);
	this.y = Math.floor(this.y);
	return this;
};

Point.prototype.ceil = function() {
	// convert x and y to ints, rounding upward
	this.x = Math.ceil(this.x);
	this.y = Math.ceil(this.y);
	return this;
};

Point.prototype.getPointFromOffset = function() {
	// return new point from offset
	if (arguments.length == 1) {
		return new Point( this.x + arguments[0].x, this.y + arguments[0].y );
	}
	else {
		return new Point( this.x + arguments[0], this.y + arguments[1] );
	}
};

Point.prototype.getDistance = function() {
	// get distance between point and us
	var _pt;
	if (arguments.length == 1) _pt = arguments[0];
	else _pt = new Point(arguments[0], arguments[1]);
	
	if ((_pt.x == this.x) && (_pt.y == this.y)) return 0;
	return Math.sqrt( Math.pow(Math.abs(_pt.x - this.x), 2) + Math.pow(Math.abs(_pt.y - this.y), 2) );
};

Point.prototype.getAngle = function() {
	// get angle of point vs us
	var _pt;
	if (arguments.length == 1) _pt = arguments[0];
	else _pt = new Point(arguments[0], arguments[1]);
	
	if (this.x == _pt.x && this.y == _pt.y) return 0;
	
	var _side;
	var _quadrant;
	
	if (_pt.y < this.y && _pt.x >= this.x) { _quadrant = 0.0; _side = Math.abs(_pt.y - this.y); }
	else if (_pt.y < this.y && _pt.x < this.x) { _quadrant = 90.0; _side = Math.abs(_pt.x - this.x); }
	else if (_pt.y >= this.y && _pt.x < this.x) { _quadrant = 180.0; _side = Math.abs(_pt.y - this.y); }
	else { _quadrant = 270.0; _side = Math.abs(_pt.x - this.x); }
	
	var _angle = _quadrant + _RADIANS_TO_DECIMAL( Math.asin( _side / this.getDistance(_pt) ) );
	if (_angle >= 360.0) _angle -= 360.0;
	
	return _angle;
};

Point.prototype.getPointFromProjection = function(_angle, _distance) {
	// get new point projected at specified angle and distance
	return this.clone().project(_angle, _distance);
};

Point.prototype.project = function(_angle, _distance) {
	// move point projected at specified angle and distance
	_angle = _angle % 360;
	
	// these functions are not accurate at certain angles, hence the trickery:
	var _temp_cos = ((_angle == 90) || (_angle == 270)) ? 0 : Math.cos( _DECIMAL_TO_RADIANS(_angle) );
	var _temp_sin = ((_angle == 0) || (_angle == 180)) ? 0 : Math.sin( _DECIMAL_TO_RADIANS(_angle) );
	
	this.x += (_temp_cos * _distance);
	this.y -= (_temp_sin * _distance);
	return this;
};

Point.prototype.getMidPoint = function() {
	// get point halfway from us to specified pointvar _pt;
	if (arguments.length == 1) _pt = arguments[0];
	else _pt = new Point(arguments[0], arguments[1]);
	
	return new Point(
		this.x + ((_pt.x - this.x) / 2),
		this.y + ((_pt.y - this.y) / 2)
	);
};

Point.prototype.clone = function() {
	// return copy of our pt
	return new Point(this.x, this.y);
};

Point.prototype.morph = function(_destPt, _amount, _mode, _algo) {
	// morph our point into destPt by frame amount (0.0 - 1.0)
	if (_mode && _algo) {
		this.x = tweenFrame(this.x, _destPt.x, _amount, _mode, _algo);
		this.y = tweenFrame(this.y, _destPt.y, _amount, _mode, _algo);
	}
	else {
		this.x += ((_destPt.x - this.x) * _amount);
		this.y += ((_destPt.y - this.y) * _amount);
	}
	return this;
};

//
// Rect class
//

function Rect(_newLeft, _newTop, _newRight, _newBottom) {
	// class constructor
	this.left = _newLeft ? _newLeft : 0;
	this.top = _newTop ? _newTop : 0;
	this.right = _newRight ? _newRight : 0;
	this.bottom = _newBottom ? _newBottom : 0;
};

Rect.prototype._isRect = true;

Rect.prototype.valid = function() {
	// return true if rect is valid, false otherwise
	return (
		(this.right > this.left) && 
		(this.bottom > this.top)
	);
};

Rect.prototype.set = function() {
	// set rect based on coords or another object
	if (arguments.length == 1) {
		this.left = arguments[0].left;
		this.top = arguments[0].top;
		this.right = arguments[0].right;
		this.bottom = arguments[0].bottom;
	}
	else {
		this.left = arguments[0];
		this.top = arguments[1];
		this.right = arguments[2];
		this.bottom = arguments[3];
	}
	return this;
};

Rect.prototype.offset = function() {
	// offset rect based on x/y coords or point
	if (arguments.length == 1) {
		this.left += arguments[0].x;
		this.top += arguments[0].y;
		this.right += arguments[0].x;
		this.bottom += arguments[0].y;
	}
	else {
		this.left += arguments[0];
		this.top += arguments[1];
		this.right += arguments[0];
		this.bottom += arguments[1];
	}
	return this;
};

Rect.prototype.moveTo = function() {
	// move rect to new location
	if (arguments.length == 1) {
		var obj = arguments[0];
		if (obj._isRect) {
			return this.offset(obj.left - this.left, obj.top - this.top);
		}
		else if (obj._isPoint) {
			return this.offset(obj.x - this.left, obj.y - this.top);
		}
	}
	else {
		return this.offset(arguments[0] - this.left, arguments[1] - this.top);
	}
	
	return null;
};

Rect.prototype.width = function() {
	if (arguments.length) this.right = this.left + arguments[0];
	return (this.right - this.left);
};

Rect.prototype.height = function() {
	if (arguments.length) this.bottom = this.top + arguments[0];
	return (this.bottom - this.top);
};

Rect.prototype.centerPointX = function() {
	// get horiz center point
	return ((this.left + this.right) / 2);
};

Rect.prototype.centerPointY = function() {
	// get vert center point
	return ((this.top + this.bottom) / 2);
};

Rect.prototype.centerPoint = function() {
	// return a point right at our center
	return new Point(
		this.centerPointX(),
		this.centerPointY()
	);
};

Rect.prototype.topLeftPoint = function() { return new Point( this.left, this.top ); };
Rect.prototype.topRightPoint = function() { return new Point( this.right, this.top ); };
Rect.prototype.bottomRightPoint = function() { return new Point( this.right, this.bottom ); };
Rect.prototype.bottomLeftPoint = function() { return new Point( this.left, this.bottom ); };

Rect.prototype.pointIn = function() {
	// check if point is inside our rect
	if (arguments.length == 1) {
		var _pt = arguments[0];
		return(
			(_pt.x >= this.left) && (_pt.y >= this.top) && 
			(_pt.x < this.right) && (_pt.y < this.bottom)
		);
	}
	else {
		var _px = arguments[0];
		var _py = arguments[1];
		return(
			(_px >= this.left) && (_py >= this.top) && 
			(_px < this.right) && (_py < this.bottom)
		);
	}
};

Rect.prototype.rectIn = function(_rect) {
	// rect collision test
	var _horizTest = 0;
	var _vertTest = 0;

	if (this.left >= _rect.left && this.left <= _rect.right) _horizTest = 1;
	else if (this.right >= _rect.left && this.right <= _rect.right) _horizTest = 1;
	else if (this.left < _rect.left && this.right > _rect.right) _horizTest = 1;
	
	if (this.top >= _rect.top && this.top <= _rect.bottom) _vertTest = 1;
	else if (this.bottom >= _rect.top && this.bottom <= _rect.bottom) _vertTest = 1;
	else if (this.top < _rect.top && this.bottom > _rect.bottom) _vertTest = 1;
	
	return (_horizTest && _vertTest);
};

Rect.prototype.clone = function() {
	// return copy of our rect
	return new Rect(this.left, this.top, this.right, this.bottom);
};

Rect.prototype.morph = function(_destRect, _amount, _mode, _algo) {
	// morph our rect into destRect by frame amount (0.0 - 1.0)
	if (_mode && _algo) {
		this.left = tweenFrame(this.left, _destRect.left, _amount, _mode, _algo);
		this.top = tweenFrame(this.top, _destRect.top, _amount, _mode, _algo);
		this.right = tweenFrame(this.right, _destRect.right, _amount, _mode, _algo);
		this.bottom = tweenFrame(this.bottom, _destRect.bottom, _amount, _mode, _algo);
	}
	else {
		this.left += ((_destRect.left - this.left) * _amount);
		this.top += ((_destRect.top - this.top) * _amount);
		this.right += ((_destRect.right - this.right) * _amount);
		this.bottom += ((_destRect.bottom - this.bottom) * _amount);
	}
	return this;
};

Rect.prototype.union = function(_source) {
	// set our rect to a union with _source
	if (_source.left < this.left) this.left = _source.left;
	if (_source.top < this.top) this.top = _source.top;
	if (_source.right > this.right) this.right = _source.right;
	if (_source.bottom > this.bottom) this.bottom = _source.bottom;
	return this;
};

Rect.prototype.intersect = function(_source) {
	// set our rect to an intersection with _source
	if (_source.left > this.left) this.left = _source.left;
	if (_source.top > this.top) this.top = _source.top;
	if (_source.right < this.right) this.right = _source.right;
	if (_source.bottom < this.bottom) this.bottom = _source.bottom;
	return this;
};

Rect.prototype.inset = function(_xd, _yd) {
	// inset (or expand) rect
	if (typeof(_yd) == 'undefined') _yd = _xd;
	this.left += _xd;
	this.top += _yd;
	this.right -= _xd;
	this.bottom -= _yd;
	return this;
};
