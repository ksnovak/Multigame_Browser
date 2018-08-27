# Changelog

## [Unreleased]

### Overview

### Added

### Changed

### Removed

### Personal

## 0.2.5 - Mon, Aug 27, 2018 - Minor tweaks

### Overview

There were a handful of small things that I really wanted to tackle here.

### Added
- Saving Twitch Bearer token in file, and reading from it.
- "Generated At" timestamp on the client. It's interesting to know when the data was last updated.
- A common function for dev-mode logging.
- A singular function for Twitch API calls. That way we can appropriately log in just one place.
- Log every Twitch call made.
- Timestamp for server restart.

### Changed
- /streams/game -> /streams/list. This more accurately reflects what the point of that endpoint is.
- /streams/list can handle being passed game IDs and streamer IDs/names decently.
- "Bottom buttons" on client. Now are a set of links with relevant things.

### Removed
- /streams/details endpoint. This was a redundant one, created due to a restriction with the Twitch API. I had found a workaround, so it no longer is necessary

### Personal

I need to really look into VSCode debugging. It sucks throwing a billion log statements.
I feel like there has to be a better way to handle saving Bearer token. I plan to use caching anyway, but I don't think that persists through restarts/updates. I also know that I should be updating an existing one when possible, instead of requesting a new one.
This new version is also part of testing my changes to the "release" system.


## 0.2.4 - Sun, Aug 26, 2018 - Starting to make combinations

### Overview

In order to make the app as clean as possible, we need to make some combined calls. This time around, I'm figuring out what's needed for all of that.
Big change: I'm changing how I'm doing Git branches. The current way is kind of dumb. After this point, 'master' will represent what's merged into Heroku. The 'heroku' branch is going away. A new one, 'development', is being made. That will be what I actively work on.

### Added

- A /games/combo API endpoint. This is for when you want the Top games as well as some Specific ones.
- A 'selected' flag on Specific games, to differentiate it from Top ones.
- Some more thorough tests, and testing cleanup. Added an array for a set of common games (with name + id) so I don't have to bother hardcoding or remembering them.
- Allowing a 'default' value in the QueryOptions class, as a minor band-aid. But that implementation only works in the case of the key being passed with an invalid value -- doesn't handle the key not being passed at all.

### Changed

- Working on making some functions (in this case, ones in the Games router class) more generic and re-usable


### Removed

- Got rid of the /streams/details endpoint. I used this in the earlier version because the main Twitch api call for users never directly gives their name, so we needed a separate API call for that. But I've since found a way to grab it from the thumbnail URL.


### Personal

- ESLint+Prettier got annoying to the point where I just got rid of them. Apparently they caused huge performance hits on VSCode too.
- I realized that the Git branch methodology I used is pretty dumb. "Master" should be what's live online, not what is currently being developed.
- I want to find something that lets me disable committing directly to Master, or at least require a confirmation. Hopefully I can find a way to make it so that all PRs are squashed commits too.
- I'm stopping the "Release" system. That's all very irrelevant and just adding unnecessary overhead.
- Twitch's inconsistent returns from their API is getting frustrating. If you try to get the top N games, it will very often return N-1, meaning you have to always allow for a range of results.
- I'm getting a lot more comfortable with making unit tests. My biggest concern now is making them more performant, and wanting to use before() hooks better; I think every API all actually resets the "server", as opposed to having it persistently running.


## 0.2.3 - Sat, Aug 25, 2018 - Safeguards for Twitch calls

### Overview

Exceeding Twitch's rate limit was something that I easily did when I was just manually testing things in the old version. So I went back and spent some time making sure that doesn't happen.

### Added

- Generating a Bearer token from Twitch
- Tracking and checking against the Twitch Rate Limit

### Changed

- Switched from Request to Axios for making calls to Twitch

### Personal

I was really confused by the Bearer token situation. I thought it was the same thing as the Client Secret, apparently that's completely different. Bearer token is something that you have to make a specific Post call in order to generate. And weirdly, it has a value called "expires_in" which is how many seconds from now it expires. I don't get why they would make it a relative value instead of saying when it expires.

## 0.2.1 - Fri, Aug 24, 2018 - Build the foundation (testing)

### Overview

I wanted to establish a decent set of tests before continuing with anything else, so that's what's done in here.

### Added

- Testing on all of the API routes, covering the major cases.
- Filling out the Error classes

### Changed

