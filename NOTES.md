Immediately:
* Serve up actual details

Querystring options:
* Game name/id
* Language
* Display as cards or list

Short-term:
* Pass in games as a querystring
* Separate arrays for games. One for an overall list, one for the list of requested ones
* Handling for 0 results (either no games or no streams)
* Get rid of re-initializing maps. That's crappy
* Inclusion/Exclusion list of streams
* Async API calls
* Move router to its own appropriate file
* "name" and "game" querystring combination
* There must be some way for handlebars to use variables...

Long-term:
* Save game details in a database
* Cache stream details
* Have a service regularly getting game/stream details, and then when users want to view the site, just serve up that latest data
* Accounts, with default games/streams to show

Uses:
* "Get me all of the streamers for games X, Y, and Z"
* "Show me the top overall streams, excluding games X, Y, and Z"
* "Get me the streamers for games X, Y, and Z, and also streamers A, B, and C, regardless of what they're streaming"
* "I prefer English results, but show all other results afterwards" (good for games with few streamers. There've been times where I've seen a game has 4500 viewers, and then you go to it, and there's one English streamer with ~200 viewers. And that feels weird)