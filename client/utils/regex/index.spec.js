import * as regexes from './index.js';

describe('Regex', () => {
  it('emailRegex', () => {
    expect(regexes.emailRegex.test('messi@arep.co')).toBe(true);
    expect(regexes.emailRegex.test('robert@arep.co')).toBe(true);
    expect(regexes.emailRegex.test('a@a')).toBe(false);
    expect(regexes.emailRegex.test('a*&*%#()@arep.co')).toBe(false);
    expect(regexes.emailRegex.test('only_text')).toBe(false);
  });
  it('urlRegex', () => {
    expect(regexes.urlRegex.test('https://app.audiencerepublic.com/')).toBe(true);
    expect(regexes.urlRegex.test('https://www.audiencerepublic.com/')).toBe(true);
    expect(regexes.urlRegex.test('http://www.audiencerepublic.com/')).toBe(true);
    expect(regexes.urlRegex.test('https://app.audiencerepublic.com/campaigns/3291/edit/connect?key=premium')).toBe(true);
    expect(regexes.urlRegex.test('https:app.audiencerepublic.com/')).toBe(false);
    expect(regexes.urlRegex.test('aaa https:app.audiencerepublic.com/')).toBe(false);
    expect(regexes.urlRegex.test('https://')).toBe(false);
  });
  it('csvFileNameRegex', () => {
    expect(regexes.csvFileNameRegex.test('ddd.csv')).toBe(true);
    expect(regexes.csvFileNameRegex.test('ddd.txt')).toBe(false);
  });
  it('hexColorCodeRegex', () => {
    expect(regexes.hexColorCodeRegex.test('#ffffff')).toBe(true);
    expect(regexes.hexColorCodeRegex.test('#fff')).toBe(true);
    expect(regexes.hexColorCodeRegex.test('rbga(0,0,0,0.5)')).toBe(false);
  });
  it('cssLengthRegex', () => {
    expect(regexes.cssLengthRegex.test('10px')).toBe(true);
    expect(regexes.cssLengthRegex.test('30rem')).toBe(true);
    expect(regexes.cssLengthRegex.test('hello')).toBe(false);
  });
  it('audienceRepublicOptOutLinkRegex', () => {
    expect(regexes.audienceRepublicOptOutLinkRegex.test('https://www.audiencerepublic.com/campaigns')).toBe(false);
    expect(regexes.audienceRepublicOptOutLinkRegex.test('https://arep.co/p/hello')).toBe(false);
    expect(regexes.audienceRepublicOptOutLinkRegex.test('https://dev-manage.arep.co/xxxxx')).toBe(true);
    expect(regexes.audienceRepublicOptOutLinkRegex.test('https://m.arep.co/xxxxx')).toBe(true);
    expect(regexes.audienceRepublicOptOutLinkRegex.test('https://www.google.com/')).toBe(false);
  });
  it('facebookUrlRegex', () => {
    expect(regexes.facebookUrlRegex.test('https://www.facebook.com/username')).toBe(true);
    expect(regexes.facebookUrlRegex.test('https://facebook.com/username')).toBe(true);
    expect(regexes.facebookUrlRegex.test('www.facebook.com/username')).toBe(false);
    expect(regexes.facebookUrlRegex.test('facebook.com/username')).toBe(false);
    expect(regexes.facebookUrlRegex.test('https://www.google.com/')).toBe(false);
  });
  it('facebookEventUrlRegex', () => {
    expect(regexes.facebookEventUrlRegex.test('https://www.facebook.com/events/905913189742039/')).toBe(true);
    expect(regexes.facebookEventUrlRegex.test('www.facebook.com/events/905913189742039/')).toBe(false);
    expect(regexes.facebookEventUrlRegex.test('https://facebook.com/events/905913189742039/')).toBe(true);
    expect(regexes.facebookEventUrlRegex.test('facebook.com/events/905913189742039/')).toBe(false);
    expect(regexes.facebookEventUrlRegex.test('https://www.google.com/')).toBe(false);
  });
  it('instagramUsernameRegex', () => {
    expect(regexes.instagramUsernameRegex.test('user_name')).toBe(true);
    expect(regexes.instagramUsernameRegex.test('*&^')).toBe(false);
  });
  it('twitterUsernameRegex', () => {
    expect(regexes.twitterUsernameRegex.test('@user_name')).toBe(true);
    expect(regexes.twitterUsernameRegex.test('user_name')).toBe(true);
    expect(regexes.twitterUsernameRegex.test('*&^')).toBe(false);
  });
  it('snapchatAccountRegex', () => {
    expect(regexes.snapchatAccountRegex.test('user_na.me')).toBe(true);
    expect(regexes.snapchatAccountRegex.test('*&^')).toBe(false);
  });
  it('youtubeChannelUrlRegex', () => {
    expect(regexes.youtubeChannelUrlRegex.test('https://www.youtube.com/channel/UC1oPBUWifc0QOOY8DEKhLuQ')).toBe(true);
    expect(regexes.youtubeChannelUrlRegex.test('www.youtube.com/channel/UC1oPBUWifc0QOOY8DEKhLuQ')).toBe(false);
    expect(regexes.youtubeChannelUrlRegex.test('https://youtube.com/channel/UC1oPBUWifc0QOOY8DEKhLuQ')).toBe(true);
    expect(regexes.youtubeChannelUrlRegex.test('youtube.com/channel/UC1oPBUWifc0QOOY8DEKhLuQ')).toBe(false);
    expect(regexes.youtubeChannelUrlRegex.test('https://www.youtube.com/watch?v=UkK3yOe_f5k')).toBe(false);
  });
  it('spotifyTrackUrlRegex', () => {
    expect(regexes.spotifyTrackUrlRegex.test('https://open.spotify.com/track/xxxx')).toBe(true);
    expect(regexes.spotifyTrackUrlRegex.test('https://open.spotify.com/artist/xxxx')).toBe(false);
  });
  it('spotifyArtistUrlRegex', () => {
    expect(regexes.spotifyArtistUrlRegex.test('https://open.spotify.com/artist/xxxx')).toBe(true);
    expect(regexes.spotifyArtistUrlRegex.test('https://open.spotify.com/track/xxxx')).toBe(false);
  });
  it('spotifyPlaylistUrlRegex', () => {
    expect(regexes.spotifyPlaylistUrlRegex.test('https://open.spotify.com/playlist/xxxx')).toBe(true);
    expect(regexes.spotifyPlaylistUrlRegex.test('https://open.spotify.com/track/xxxx')).toBe(false);
  });
});
