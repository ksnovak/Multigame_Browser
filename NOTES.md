
Tweaks:
* Change promises to async, for clarity     https://medium.com/@bluepnume/learn-about-promises-before-you-start-using-async-await-eb148164a9c8
* using window.location.search, find ways to update the querystring without completely deleting and replacing it (e.g. update the games list without changing the language setting)
* make case insensitive querystrings, using proxy https://stackoverflow.com/questions/15521876/nodejs-express-is-it-possible-to-have-case-insensitive-querystring
* Find a way to throw plaintext javascript in handlebars, so we can initialize some objects on client
* Share handlebars templates on server & client http://initialdigital.com/sharing-handlebars-templates-on-both-server-client-in-node-js-express-with-webpack/

Functionality:
* Different display styles
* Handling for 0 results (either no games or no streams)
* Inclusion/Exclusion list of streams
* Store game lists on server to reduce service calls if possible
* Accounts, with default games/streams to show




Uses:
* "Get me all of the streamers for games X, Y, and Z"
* "Show me the top overall streams, excluding games X, Y, and Z"
* "Get me the streamers for games X, Y, and Z, and also streamers A, B, and C, regardless of what they're streaming"
* "I prefer English results, but show all other results afterwards" (good for games with few streamers. There've been times where I've seen a game has 4500 viewers, and then you go to it, and there's one English streamer with ~200 viewers. And that feels weird)