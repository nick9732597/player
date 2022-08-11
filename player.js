class players {
	
	play (media) {
		
		// set the info for the player
		player.setInfo({
			type: media.type
			title: media.title,
			speaker: media.speaker,
			image: media.image
		});
		
		switch (media.type) {
			
			case "audio": 
				player.playAudio(media.audio, media.time);
				break;
			
			case "youtube":
				player.playYouTube(media.youtube, media.time, media.duration);
				break;
				
			case "soundcloud": 
				player.playSoundCloud(media.soundcloud, media.time);
				break;
		
		}
		
	}
		
	playAudio (id, currentTime) {
		
		// if this audio is already playing
		if (player.getInfo("id") == id) {
						
			// set the audio player current time
			$("#xaudioplayer").prop("currentTime", currentTime);
			
			// play the audio
			$("#xaudioplayer")[0].play();
			
			return;
		
		// if this audio is not already playing
		} else {
			
			// set the info for the player
			player.setInfo({ id: id });
			
			// get the audio player
			var audioplayer = document.getElementById("xaudioplayer");
			
			// set the audio file to the source
			audioplayer.src = "/audio/" + id; 

			// run a function once the audio is loaded
			audioplayer.onloadedmetadata = function () {
				
				// set the player duration
				$("div#xplayer").data("duration", audioplayer.duration);
				
				// set the player end time
				$("span#xplayer-end").html(hhmmss(Math.floor(audioplayer.duration)));
				
				// show the player
				$("div.xplayer").show().addClass("playing");
				
				// set the volume slider to match the player volume
				$('input#xplayer-volumeslider').val(audioplayer.volume * 100).change();
				
				// set the audio player current time
				audioplayer.currentTime = currentTime;
				
				// play the audio
				audioplayer.play();
				
			}; 
			
		}
		
	}
		
	playYouTube (id, currentTime, duration) {
		
		// if the youtube api has not been initizlied, return an error
		if (!youtubeplayer) { console.log("Error: YouTube API must be loaded to play a video."); return; }
		
		// set the info for the player
		player.setInfo({ id: id });
	
		// set the link attribute
		$("a.xyoutubelink").attr("href", "https://www.youtube.com/watch?v=" + id);
		
		// if the youtube player is ready and has not been initialized
		if (youtubeplayer == "ready") {
			
			// initalize the player
			youtubeplayer = new YT.Player('xplayer-iframe', {
				videoId: id,
				events: {
					'onReady': function (event) {
						
						youtubeplayer.seekTo(currentTime);
						
						duration = hhmmss(Math.floor(youtubeplayer.getDuration()));
						
						$("div#xplayer").data("duration", youtubeplayer.getDuration());
						$("span#xplayer-end").html(duration);
						
						$("div.xplayer").show().addClass("playing");
						event.target.playVideo();
						
						$('input#xplayer-volumeslider').val(youtubeplayer.getVolume()).change();
						
					},
					'onStateChange': function (event) {
						
						if (event.data == YT.PlayerState.PLAYING && !youtubedone) {
							
							youtubedone = true;
							
						}
						
					}
				}
				
			});
			
		// if the player has been initialized
		} else if (youtubeplayer.playerInfo.videoUrl.indexOf(id) > -1) {
			
			youtubeplayer.seekTo(currentTime);
			
		} else {
			
			$("div#xplayer").data("duration", duration);
			$("span#xplayer-end").html(hhmmss(Math.floor(duration)));
			$("div.xplayer").show().addClass("playing");
						
			// load the video by the id
			youtubeplayer.loadVideoById({
				'videoId': id,
				'startSeconds': currentTime
			});
			
		}
		
	}
				
	playSoundCloud (id, currentTime) {
				
		// if the current media is already playing
		if (player.getInfo("id") != id) {

			// set the info for the player
			player.setInfo({ id: id });
			
			var theiframe = '<iframe id="sc" width="100%" height="20" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/'+id+'&color=%23ff5500&inverse=false&auto_play=false&show_user=true"></iframe>'
		
			$("div.soundcloudplayer-inner").html(theiframe);
			
			soundcloudplayer = SC.Widget("sc");
							
		}
		
		// load the media from soundcloud
		soundcloudplayer.load("https%3A//api.soundcloud.com/tracks/"+id+"&color=%23ff5500&inverse=false&auto_play=false&show_user=true", {
			callback: function () {
				
				if (currentTime != "") {
				
					soundcloudplayer.seekTo(currentTime * 1000);
				
				}
				
				soundcloudplayer.getDuration(function (milliseconds) {
					
					var duration = (milliseconds / 1000); 
				
					$("div#xplayer").data("duration", duration);
					$("span#xplayer-end").html(hhmmss(Math.floor(duration)));
					$("div.xplayer").show().addClass("playing");
										
					soundcloudplayer.play();
					
				});
				
			}
		});
		
	}
	
	checkStatus () {
				
		// check the status every 0.75 seconds
		setTimeout(function () { player.checkStatus(); }, 750);
				
		if (!$("div.rangeslider").hasClass("rangeslider--active")) {
			
			switch (player.getInfo('type')) {
			
				case "audio":
			
					var audioplayer = document.getElementById("xaudioplayer");
					var currentTime = Math.floor(audioplayer.currentTime); 
					var endTime = Math.floor(audioplayer.duration);
					var duration = $("div#xplayer").data("duration");
					var percent = Number(currentTime/duration) * 1000;
					
					break;
								
				case "youtube":
					
					var currentTime = Math.floor(youtubeplayer.playerInfo.currentTime);
					var endTime = Math.floor(youtubeplayer.playerInfo.duration);
					var duration = $("div#xplayer").data("duration");
					var percent = Number(currentTime/duration) * 1000;
					
					break;
								
			}
			
			// update the player start time
			$("span#xplayer-start").html(hhmmss(currentTime));
			
			// update the player end time
			$("span#xplayer-end").html(hhmmss(endTime));
			
			// update the player slider
			$('input#xplayer-slider').val(percent).change();
			
		}
		
	}
	
	getInfo (key) {
		
		return playerInfo[key];
		
	}
	
	setInfo (data) {
				
		fields = {
			
			// set the type
			type: function (type) {
				
				$("div#xplayer").addClass("xtype" + type);
									
				if (type != "audio") { player.stop("audio"); }
				if (type != "youtube") { player.stop("youtube"); }
				if (type != "soundcloud") { player.stop("soundcloud"); }
				
			},
			
			// set the image
			image: function (image) {
				
				$("div.xplayer-audio").css("background-image","url('" + image + "')");
				
			},
			
			// set the title
			title: function (title) {
				
				$("span#xplayer-title").html(title);
				
			},
			
			// set the speaker
			speaker: function (speaker) {
				
				$("span#xyoutube-speaker").html(speaker);
				
			},
			
		};	
		
		// set all the entries from the object
		Object.entries(data).forEach(entry => {
			
			const [key, value] = entry;
			
			// check if an array key exists
			if (key in fields) {
			
				// the field
				fields[key](value);
				
			}
			
			// set the variable for this object
			playerInfo[key] = value;
			
		});
		
	}
	
	stop (type) {
		
		switch (type) {
			
			case "audio":
			
				$("div#xplayer").removeClass("xtypeaudio");
				$("audio#xaudioplayer").attr("src", "");
				$("body").data("mp3", "");
				
				break;
		
			case "youtube":
				
				$("div#xplayer").removeClass("xtypeyoutube");
				
				if (youtubeplayer != "ready") {
					
					youtubeplayer.stopVideo();

				}
				
				break;
				
			case "soundcloud":
			
				if ($("body").data("soundcloud") != "") {
				
					$("body").data("soundcloud", "");
					$("div#xplayer").removeClass("xtypesoundcloud");
					
					// pause the soundcloud player
					soundcloudplayer.pause();
					
					// remove the player
					$("div.soundcloudplayer-inner").html("");
					
				}
				
				break;
						
		}
		
	}
		
	setPlaySpeed () {
		
		var speed = Number($("div.xplayer-playspeed").data("level"));

		// increase the play speed by 0.25x
		speed += 0.25;
		
		// if the play speed is less than 2x, reset play speed to 1x
		if (speed > 2) { speed = 1; }
		
		$("div.xplayer-playspeed").data("level", speed);
		$("div.xplayer-playspeed-number").html(speed + "x");
		
		switch (player.getInfo('type')) {
			
			case "audio":
			
				$("#xaudioplayer").prop("playbackRate", speed);
				break;
			
			case "youtube":
			
				youtubeplayer.setPlaybackRate(speed);
				break;
			
			case "soundcloud":
			
				soundcloudplayer.stop();
				break;
			
		}
		
	}
	
	pausePlay () {
		
		switch (player.getInfo('type')) {
			
			case "audio":
		
				if ($("div#xplayer").hasClass("playing")) {
				
					$("div#xplayer").removeClass("playing");
					$("#xaudioplayer")[0].pause();
				
				} else {
				
					$("div#xplayer").addClass("playing");
					$("#xaudioplayer")[0].play();
				
				}
				
				break;
			
			case "youtube":
				
				if ($("div#xplayer").hasClass("playing")) {
				
					$("div#xplayer").removeClass("playing");
					youtubeplayer.pauseVideo();
				
				} else {
				
					$("div#xplayer").addClass("playing");
					youtubeplayer.playVideo();
				
				}
				
				break;
			
			case "soundcloud":
					
				if ($("div#xplayer").hasClass("playing")) {
				
					$("div#xplayer").removeClass("playing");
					soundcloudplayer.pause();
				
				} else {
				
					$("div#xplayer").addClass("playing");
					soundcloudplayer.play();
				
				}
				
				break;
			
		}
		
	}
	
	skipBackward () {
		
		switch (player.getInfo('type')) {
			
			case "audio":
			
				// skip backward 15 seconds from the current time
				$("#xaudioplayer")[0].currentTime -= 15;
				
				break;
			
			case "youtube":
			
				// get the current time of the video
				var currentTime = youtubeplayer.getCurrentTime();
				
				// skip backward 15 seconds from the current time
				youtubeplayer.seekTo(Number(currentTime - 15));
				
				break;
			
			case "soundcloud":
			
				// get the current time of the soundcloud player
				soundcloudplayer.getPosition(function (milliseconds) {
					
					// skip backward 15 seconds from the current time
					soundcloudplayer.seekTo(milliseconds - 15000);
					
				});
				
				break;
		
		}
		
	}
	
	skipForward () { 
		
		switch (player.getInfo('type')) {
			
			case "audio":
				
				// skip forward 15 seconds from the current time
				$("#xaudioplayer")[0].currentTime += 15;
				
				break; 
			
			case "youtube":
				
				// get the current time of the video
				var currentTime = youtubeplayer.getCurrentTime();
				
				// skip forward 15 seconds from the current time
				youtubeplayer.seekTo(Number(currentTime + 15));
				
				break; 
				
			case "soundcloud":
			
				// get the current time of the soundcloud player
				soundcloudplayer.getPosition(function (milliseconds) {
					
					// skip forward 15 seconds from the current time
					soundcloudplayer.seekTo(milliseconds + 15000);
					
				});
				
				break; 
					
		}
		
	}
	
	volumeSlider (position, volume) {
		
		switch (player.getInfo('type')) {
			
			case "audio":
			
				// get the audio player
				var audioplayer = document.getElementById("xaudioplayer");
				
				// unmute the audio
				audioplayer.muted = false;
				
				// set the volume level to the slider volume
				audioplayer.volume = Number(volume/100);
				
				break;
						
			case "youtube":
				
				// unmute the video
				youtubeplayer.unMute();
				
				// set the volume level to the slider volume
				youtubeplayer.setVolume(volume);
				
				break;
			
			case "soundcloud":
			
				// set the volume level to the slider volume
				soundcloudplayer.setVolume(Number(volume));			

				break;
		
		}
		
		// if the volume slider is higher than 0%
		if (volume > 0) {
			
			// set volume to unmuted
			$("div.xplayer-volume").removeClass("xmute");
		
		} else {
			
			// set volume to muted
			$("div.xplayer-volume").addClass("xmute");
			
		}
		
	}
	
	muteVolume () {
		
		switch (player.getInfo('type')) {
			
			case "audio":
			
				if ($("div.xplayer-volume").hasClass("xmute")) {
				
					$("div.xplayer-volume").removeClass("xmute");
					$("#xaudioplayer").prop("muted", false);
				
				} else {
					
					$("div.xplayer-volume").addClass("xmute");
					$("#xaudioplayer").prop("muted", true);
					
				}
				break;
				
			case "youtube":
			
				if ($("div.xplayer-volume").hasClass("xmute")) {
				
					$("div.xplayer-volume").removeClass("xmute");
					youtubeplayer.unMute();
					
				} else {
					
					$("div.xplayer-volume").addClass("xmute");
					youtubeplayer.mute();
					
				}
				break;
				
			case "soundcloud":
				
				if ($("div.xplayer-volume").hasClass("xmute")) {
			
					$("div.xplayer-volume").removeClass("xmute");
					soundcloudplayer.setVolume(0.5);		

				} else {
					
					$("div.xplayer-volume").addClass("xmute");
					soundcloudplayer.setVolume(0);	
					
				}
				break;
		}
		
	}
	
}

var player = new players();