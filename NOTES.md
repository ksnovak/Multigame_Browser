Immediately:
* Serve up actual details

Short-term:
* Pass in games as a querystring
* Handling for 0 results (either no games or no streamers)
* Get rid of re-initializing maps. That's crappy
* Inclusion/Exclusion list of streamers
* Async API calls
* Move router to its own appropriate file

Long-term:
* Save game details in a database
* Cache streamer details
* Have a service regularly getting game/streamer details, and then when users want to view the site, just serve up that latest data
* Accounts, with default games/streamers to show
