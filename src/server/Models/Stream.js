/*
  The main Twitch API call returns:
  id, user_id, game_id, community_ids, type (live), title, viewer_count (current), started_at, language, thumbnail_url
  { id: '30023181632',
  user_id: '22253819',
  game_id: '21779',
  community_ids: [ '36cb379b-f9f3-4390-a2fb-a7d3df91208b' ],
  type: 'live',
  title: 'My life is entirely league + wow atm yayy\n',
  viewer_count: 3415,
  started_at: '2018-08-21T19:26:04Z',
  language: 'en',
  thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_scarra-{width}x{height}.jpg'
  }

  Note: the actual username is not directly passed, but we can find it in the thumbnail_url.

*/

module.exports = class Stream {
  constructor({ title, viewer_count, game_id, thumbnail_url, login, language }) {
    this.title = title;
    this.viewers = viewer_count;
    this.game_id = Number(game_id);
    this.language = language;

    if (login) {
      this.name = login;
    }
    else if (thumbnail_url) {
      this.name = this.setNameFromThumbnail(thumbnail_url);
    }
  }

  setNameFromThumbnail(thumbnail_url) {
    return thumbnail_url ? String(thumbnail_url.match(/(?<=live_user_)\w+(?=-\{width)/gi)) : null;
  }

  // What the fuck is this.
  static newStreamFromDetails(stream) {
    const newStream = new Stream();
    newStream.id = Number(stream.id);
  }
};