- A lot of work with the Twitch API calls. Moved things to be more generic wherever possible
- In the case of certain API calls that are looking for specific things (e.g. details on specific games, or list of streamers for specific games), added a shortcut that skips the call to Twitch if nothing is specified.
- Actually incremented package.json version

### Personal

Something that I was hoping to figure out but couldn't, was a way for a Mocha test to "warn" instead of being pass/fail. There are some tests that we have, that are on kind of shaky ground, and I don't want the entire suite to fail if those specific ones go wrong. I found something from a REALLY old thread that might be a solution: [mocha test/allowed-failures || true](https://github.com/mochajs/mocha/issues/1480#issuecomment-93861957), whereas all of the "wonky" tests are stored in that file. Will have to look into that in the future, as we run into issues with the wonky ones.
I also discovered the existence of pre-commit hooks, and am curious about using those to make sure tests pass before committing. But didn't dedicate time to doing that, because it requires some bash scripts.

## 0.2.0 - Tues, Aug 21, 2018 - Build the foundation (usage)

### Overview

Two major things done this time: API firmly established, and the Options panel visuals all set up.

### Added

- API calls, properly going through Twitch and returning our own Objects
- Top games, Specific games, Streams by game, and Stream details
- These are all very Dumb. They just get the data, turn it into our objects, and return it. There is no intelligent collation, and they are all just the foundation
- A lot of effort was put into validation params, making sure that we don't send anything bad to Twitch. But this was all home-rolled, we should realistically be using a 3rd party tool

- Options panel visuals
- Done with React
- All of the fields that existed in the old Implementation are present now. They all properly bubble data down from the parents to children
- They do not, however, bubble back up. And no requests really get made.

- Currently the client just makes a single API call, just getting the list of Top Games to populate our multi-select, just as a "proof of concept" thing.

- Added some very basic error handling, and setup for different Error types

### Changed

- Changed a lot of nomeclature of "API" -> "Router" to make it more flexible for later.

### Personal

- I got frustrated trying to learn about doing oauth logins. I really wanted to have this in from the beginning. I know it's going to bite me later. But I gave up on it for now.
- I decided to spend the day ignoring the existence of unit tests. I'm going to work hard on them tomorrow, but I regret not doing it immediately.
- I learned a lot about planning out object validation with this hacky home-brewed version.
- React is starting to make a lot more sense, but it's still really boggling. I read an article on DEV about it that I really liked: https://dev.to/aberezkin/react-the-key-points--4h83

## 0.1.0 - Wed, Aug 15, 2018 - Built the foundation (deployment)

### Overview

What I want to do is be able to deploy new builds to the world and have people actually use this app. From the beginning, not at some eventual date.

### Added

- The very basics for running tests
- Travis CI integration. Dashboard: <https://travis-ci.org/ksnovak/Multigame_Browser> - Travis CI will run the `test` and `build` scripts, any time I push commits to `Master` or `Heroku` branches. - It keeps a history of build successes/failures, and the statuses also show within the Github repo
- Heroku integration. Dashboard: <https://dashboard.heroku.com/apps/multigame-browser> - Whenever a commit is made to the `Heroku` branch, and it passes on Travis, then a build gets deployed to Heroku - This will be publicly accessible at <https://multigame-browser.herokuapp.com/> - (For clarity, commits to `Master` are irrelevant to this Heroku setup)
- Changelog. Hi, that's this file! I want to keep track of what I've done.

### Changed

- Split my active code into two branches. [Master](https://github.com/ksnovak/Multigame_Browser) and [Heroku](https://github.com/ksnovak/Multigame_Browser/tree/Heroku)
- `Master` is for all sorts of checkins made.
- `Heroku` is when I'm done with enough changes to merit a change to the publicly-accessible app.

## 0.0.1 - Tues, Aug 14, 2018 - Started anew.

### Overview

I had previously spent a bunch of time trying to build this directory, but ran into a brick wall when I wanted to add in React. It was part "not knowing shit about React", part "poorly architected code", and part "frustrated at coding overall". After a couple of weeks of working on things for potential employers, I wanted to start again.

### Added

- [crsandeep](https://github.com/crsandeep)'s [Simple react full-stack](https://github.com/crsandeep/simple-react-full-stack) boilerplate for an app that simultaneously runs React & Express, and has a bunch of other important features like Webpacck implemented

### Removed

- Moved all old repo code to <https://github.com/ksnovak/Multigame_Browser/tree/Pre-React>

### Personal

- Started learning how to use Heroku
