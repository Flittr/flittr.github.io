// tries to open reg page
var CONST_PAGEOPENS = 1;

// General
var CMD_GENERAL_DESKTOP_COMMAND = "desktop command";
var CMD_GENERAL_MOBILE_COMMAND = "mobile command";

// Playlist
var MSG_PLAYLIST_UPDATED = 'desktop_playlist_updated';
var CMD_GET_PLAYLIST = 'get_desktop_playlist';

// Player info
var MSG_DESKTOP_INFO = 'desktop_info';
var MSG_TRACK_PLAY = 'desktop_info_track_played';
var CMD_GET_TRACK_INFO = "get_track_info";

// Volume
var CMD_GET_VOLUME_VALUE = "get_volume_value";
var CMD_SET_VOLUME = "set_volume";
var CMD_MUTE = "mute_unmute";

// Commands to server
var CMD_DISCONNECT = "disconnect";
var CMD_OPENPAGE = "openpage";

// Commands to extension
var CMD_SERVER_INFO = "server_info";
var CMD_GET_SERVER_INFO = "get_server_info";
var CMD_PLAYER_COOKIE = "vk_remote_player_started";

// Commands to manage search
var CMD_SEARCH = "audio_search";
var CMD_GET_SEARCH_INFO = "get_audio_search_info";
var MSG_SEARCH = "audio_search_info";

var CMD_PLAY = "audio_play";
var CMD_PLAY_TRACK = "audio_play_track";
var CMD_PREV_TRACK = "audio_prev";
var CMD_NEXT_TRACK = "audio_next";

var CMD_OPEN_MY_AUDIO = "open_my_audio";
var CMD_OPEN_FRIENDS_UPDATES = "open_friends_updates";
var CMD_OPEN_RECOMENDATION = "open_recomendation";
var CMD_OPEN_POPULAR = "open_popular";
var CMD_OPEN_ALBUM = "open_album";

var CMD_GET_PLAY_STATE = "get_play_state";
var CMD_UPDATE_PAGE_INFO = "update_page_info";
var CMD_PAGE_INFO_UPDATED = "page_info_updated";

var CMD_SET_TRACK_SCROLL = "set_track_scroll";

var CMD_ADD_TRACK = "add_track";
var CMD_REPEAT_TRACK = "repeat_track";
var CMD_SHUFFLE = "shuffle_tracks";
var CMD_SHOW_RECOMENDATIONS = "show_recomendation";
var CMD_STATUS = "turn_status";

var CMD_GET_SAVED_URL = "get_saved_url";
var CMD_SET_SAVED_URL = "set_saved_url";

// Message type
var MSG_AUDIO_INFO = "audio_info";

// UI elements on vk.com/audio page
var PLAY_BUTTON_ID = "ac_play";
var PREV_BUTTON_ID = "ac_prev";
var NEXT_BUTTON_ID = "ac_next";

var MY_AUDIO_BUTTON_ID = "album0";
var FRIENDS_UPDATES_BUTTON_ID = "feed_filter";
var RECOMENDATION_BUTTON_ID = "recommendations";
var POPULAR_BUTTON_ID = "top_audios";
var FILTER_BUTTON_ID = "album_filtered";
var ALBUM_BUTTON_QUERY = "#audio_albums_wrap .audio_filter.selected";

var TRACK_ARTIST_TEXT = "ac_performer";
var TRACK_NAME_TEXT = "ac_title";
var TRACK_DURATION = "ac_duration";

var PLAY_BUTTON_STATE_INACTIVE = "fl_l";
var PLAY_BUTTON_STATE_PLAYING = "fl_l playing";
var PLAY_BUTTON_STATE_OVER = "fl_l over";
var PLAY_BUTTON_STATE_PLAYING_OVER = "fl_l playing over";
var PLAY_BUTTON_IS_PLAYING = "playing";

var SEARCH_FIELD_ID = "s_search";

var VOLUME_LINE = "ac_vol";
var VOLUME_BACK_LINE = "ac_vol_back_line";
var VOLUME_LINE_CURRENT = "ac_vol_line";
var VOLUME_SLIDER = "ac_vol_slider";

var TRACK_LINE_BACK = "ac,back_line";
var TRACK_LINE_CURRENT = "ac_pr_line";

var ADD_TRACK_BUTTON = "ac_add";
var REPEAT_BUTTON = "ac_repeat";
var SHUFFLE_BUTTON = "ac_shuffle";
var SHOW_REC_BUTTON = "ac_rec";
var STATUS_BUTTON = "ac_status";