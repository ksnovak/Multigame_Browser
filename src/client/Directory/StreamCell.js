import React, { Component } from 'react';
import './Directory.css';
import PropTypes from 'prop-types';

export default class StreamCell extends Component {


	componentDidMount() {
		// asdf
	}

	getThumbnail(url, width, ratio) {
		return url.replace("{width}", width).replace('{height}', parseInt(width / ratio))
	}

	render() {
		const { stream, game } = this.props;

		const StreamWidth = 230;
		const StreamAspectRatio = 1.75;

		const GameWidth = 90;
		const GameAspectRatio = 0.75;
		/*
		game_id: 394568
		id:30125871232
		login:"sirstretchalot"
		thumbnail_url:"https://static-cdn.jtvnw.net/previews-ttv/live_user_sirstretchalot-{width}x{height}.jpg"
		title:"Rimworld! | !discord"
		user_id:106233646
		viewer_count:0
		*/

		/*
			box_art:"https://static-cdn.jtvnw.net/ttv-boxart/RimWorld-{width}x{height}.jpg"
			id:394568
			name:"RimWorld"
			selected:true
		*/
		return (
			<div id='streamCell' className='col-sm-2 py-1 px-1'>
				<div className='row py-1 px-1'>
					<a className='streamThumbnail' href={`https://twitch.tv/${stream.login}`}>
						<img src={this.getThumbnail(stream.thumbnail_url, StreamWidth, StreamAspectRatio)} />
					</a>
				</div>
				<div className='row px-1'>
					<div className="col-sm-2 px-0">
						<a href={`https://twitch.tv/directory/${game.name}`}>
							<img src={this.getThumbnail(game.box_art, GameWidth, GameAspectRatio)} className='gameThumbnail' style={{ 'max-width': '90px', width: '100%' }} />
						</a>
					</div>
					<div className='col-sm-10'>
						<span className='login'>{stream.login}</span> with <span className='viewerCount'>{stream.viewer_count} viewers</span>
						<span className='streamGame'>{game ? `playing ${game.name}` : ''}</span>
					</div>
					<span className='streamTitle'>{stream.title}</span>
				</div>
			</div>
		);
	}
}

StreamCell.propTypes = {
	//   label: PropTypes.string.isRequired,
	//   list: PropTypes.arrayOf(PropTypes.string),
	//   id: PropTypes.string.isRequired
};

StreamCell.defaultProps = {
	//   list: []
};
