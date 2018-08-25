# Changelog

## [Unreleased]

### Overview

### Added

### Changed

### Removed

### Personal

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
