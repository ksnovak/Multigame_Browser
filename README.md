# Multigame_Browser

## This is intended to be an alternative to Twitch's default stream directory 
Twitch provides the following directory types:
* The top streamers across all games (https://www.twitch.tv/directory/all)
* The top streamers for 1 given game (https://www.twitch.tv/directory/game/Overwatch)
* The specific streamers you follow, across all games (https://www.twitch.tv/directory/following/live)
* A list of games that you follow (https://www.twitch.tv/directory/following/games)
but you can only view those one-at-a-time.

The core issue being solved with this new directory is, **I want to see the top streamers for all of the games that I follow, at once**

## Other things being tackled as well:
* I want to see all of the streamers for this game, but don't show me these specific streamers.
* I want to see the overall top streamers, but don't show me those streaming these certain games.
* Get me all of the streamers for these specific games, but also include these specific streamers (regardless of what game they're playing)
* I prefer English results, but show all other languages afterwards

## To use
If you pull down this repo and make use of it for yourself, you need to create a `keys.js` file in the root directory, with the following details:

    module.exports = {
        db: {
            user: 'ADMIN',
            password: 'SECRET'
        },
    
        twitch: {
            'Client-ID': 'KEY',
            'Authorization': 'Bearer KEY'
        },
    
        youtube: {
            'API-Key': 'KEY'
        }
    };
Replacing KEY with the appropriate key.
Update Node and install all packages
Run via `npm run dev`
View at localhost:3000


## Simple smoke-test cases
* http://localhost:3000/
* http://localhost:3000/?name=
* http://localhost:3000/?name=Always%20On
* http://localhost:3000/?exclude=&name=Always%20On
* http://localhost:3000/?exclude=food&name=Always%20On
* http://localhost:3000/?includeTop=true&exclude=food&exclude=twitchpresents2&name=Always%20On
* http://localhost:3000/?name=Always%20On&include=
* http://localhost:3000/?name=Always%20On&include=
* http://localhost:3000/?name=Stardew%20Valley&include=food
* http://localhost:3000/?name=Stardew%20Valley&include=food&exclude=day9tv
* http://localhost:3000/?name=Stardew%20Valley&include=food&exclude=day9tv&exclude=day9tv
* http://localhost:3000/?language=en&name=Always%20On
* http://localhost:3000/?language=en&name=Always%20On&include=epilinet  - That's a Chinese stream, shouldn't show for English-only

