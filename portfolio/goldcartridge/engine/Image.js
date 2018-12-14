// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

var ImageLoader = {
	
	images: {},
	shortcuts: {},
	
	load: function(urls, callback) {
		// load one or more images
		this.loadCallback = callback || null;
		
		if (!urls || !urls.length) {
			Debug.trace('ImageLoader', "No URLs specified, skipping load");
			if (this.loadCallback) {
				fire_callback( this.loadCallback );
				this.loadCallback = null;
			}
			return;
		}
		
		for (var idx = 0, len = urls.length; idx < len; idx++) {
			var url = urls[idx];
			Debug.trace( 'ImageLoader', "Loading image: " + url );
			
			var image = { url: url, loaded: false };
			this.images[ url ] = image;
			
			var shortcut = url.replace(/\?.+$/, '').replace(/^(.+)\/([^\/]+)$/, '$2').replace(/\.\w+$/, '');
			this.shortcuts[shortcut] = image;
		}
		
		// load after filling array, in case loads are 'instant' (i.e. offline)
		for (var idx = 0, len = urls.length; idx < len; idx++) {
			var image = this.images[ urls[idx] ];
			image.img = new Image();
			image.img._url = image.url;
			image.img.onload = function() { ImageLoader.notifyLoad(this._url); };
			image.img.src = image.url;
		}
	},
	
	get: function(url) {
		// get image object based on its url
		return this.images[url] || this.shortcuts[url.replace(/\?.+$/, '').replace(/^(.+)\/([^\/]+)$/, '$2').replace(/\.\w+$/, '')];
	},
	
	getImageSize: function(url) {
		// get image width and height (must be loaded)
		var image = this.get(url);
		if (!image || !image.img) return null;
		
		return { width: image.img.width, height: image.img.height };
	},
	
	notifyLoad: function(url) {
		// notification of an image loading
		var image = this.get(url);
		assert( !!image, "Image not found: " + url );
		
		Debug.trace( 'ImageLoader', "Image loaded successfully: " + url );
		image.loaded = true;
		
		if (this.loadCallback) this.checkLoadComplete();
	},
	
	checkLoadComplete: function() {
		// check if all images are complete, and if so, fire user callback
		var progress = this.getLoadProgress();
		if (this.loadCallback && (progress >= 1.0)) {
			Debug.trace( 'ImageLoader', "All images loaded" );
			fire_callback( this.loadCallback );
			this.loadCallback = null;
		}
	},
	
	getLoadProgress: function() {
		// return a number between 0.0 and 1.0, representing the overall image load progress
		var count = 0;
		var loaded = 0;
		for (var url in this.images) {
			var image = this.images[url];
			if (image.loaded) loaded++;
			count++;
		}
		return count ? (loaded / count) : 1.0;
	}
	
};
