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




## Up next:
"Big" is for large undertakings. "Urgent" is for things that are really important. "Cool" is for everything else noteworthy
This is listed roughly in order of importance to me.
* URGENT: Clean up all the mess made by the "Include" feature
* Add UI component for "Include"
* URGENT: Rewrite promises to async functions
* Cleanup on aisle "function and parameter names"
* URGENT: Unit testing
* URGENT: Switching from Handlebars to React
* COOL: Update Client-side to update data without needing a refresh
* BIG: "Show me the top overall streams, excluding games X, Y, and Z"
* COOL: Option for auto-refresh at certain intervals
* COOL: Change selection to be a tag-selection type thing instead of Selects & Textboxes
* COOL: Cache client preferences somehow
* BIG: Accounts
    * Saving preferred settings
    * Shortcuts for certain settings
    * Sharing lists
* COOL: Server-side caching for data 
    * Game details (name, ID, thumbnail) is an ideal use, they barely change
    * List of streamers
    * Streamers' details
    * Top games
    * Top streamers
* COOL: Game weighting
    * If you follow a huge game (e.g. League) and a small game (e.g. Stardew Valley), you probably won't see any streams for the smaller game on the first page. Find a way to weight game value so there's a reasonable spread
    * "Simplest" solution would probably be to have a cutoff for game # of viewers. Alternate between displaying streams for the larger set and the smaller set.
* BIG: Integrate Twitch's oauth, so we can directly pull Following Users/Games details
* COOL: Various sorting/grouping options. 
    * "Show me all the Rimworld streams, then all the Stardew streams, ..."
    * "Show me the specified users first, then all the rest"
* Pagination
* Something to do for Replays and Hosts

## Backburner /  Don't forget:
* Change promises to async, for clarity     https://medium.com/@bluepnume/learn-about-promises-before-you-start-using-async-await-eb148164a9c8
* using window.location.search, find ways to update the querystring without completely deleting and replacing it (e.g. update the games list without changing the language setting)
* make case insensitive querystrings, using proxy https://stackoverflow.com/questions/15521876/nodejs-express-is-it-possible-to-have-case-insensitive-querystring
* Client-side language selection (instead of en-only vs. all)
* Edgecase testing for empty sets (no games, no streamers, nothing selected on client, no things after Exclusion list, duplicates in include/exclude, etc)
* Multiple display styles (grid vs list)
* Allow use of the results screen to filter (e.g. a small pair of buttons to exclude either the certain streamer or their game)
* Helper functions for Maps, to search and retrieve arrays of certain things (e.g. array of streamer names)
* Make sure mixed inclusion/exclusions handle logially. The more specific instruction should be upheld. 
    * X language only, but include Y streamer -> Y better show up no matter what they speak
    * Show top games, excluding X -> X better not show
    * Show top games, excluding X, but including Y streamer -> Y should show

## Known issues:
* Intermittent error of "Error parsing topGames, TypeError: Cannot read property 'map' of undefined" (Also happens with specificGames, I think)
    * This is so intermittent that, every time I change the code to just log the data, the problem gets fixed.
    * Might be something like includeTop being unchecked, but it still tries to search?
    * Managed to get this error kicked back finally. `body: '{"error":"Bad Request","status":400,"message":"Must provide at least one name or ID."}' }`
    * Go through and make sure no empty calls are getting made. Especially check calls for 'include'


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

