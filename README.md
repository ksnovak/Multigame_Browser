# Multigame_Browser
This is intended to be an alternative to Twitch's default stream directory 
Twitch provides the following directory types:
* The top streamers across all games (https://www.twitch.tv/directory/all)
* The top streamers for 1 given game (https://www.twitch.tv/directory/game/Overwatch)
* The specific streamers you follow, across all games (https://www.twitch.tv/directory/following/live)
* A list of games that you follow (https://www.twitch.tv/directory/following/live)
but you can only view those one-at-a-time.

The core issue being solved with this new directory is, **I want to see the top streamers for all of the games that I follow, at once**

Other things being tackled as well:
* I want to see all of the streamers for this game, but don't show me these specific streamers.
* I want to see the overall top streamers, but don't show me those streaming these certain games.
* Get me all of the streamers for these specific games, but also include these specific streamers (regardless of what game they're playing)
* I prefer English results, but show all other languages afterwards




Up next:
* BIG: Include streamer list (in X list of games OR Y list of streamers)
* URGENT: Unit testing
* URGENT: Switching from Handlebars to React
* Update Client-side to update data without needing a refresh
* BIG: "Show me the top overall streams, excluding games X, Y, and Z"
* Change selection to be a tag-selection type thing instead of Selects & Textboxes
* Cache client preferences somehow
* BIG: Accounts
    * Saving preferred settings
    * Shortcuts for certain settings
    * Sharing lists
* Server-side caching for data 
    * Game details (name, ID, thumbnail) is an ideal use, they barely change
    * List of streamers
    * Streamers' details
    * Top games
    * Top streamers

Backburner /  Don't forget:
* Change promises to async, for clarity     https://medium.com/@bluepnume/learn-about-promises-before-you-start-using-async-await-eb148164a9c8
* using window.location.search, find ways to update the querystring without completely deleting and replacing it (e.g. update the games list without changing the language setting)
* make case insensitive querystrings, using proxy https://stackoverflow.com/questions/15521876/nodejs-express-is-it-possible-to-have-case-insensitive-querystring
* Client-side language selection (instead of en-only vs. all)
* Edgecase testing for empty sets (no games, no streamers, nothing selected on client, no things after Exclusion list, etc)
* Multiple display styles (grid vs list)
* Allow use of the results screen to filter (e.g. a small pair of buttons to exclude either the certain streamer or their game)