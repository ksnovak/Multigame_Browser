module.exports = class Stream {
	constructor (stream) {
		if (stream) {
			this.id = Number(stream.id);
			this.user_id = Number(stream.user_id);
			this.title = stream.title;
			this.viewer_count = stream.viewer_count;
			this.game_id = Number(stream.game_id);
			this.thumbnail_url = stream.thumbnail_url;
			this.selected = false;

			this.login = this.setNameFromThumbnail(stream.thumbnail_url);
		}
	}

	setName(name) {
		this.login = name;
	}

	// The Twitch streams' API doesn't directly return usernames. It does, however, return a thumbnail URL which contains the username within it.
	// So we can either make a separate API call, or do some local work with regex
	setNameFromThumbnail(thumbnail_url) {
		/* We're looking for a set of characters (\w+), sandwiched between "live_user_" and "-{width"
			Lookbehinds are questionably supported, but they work with at least Node 8.11+
		*/
		return thumbnail_url.match(/(?<=live_user_)\w+(?=\-\{width)/ig);
	}

	static newGameFromDetails(stream) {
		let newStream = new Stream();
		newStream.id = Number(stream.id);
	}
}