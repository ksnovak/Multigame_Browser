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
		}
	}

	setName(name) {
		this.login = name;
	}

	static newGameFromDetails(stream) {
		let newStream = new Stream();
		newStream.id = Number(stream.id);
	}
}