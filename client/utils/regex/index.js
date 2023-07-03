// For email
export const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

// Dynamic Tags
export const arDynamicTagsRegex = /{{([a-zA-Z0-9-_]+)}}/;
export const arDynamicTagsRegexGlobal = new RegExp(arDynamicTagsRegex, 'g');

// Pixels
export const googleTagManagerIdRegex = /^GTM-[A-Z0-9]{1,7}$/;
export const googleAnalyticsIdRegex = /^(G|UA|YT|MO)-[a-zA-Z0-9-]+$/;
export const facebookPixelIdRegex = /^[0-9]+$/

// Is it the file name of csv ?
export const csvFileNameRegex = /\.csv$/;

// Is the color written in hex ?
export const hexColorCodeRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;

// Is it the css length ?
export const cssLengthRegex = /^(auto|0)$|^[+-]?[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)$/;

// Is it the Audience Republic url ?
export const audienceRepublicOptOutLinkRegex = /^(?:https:\/\/)?(([a-z\-]*manage|m)\.arep\.co)\/.*$/;
export const audienceRepublicShortlinkRegex = /^(?:https:\/\/)?(([a-z0-9]*)\.arep\.co)\/([a-zA-Z0-9]){5,10}$/;

// Is it the fb url ?
export const facebookUrlRegex = /^(?:https:\/\/)(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w-]*)?/;

// Is it the fb event url ?
export const facebookEventUrlRegex = /^(?:https:\/\/)(?:www\.)?facebook\.com\/events\/(\d{10,20})\/?$/;

// Is it the IG username ?
export const instagramUsernameRegex = /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$/;

// Is it the twitter username ?
export const twitterUsernameRegex = /^@?(\w){1,15}$/;

// Is it the snapchat account ?
export const snapchatAccountRegex = /^[a-z][0-9a-z\-_\.]{1,13}[0-9a-z]$/;

// Is it the youtube (channel, user) url ?
export const youtubeChannelUrlRegex = /^(?:https:\/\/)(?:www\.)?youtube\.com\/(c\/|channel\/|user\/|@)?[a-zA-Z0-9\-_]{1,}$/;

// Is it the url from youtube ?
export const youtubeUrlRegex = /^(https:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

// Is it the spotify trakc url ?
export const spotifyTrackUrlRegex = /^((spotify:|https:)\/\/[a-z]+\.spotify\.com\/track)/;

// Is it the spotify artist url ?
export const spotifyArtistUrlRegex = /^((spotify:|https:)\/\/[a-z]+\.spotify\.com\/(artist|user))/;

// Is it the spotify playlist url ?
export const spotifyPlaylistUrlRegex = /^((spotify:|https:)\/\/[a-z]+\.spotify\.com\/(playlist|(user\/\S+\/playlist)))/;

// Is it the spotify album url ?
export const spotifyAlbumUrlRegex = /^((spotify:|https:)\/\/[a-z]+\.spotify\.com\/(album|(user\/\S+\/album)))/;

// Is it the spotify podcaster url ?
export const spotifyPodcasterUrlRegex = /^((spotify:|https:)\/\/[a-z]+\.spotify\.com\/(show|(user\/\S+\/show)))/;

// Is it the spotify podcast url ?
export const spotifyPodcastUrlRegex = /^((spotify:|https:)\/\/[a-z]+\.spotify\.com\/(episode|(user\/\S+\/episode)))/;

// Is it a vimeo url
export const vimeoUrlRegex = /^(https:\/\/)?(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)$/;

// Is it a Zoom url, will need better regex for it, but for now it should be good.
export const zoomUrlRegex = /^(https:\/\/)?(www\.)?(.+)zoom.us\/.+/;

// Is it a valid url
export const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Matches all URLs in a string
export const urlsRegex = /((?:([a-z][\w-]+:(?:\/{1,3}|[a-z0-9%]))|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»""'']))/gi;

// Is it a LinkedIn URL?
export const linkedinRegex = /((https?:\/\/)?((www|\w\w)\.)?linkedin\.com\/)((([\w]{2,3})?)|([^\/]+\/(([\w|\d-&#?=])+\/?){1,}))$/

// Is it a TikTok username?
export const tiktokRegex = /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$/;

// Is it a Twitch URL?
export const twitchRegex = /https:\/\/(?:clips|www)\.twitch\.tv\/(?:(?:[a-z])\/clip\/)?([a-zA-Z]+)/;
