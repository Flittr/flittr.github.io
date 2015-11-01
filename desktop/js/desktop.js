/* global VK, io */
/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isinteger */
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};

(function($) {

    var socket = io.connect('https://api.flittr.ru:8443');
    var $playercontainer = $('#player-container');
    var volumeLevel = 0.5;
    var lastLoadedPlaylist = [];
    var $player = null;
    var firstLoad = true;
    var currentSearchType = CMD_OPEN_MY_AUDIO;
    var currentPopularGenre = null;
    var currentTrackId = -1;
    var currentTrackInfo = null;

    socket.on("message", function(data) {
        console.log("Message:" +  data.message);
    });

    socket.on('action', function(data) {
        console.log("Action: " + data.action);
    });
    
    socket.on('command', function(data) {
        var txt = data.data.command || data.data.action || data.data.message;
        console.log(data.command + ': ' + txt);
        switch (data.command) {
            case 'command':
                parseCommand(data.data);
                break;
            default: 
                break;
        }
    });
    
    function parseCommand(data) {
        switch (data.command) {
            case CMD_GET_PLAYLIST:
                sendPlaylistUpdates(lastLoadedPlaylist);
                break;
            case CMD_PLAY_TRACK:
                playTrack(data.aid);
                break;
            case CMD_NEXT_TRACK:
                $player.player.playNextTrack();
                break;
            case CMD_PREV_TRACK:
                $player.player.playPrevTrack();
                // $('.mejs-prevtrack').trigger('click');
                break;
            case CMD_PLAY:
                $('.mejs-playpause-button').trigger('click');
                break;
            case CMD_GET_TRACK_INFO:
                sendTrackInfo($player.player, null);
                sendSearchInfo($('#search').val());
                break;
            case CMD_SET_TRACK_SCROLL:
                if (!isNaN($player.duration)) {
                    $player.setCurrentTime($player.duration * data.scroll);
                }
                break;
            case CMD_SET_VOLUME:
                if (!isNaN($player.duration)) {
                    $player.setVolume(data.volume);
                }
                break;
            case CMD_MUTE:
                $player.setMuted(!$player.muted);
                break;
            case CMD_SEARCH:
                currentSearchType = data.command;
                if (data.search != $('#search').val()) {
                    $('#search').val(data.search);
                    makeSearch(data.search, data.performer_only);
                }
                break;
            case CMD_OPEN_MY_AUDIO:
                currentSearchType = data.command;
                loadUserTracks();
                break;
            case CMD_OPEN_RECOMENDATION:
                currentSearchType = data.command;
                VK.api('audio.getRecommendations', 
                {
                    'count': 30,
                },
                function(data) { 
                    if (data.response) {
                        parsePlaylist(data.response);
                    }
                });
                break;
            case CMD_OPEN_POPULAR:
                currentSearchType = data.command;
                currentPopularGenre = data.genre_id;
                VK.api('audio.getPopular', 
                {
                    'genre_id': data.genre_id,
                },
                function(data) { 
                    if (data.response) {
                        parsePlaylist(data.response);
                    }
                });
                break;
            default:
                break;
        }
    }
    
    function playFile(src) {
        $player.setSrc([{'src': src, 'type': 'audio/mpeg'}]);
        $player.play();
        playerWidthFix();
    }
    
    function playTrack(aid) {
        var info = aid.split('_');
        var subCurrentTrackId = currentTrackId;
        var track = lastLoadedPlaylist.find(function (element, index, array) {
            if (Number.isInteger(element)) { return false; }
            subCurrentTrackId = index;
            return element.owner_id == info[0] && element.aid == info[1];
        });
        if (track) {
            currentTrackId = subCurrentTrackId;
            $('ul.mejs li[data-url="' + track.url + '"]').trigger('click');
        }
    }
    
    function sendPlaylistUpdates(items) {
        socket.emit(CMD_GENERAL_DESKTOP_COMMAND, {
            message: MSG_PLAYLIST_UPDATED,
            items: items,
            searchType: currentSearchType,
            genre_id: currentPopularGenre
        });
    }
    
    function sendInfo(mediaElement, e) {
        socket.emit(CMD_GENERAL_DESKTOP_COMMAND, {
            message: MSG_DESKTOP_INFO,
            info: {
                currentTime: mediaElement.currentTime,
                duration: mediaElement.duration,
                volume: mediaElement.volume,
                paused: mediaElement.paused,
                muted: mediaElement.muted,
                ended: mediaElement.ended
            }
        });
    }
    
    function sendTrackInfo(mediaElement, e) {
        var item = lastLoadedPlaylist.find(function(element, index, array) {
            if (Number.isInteger(element)) { return false; }
            return element.url == $player.src;
        });
        if (item) {
            currentTrackInfo = {
                    title: item.title,
                    artist: item.artist,
                    owner_id: item.owner_id,
                    aid: item.aid
            };
            VK.callMethod("setTitle", item.title + ' - ' + item.artist);
        }
        socket.emit(CMD_GENERAL_DESKTOP_COMMAND, {
            message: MSG_TRACK_PLAY,
            info: currentTrackInfo
        });
    }
    
    function sendSearchInfo(search) {
        socket.emit(CMD_GENERAL_DESKTOP_COMMAND, {
            message: MSG_SEARCH,
            search: search
        });
    }
    
    function makeSearch(search, performer_only) {
        VK.api('audio.search', 
        {
            'q': search,
            'count': '30',
            'performer_only': performer_only
        },
        function(data) { 
            if (data.response) {
                parsePlaylist(data.response);
            }
        });
    }
    
    function playerWidthFix() {
        // Tiny fix
        setTimeout(function() {
            $('.mejs-controls').width($('.mejs-controls').width() + 3);
        }, 3000);            
    }
    
    function parsePlaylist(response) {
        if (firstLoad) {
            parsePlaylistGeneral(response);
            playerWidthFix();
        } else {
            var $playlistContainer = $('.mejs-playlist ul');
            $playlistContainer.empty();
            for(var i = 0; i < response.length; i++) {
                var item = response[i];
                if (Number.isInteger(item)) { continue; }
                var $li = $('<li/>', {
                    'data-url': item.url,
                    'title': item.artist + ' - ' + item.title
                })
                .text(item.artist + ' - ' + item.title)
                .on('click', function(e) {
                    $('ul.mejs li').removeClass('current');
                    this.className = 'current';
                    sendTrackInfo($player, e);
                    playFile(this.dataset.url);
                });
                $playlistContainer.append($li);
            }
            lastLoadedPlaylist = response;
            sendPlaylistUpdates(response);
        }
    }
    
    function parsePlaylistGeneral(response) {
        $playercontainer.empty();
        var audio = $('<audio>')
            .attr({ id: "audioblock", 'class': "progression-playlist progression-skin progression-minimal-light progression-audio-player", 
                    controls: "controls", preload: "none"});
        currentTrackId = 0;
        for(var i = 0; i < response.length; i++) {
            var item = response[i];
            if (Number.isInteger(item)) { currentTrackId = 1; continue; }
            var source = $('<source/>')
                .attr({ 'src': item.url, 'title': item.artist + ' - ' + item.title, type: "audio/mpeg" });
            audio.append(source);
        }
        $playercontainer.append(audio);
        // Initialization
        $('.progression-playlist').mediaelementplayer({
        	audioWidth:     400, // width of audio player
        	audioHeight:    40, // height of audio player
        	startVolume: volumeLevel, // initial volume when the player starts
        	loop: false, // useful for <audio> player loops
        	features: ['playlistfeature', 'prevtrack', 'playpause', 'nexttrack','current', 'progress', 'duration', 'volume', 'playlist'],
        	playlist: true, //Playlist Show
        	playlistposition: 'bottom', //Playlist Location
            success: function(mediaElement, originalNode) {
                // add event listener
                mediaElement.addEventListener('timeupdate', function(e) {
                    sendInfo(mediaElement, e);
                }, false);
                mediaElement.addEventListener('play', function(e) {
                    sendTrackInfo(mediaElement, e);
                }, false);
                mediaElement.addEventListener('ended', function(e) {
                    playFile(lastLoadedPlaylist[++currentTrackId]);
                }, false);
                $player = mediaElement;
                if (firstLoad) {
                    firstLoad = false;
                } else {
                    $player.play();
                }
            }
        });
    	lastLoadedPlaylist = response;
    	sendPlaylistUpdates(response);
    }
    
    
    function loadUserTracks(userId) {
        VK.api('audio.get', 
            {
                'owner_id': userId,
                'need_user': '0'
            },
            function(data) { 
                if (data.response) {
                    parsePlaylist(data.response);
                }
            });
    }
    
    function registerUser (response) {
        socket.emit('register desktop', response);
        loadUserTracks(response.uid);
    }
    
    $(document).ready(function(){
        VK.init(function(data) {
            VK.api('users.get', {}, function(data) { 
                if (data.response && data.response[0]) { 
                    registerUser(data.response[0]);
                }
                $('#go-search').on('click', function() {
                    var search = $('#search').val();
                    sendSearchInfo(search);
                    makeSearch(search);
                });
            });
        }); 
    });
    
})(jQuery);