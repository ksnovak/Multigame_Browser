const request 		= require('request');
const keys 			= require('../keys');
const Game         = require('../models/game');


let baseRequest = request.defaults({
	headers: keys.twitch,
	baseUrl: 'https://api.twitch.tv/'
})

module.exports = function(router) {

    //Gets a list of top games, sends them as a JSON-formatted array in our spec
    router.get('/games/top', (req,res) => {
        queryTopGames(req.query).then((value) => { res.send(value); })
    });

    //Gets details for specific games
    router.get('/games/specific', (req, res) => {
        querySpecificGames(req.query).then((value) => { res.send(value); })
    })

    
}

module.exports.queryTopGames = queryTopGames;
module.exports.querySpecificGames = querySpecificGames;

function queryTopGames (options) {
    return new Promise((resolve, reject) => {
        baseRequest.get({
            uri: 'kraken/games/top',
            qs: options
        }, (error, response, body) => {
            if (error) {
                reject(Error(`Error on topGames, ${error}`));
            }
            else {
                try {
                    resolve(JSON.parse(body).top.map(game => Game.newGameFromKraken(game)));    
                }
                catch (error) {
                    reject(Error(`Error parsing topGames, ${error}`));
                }
            }
        })
    })
}


function querySpecificGames (options) {
    return new Promise((resolve, reject) => {
        baseRequest.get({
			uri: 'helix/games',
			qs: options
		}, (error, response, body) => {
            if (error) 
                reject(Error(`Error on specificGames, ${error}`))
            else {
                try {
                    resolve(JSON.parse(body).data.map(game => new Game(game)));
                }
                catch (error) {
                    reject(Error(`Error parsing specificGames, ${error}`));
                }
            }
		});
    })
}