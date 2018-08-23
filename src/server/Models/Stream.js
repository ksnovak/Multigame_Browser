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

  The details Twitch API call returns:
  id (which is actually user_id), login, display_name, type (empty string???), broadcaster_type (partner), description, profile_image_url, offline_image_url, view_count (total lifetime views)
  { id: '22253819',
  login: 'scarra',
  display_name: 'Scarra',
  type: '',
  broadcaster_type: 'partner',
  description: 'Welcome to the chat room. Feel free to ask questions, but do not spam. You can follow me on twitter @dscarra.',
  profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/8bd07ef046330084-profile_image-300x300.jpeg',
  offline_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/scarra-channel_offline_image-b43dce71e83db39f-1920x1080.jpeg',
  view_count: 65803051 }

*/

module.exports = class Stream {
  constructor({
    id,
    user_id,
    title,
    viewer_count,
    game_id,
    thumbnail_url,
    login
  }) {
    this.id = Number(id);
    this.user_id = Number(user_id || id); // The two Twitch calls return different objects to mean the same thing. In the main one, it's user_id; in the details one, it's just id.
    this.title = title;
    this.viewer_count = viewer_count;
    this.game_id = Number(game_id);
    this.thumbnail_url = thumbnail_url;

    if (login) {
      this.login = login;
    } else if (this.thumbnail_url) {
      this.login = this.setNameFromThumbnail();
    }
  }

  setNameFromThumbnail() {
    return this.thumbnail_url
      ? String(this.thumbnail_url.match(/(?<=live_user_)\w+(?=-\{width)/gi))
      : null;
  }

  // What the fuck is this.
  static newStreamFromDetails(stream) {
    const newStream = new Stream();
    newStream.id = Number(stream.id);
  }
};
