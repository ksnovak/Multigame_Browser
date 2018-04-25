const request 		= require('request');
const keys 			= require('../keys');
const Stream         = require('../models/stream');
const GameRouter 	= require('./games');


let baseRequest = request.defaults({
	headers: keys.twitch,
	baseUrl: 'https://api.twitch.tv/'
})

module.exports = function(router) {
    
    router.get('/streams/details', (req, res) => {
        queryStreamsDetails(req.query).then(value => res.send(value))
    });

    router.get('/streams/games', (req, res) => {
        queryStreamsForSpecificGames(req.query).then(value => res.send(value))
    });
}
module.exports.queryStreamsDetails = queryStreamsDetails;
module.exports.queryStreamsForSpecificGames = queryStreamsForSpecificGames;

function queryStreamsDetails (options) {
    return new Promise((resolve, reject) => {
        baseRequest.get({	
            uri: 'helix/users',
            qs: options
        }, (error, response, body) => {
            if (error) {
                reject(Error(`Error on streamDetails, ${error}`));
            }
            else {
                try {
                    resolve(JSON.parse(body).data.map(stream => {
                        let newStream = new Stream();
                        newStream.user_id = Number(stream.id);
                        newStream.login = stream.login;

                        return newStream;
                    }))
                }
                catch (error) {
                    reject(Error(`Error parsing streamsDetails, ${error}`))
                }
            }
        })
    })
}

function queryStreamsForSpecificGames (options) {
    return new Promise((resolve, reject) => {
        baseRequest.get({
            uri: 'helix/streams',
            qs: options
        }, function(error, response, body) {
            if (error) 
                reject(Error(`Error on streamsForSpecificGames, ${error}`))
            else {
                try {
                    resolve(JSON.parse(body).data.map(stream => new Stream(stream)));
                }
                catch (error) {
                    reject(Error(`Error parsing streamsForSpecificGames, ${error}`));
                }
            }
        })
    })
}