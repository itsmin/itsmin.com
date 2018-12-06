// GoldCartridge.com Game Tools
// Copyright (c) 2010 Joseph Huckaby
// Released under the MIT License

var AudioManager = {
	
	enabled: true,
	tracks: {},
	shortcuts: {},
	
	init: function() {
		// initialize audio engine, called by Game.js
		if (ua.android || ua.ios) this.enabled = false;
	},
	
	load: function(urls, callback) {
		// load one or more audio tracks
		if (!this.enabled || !urls || !urls.length) {
			if (callback) setTimeout( function() { fire_callback(callback); }, 1 );
			return;
		}
		
		this.loadCallback = callback || null;
		
		for (var idx = 0, len = urls.length; idx < len; idx++) {
			var url = urls[idx];
			
			// go ogg if not safari
			if (!ua.safari) url = url.replace(/\.mp3/i, '.ogg');
			
			Debug.trace( 'Audio', "Loading track: " + url );
			
			var track = parseQueryString( url );
			if (!track.multiplex) track.multiplex = 1;
			if (!track.volume) track.volume = 1.0;
			
			track.url = url.replace(/\?.+$/, '');
			track.loaded = false;
			track.movieIdx = 0;
			
			this.tracks[ url ] = track;
		}
		
		// create shortcuts
		for (var url in this.tracks) {
			var track = this.tracks[ url ];
			
			var key = url.replace(/\?.+$/, '').replace(/^.+\/([^\/]+)$/, '$1');
			this.shortcuts[key] = track;
			
			var key = url.replace(/\?.+$/, '').replace(/^.+\/([^\/]+)$/, '$1').replace(/\.\w+$/, '');
			this.shortcuts[key] = track;
		}
		
		// load after filling array, in case loads are 'instant' (i.e. offline)
		for (var url in this.tracks) {
			var track = this.tracks[ url ];
			
			track.movies = [];
			track.loading = true;
			track.progress = 0;
			
			for (var idx = 0, len = track.multiplex; idx < len; idx++) {
				var movie = track.movies[idx] = new Audio( track.url );
				movie.volume = track.volume;
				movie.loop = track.loop ? true : false;
				movie.autobuffer = false;
			}
			
			var movie = track.movies[0];
			movie._id = url;
			movie._track = track;
			movie.progress = 0;
			
			movie.addEventListener('begin', function(ev) { 
				// sound is beginning to download
				this._track.progress = 0;
				Debug.trace('Audio', "Track starting download: " + this._track.url);
			}, false);

			movie.addEventListener('progress', function(ev) { 
				// called every so often during download
				if (this._track.loading) {
					if (ev && ev.loaded && ev.total) {
						this._track.progress = ev.loaded / ev.total;
						if (this._track.progress > 1.0) this._track.progress = 1.0;
					}
					Debug.trace('Audio', "Track download progress: " + this._track.url + ": " + this._track.progress);
				}
			}, false);

			movie.addEventListener('canplaythrough', function() {
				// movie has finished downloading
				if (this._track.loading) {
					Debug.trace('Audio', "Track finished download: " + this._id);
					AudioManager.notifyLoad( this._id );
				}
			}, false);

			movie.addEventListener('play', function() {
				// use native loop functionality (faster than catching end event)
				Debug.trace('Audio', "Track playing: " + this._track.url);
				this.loop = this._track.loop ? true : false;
				this._track.playing = true;
			}, false);

			movie.addEventListener('ended', function() {
				// sound has reached its end, check for loop
				Debug.trace('Audio', "Sound reached end: " + this._track.url);
				this._track.playing = false;
			}, false);

			movie.addEventListener('error', function() {
				Debug.trace('Audio', "Failed to load audio URL: " + this._track.url);
				alert("Audio Clip Error: Cannot load: " + this._track.url);
			}, false);
			
			for (var idx = 0, len = track.multiplex; idx < len; idx++) {
				var movie = track.movies[idx];
				movie.load();
			}
			
			if (ua.ios) {
				// iOS doesn't fire any events until sound is played, so just assume loaded
				setTimeout( 'AudioManager.notifyLoad("'+url+'")', 1000 );
			}
		}
	},
	
	get: function(url) {
		// get audio track object based on its url
		return this.tracks[url] || this.shortcuts[url];
	},
	
	notifyLoad: function(url) {
		// notification of an audio track loading
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		
		track.progress = 1.0;
		track.loading = false;
		track.loaded = true;
		
		Debug.trace( 'Audio', "Audio track loaded successfully: " + url );
		
		if (this.loadCallback) this.checkLoadComplete();
	},
	
	checkLoadComplete: function() {
		// check if all audio tracks are complete, and if so, fire user callback
		var progress = this.getLoadProgress();
		if (this.loadCallback && (progress >= 1.0)) {
			Debug.trace( 'Audio', "All audio tracks loaded" );
			fire_callback( this.loadCallback );
			this.loadCallback = null;
		}
	},
	
	getLoadProgress: function() {
		// return a number between 0.0 and 1.0, representing the overall audio load progress
		var count = 0;
		var loaded = 0;
		for (var url in this.tracks) {
			var track = this.tracks[url];
			loaded += track.progress;
			count++;
		}
		return count ? (loaded / count) : 1.0;
	},
	
	quiet: function() {
		// quiet all tracks
		for (var url in this.tracks) {
			this.stop(url);
		}
	},
	
	playSound: function(url) {
		// play track as effect
		if (!this.enabled) return;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		
		var movie = track.movies[ track.movieIdx ];
		track.movieIdx++;
		if (track.movieIdx >= track.multiplex) track.movieIdx = 0;
		
		try { movie.currentTime = 0; } catch (e) {;}
		try { movie.play(); } catch (e) {;}
	},
	
	play: function(url) {
		// play track
		if (!this.enabled) return;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		
		var movie = track.movies[0];
		try { movie.play(); } catch(e) {;}
	},
	
	stop: function(url) {
		// stop playback (but do not rewind)
		if (!this.enabled) return;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		
		for (var idx = 0, len = track.multiplex; idx < len; idx++) {
			try { track.movies[idx].pause(); } catch (e) {;}
		}

		track.playing = false;
	},
	
	rewind: function(url) {
		// rewind track
		if (!this.enabled) return;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		try { track.movies[0].currentTime = 0; } catch(e) {;}
	},
	
	setVolume: function(url, newVolume) {
		// set volume of track
		if (!this.enabled) return;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		
		if (newVolume < 0) newVolume = 0;
		else if (newVolume > 1.0) newVolume = 1.0;

		track.volume = newVolume;

		for (var idx = 0, len = track.multiplex; idx < len; idx++) {
			try { track.movies[idx].volume = newVolume; } catch(e) {;}
		}
	},
	
	isPlaying: function(url) {
		// return true if track is playing, false otherwise
		if (!this.enabled) return false;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		return track.isPlaying;
	},
	
	getPosition: function(url) {
		// get current position in playing track, in seconds
		if (!this.enabled) return 0;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		return track.movies[0].currentTime;
	},
	
	setPosition: function(url, pos) {
		// set position of playing track, in seconds
		if (!this.enabled) return;
		var track = this.get(url);
		assert( !!track, "Audio track not found: " + url );
		try { track.movies[0].currentTime = pos; } catch(e) {;}
	}
	
};
