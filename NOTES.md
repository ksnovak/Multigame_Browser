Immediately:
* Serve up actual details

Short-term:
* Pass in games as a querystring
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
