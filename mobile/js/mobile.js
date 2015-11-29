/* global VK, io */

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isinteger */
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};

(function($) {
    $.flittr = $.flittr || {};

    var socket = io.connect('https://api.flittr.ru:8443');
    var $playlist = null;
    var $connectionMessage = null;
    var helpMessage = "";
    
    function updatePlaylist(items, searchType, genre_id) {
        if (!$playlist) { return; }
        $playlist.empty();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (Number.isInteger(item)) { continue; }
            var button = $('<button/>')
                .attr({ 'type': 'button', 'class': 'list-group-item playlist-item', 'data-itemuid': item.owner_id + '_' + item.aid })
                .text(item.artist + ' - ' + item.title);
            $playlist.append(button);
        }
        $('.playlist-item').on('click', function(e, o){
            playItem(e.currentTarget.getAttribute('data-itemuid'));
            $('.playlist-item').removeClass('active');
            e.currentTarget.className += " active";
        });
        // Tiny hack: after pleylist updated, we use first track as first played.
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, { command: CMD_GET_TRACK_INFO, timestamp: getTimestamp() });
        
        // SearchType
        searchType = searchType || CMD_OPEN_MY_AUDIO;
        var button = 'my-music';
        $('#search-button').removeClass('btn-primary');
        switch (searchType) {
            case CMD_OPEN_MY_AUDIO:
                button = 'my-music';
                break;
            case CMD_OPEN_RECOMENDATION:
                button = 'my-suggestion';
                break;
            case CMD_OPEN_POPULAR:
                button = 'my-popular';
                $('.my-music-my-popular > button').removeClass('active');
                if (genre_id) {
                    $('.my-music-my-popular > button[data-genreid="' + genre_id + '"]').addClass('active');
                }
                break;
            case CMD_OPEN_ALBUM:
                button = 'my-albums';
                break;
            case CMD_SEARCH:
                $('#search-button').addClass('btn-primary');
                button = '';
                break;
            default:
                // code
        }
        $('.vk-music-type').removeClass('active');
        $('#' + button).addClass('active');
        $('.my-music-group').hide();
        $('.my-music-' + button).show();
    }
    
    // updateInfo
    var seekerWidth = 260;
    var volumeWidth = 100;
    var $mejsVolumeHandle = null;
    var $mejsTimeHandle = null;
    function updateInfo(info) {
        if (info.paused) {
            $('.mejs-playpause-button').removeClass('mejs-pause').addClass('mejs-play');
        } else {
            $('.mejs-playpause-button').addClass('mejs-pause').removeClass('mejs-play');
        }
        // Seeking
        var timePosition = seekerWidth / info.duration * info.currentTime;
        $mejsTimeHandle.css('left', timePosition + 'px');
        var volumePosition = info.muted ? 0 : volumeWidth * info.volume;
        $mejsVolumeHandle.width(volumePosition);
    }
    
    function updateTrack(info) {
        $('#song-title').text(info.title);
        $('#song-author').text(info.artist);
        
        $('.playlist-item').removeClass('active');
        $('.playlist-item[data-itemuid="' + [info.owner_id, info.aid].join('_') + '"]').addClass("active");
        
            var url = '//ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=ea60754e43d25c15169e06acef140b48&artist=' + info.artist + '&track=' + info.title + '&format=json&autocorrect=1';
            $.getJSON(url,
                function (response) {
                    var image = 'images/au.jpg';
                    if(response && response.track && response.track.album && response.track.album.image) {
                        $.each(response.track.album.image, function(key, value) {
                            if(value && value.size && value.size == 'large') {
                                image = value['#text'];
                            }
                        });
                    }
                    $('#song-cover').attr('src', image);
            }
        );
    }
    
    function playItem(aid) {
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, { command: CMD_PLAY_TRACK, aid: aid});
    }

    function playerForward() {
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
            command: CMD_NEXT_TRACK
        });
        return false;
    }
    
    function playerBackward() {
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
            command: CMD_PREV_TRACK
        });
        return false;
    }

    function playerPlayPause() {
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
            command: CMD_PLAY
        });
        return false;
    }

    function playerMute() {
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
            command: CMD_MUTE
        });
        return false;
    }

    
    function parseCommand(data) {
        switch (data.message) {
            case MSG_PLAYLIST_UPDATED:
                updatePlaylist(data.items, data.searchType, data.genre_id);
                break;
            case MSG_DESKTOP_INFO:
                updateInfo(data.info);
                break;
            case MSG_TRACK_PLAY:
                updateTrack(data.info);
                break;
            case MSG_SEARCH:
                $('#search').val(data.search);
                break;
            default:
                // code
        }
    }
    
    
    // Socket handling 
    socket.on('message', function(data) {
        var txt = data.message;
        console.log('message: ' + txt);
        switch (data.message) {
            case 'desktop connected':
                hideHostErrorMessage();
                break;
            case 'desktop disconnected':
                showHostErrorMessage();
                break;
            case 'desktop offline':
                showHostErrorMessage();
                break;
            default:
                // code
        }
    });
    
    socket.on('command', function(data) {
        var txt = data.data.command || data.data.action || data.data.message;
        console.log(data.command + ': ' + txt);
        switch (data.command) {
            case 'command':
                parseCommand(data.data);
                break;
            default:
                // code
        }
    });
    
    socket.io.on('connect_error', function(data) {
        console.log('Socket: ' + data.type + ': ' + data.message);
        showServerErrorMessage();
    });
    
    
    // Visual reconstructuction
    function registerUser (session) {
        socket.emit('register mobile', session);
    }
    
    function showLoginButton() {
        $('#login-button-container').show();
        $('#main-container').hide();
    }

    function hideLoginButton() {
        $('#login-button-container').hide();
        $('#main-container').show();
    }
    
    function showServerErrorMessage() {
        helpMessage = 'Окей. Все плохо. Правда. Если вы видите эту ошибку, значит наш крохотный сервер загнулся от нагрузки, которая пришла по его душу. '
        + 'Что ж, придется немного потерпеть. Или написать разработчикам. См. нашу группу http://vk.com/flittr чтобы связаться с ними.';
        $connectionMessage.children('h3').text('Ошибка сети'); 
        $connectionMessage.children('a').show();
        $connectionMessage.removeClass('good');
        $connectionMessage.show();
        $('.hide-on-error').hide();
    }
    
    function showHostErrorMessage() {
        helpMessage = 'Такая ошибка происходит, когда вы не запустили второе приложение. Попробуйте открыть свой любимый Google Chrome (на компьютере), '
            + 'далее через меню -> Дополнительные иструменты -> Расширения -> Еще расширения и потом набрать в поиске "Flittr" (без кавычек). '
            + 'После установки расширения должна появиться небольшая кнопочка в виде зеленой нотки. Нажмите ее и откроется приложение ВКонтакте. '
            + 'Вот оно-то и проигрывает музыку. Без него ваша замечательная Android программа даже и не подумает запуститься =). '
            + 'Также, после всех этих манипуляций попробуйте нажать на значок перезагрузки справа от ошибки. Это на всякий случай.';
        $connectionMessage.children('h3').text('Нет соединения');
        $connectionMessage.children('a').show();
        $connectionMessage.removeClass('good');
        $connectionMessage.show();
        $('.hide-on-error').hide();
    }
    
    function hideHostErrorMessage() {
        $connectionMessage.addClass('good');
        $connectionMessage.hide();
        $('.hide-on-error').show();
    }
    
    function getTimestamp() {
        return Date.now() / 1000 | 0;
    }
    
    function getStartupInfo() {
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, { command: CMD_GET_PLAYLIST, timestamp: getTimestamp() });
        socket.emit(CMD_GENERAL_MOBILE_COMMAND, { command: CMD_GET_TRACK_INFO, timestamp: getTimestamp() });
    }
    
    $.flittr.authInfo = function(response) {
        if (response.session) {
            hideLoginButton();
            registerUser(response.session);
            getStartupInfo();
        } else {
            showLoginButton();
        }
    };
    
    // Help supporter
    $.flittr.help = function() {
        $('#help-info').toggle();
        $('#help-info p').text(helpMessage);
        return false;
    }
    
    // Startup initialization
    $.flittr.init = function(config) {
        
        config = config || {};
        
        // VK
        VK.init({
            apiId: config.appId
        });
        VK.Auth.getLoginStatus($.flittr.authInfo);
                
        // Interface
        $playlist = $('#playlist-container');
        $connectionMessage = $('#no-connection');
        seekerWidth = $('.mejs-time-total').width();
        volumeWidth = $('.mejs-horizontal-volume-total').width();
        $mejsTimeHandle = $('.mejs-time-handle');
        $mejsVolumeHandle = $('.mejs-horizontal-volume-current');
        
        // Interface handling
        $('.reload img').on('mouseover', function(e){
            this.className += ' rotated';
        });
        $('.reload img').on('mouseleave', function(e){
            $(this).removeClass('rotated');
        });
        
        // Handling
        $('#player-backward').on('click', playerBackward);
        $('#player-forward').on('click', playerForward);
        $('.mejs-playpause-button > button').on('click', playerPlayPause);
        $('.mejs-mute > button').on('click', playerMute);
        
        // Seekers
        $('.mejs-time-total').on('mousedown', function(e) {
            var offset = e.offsetX / seekerWidth;
            $mejsTimeHandle.css('left', e.offsetX + 'px');
            socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
                command: CMD_SET_TRACK_SCROLL,
                scroll: offset
            });
        });
        $('.mejs-horizontal-volume-total, .mejs-horizontal-volume-current').on('mousedown', function(e) {
            var offset = e.offsetX / volumeWidth;
            $mejsVolumeHandle.width(e.offsetX);
            socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
                command: CMD_SET_VOLUME,
                volume: offset
            });
        });
        // Search buttoms
        $('.vk-music-type > a').on('click', function(e) {
            $('.vk-music-type').removeClass('active');
            // this == '<a>'
            this.parentNode.className += ' active';
            $('.my-music-group').hide();
            $('.my-music-' + this.parentNode.id).show();
            
            switch (this.parentNode.id) {
                case 'my-music':
                    socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
                        command: CMD_OPEN_MY_AUDIO,
                    });
                    break;
                case 'my-suggestion':
                    socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
                        command: CMD_OPEN_RECOMENDATION,
                    });
                    break;
                case 'my-popular':
                    $('.my-music-my-popular > button').removeClass('active');
                    break;
                default:
                    // code
            }
            return false;
        });
        $('.my-music-my-popular > button').on('click', function(e) {
            $('.my-music-my-popular > button').removeClass('active');
            // this == button
            this.className += ' active';
            socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
                command: CMD_OPEN_POPULAR,
                genre_id: this.getAttribute('data-genreid')
            });
        });
        // Search code
        $('#search')
        .on('focus', function(e) {
            $('.vk-music-type').removeClass('active');
            // Save previous search directly in search field
            this['data-lastsearch'] = this.value;
        })
        .on('blur', function(e) {
            var search = this.value;
            if (search != '' && search != this.getAttribute('data-lastsearch')) {
                $('.my-music-group').hide();
                socket.emit(CMD_GENERAL_MOBILE_COMMAND, {
                    command: CMD_SEARCH,
                    search: search,
                    performer_only: this.getAttribute('data-performeronly')
                })
            }
        });
        $('.search-button-performeronly-link').on('click', function(e) {
            $('#search').attr('data-performeronly', this.getAttribute('data-performeronly'));
            $('#search-button').html(this.innerText + ' <span class="caret"></span>');
        });
    };
    
})(jQuery);