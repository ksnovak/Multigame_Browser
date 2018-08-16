# Changelog

## [Unreleased]

### Overview

### Added

### Changed

### Removed

### Personal

## 0.2.0 - Thurs, Aug 16, 2018 - Build the foundation (usage)

Now that the details for deploying the app are out of the way, there's foundation within the app needed to be done.

- [ ] Remove all boilerplate code, add in extreme barebones details for our own site
- [ ] Add in Twitch oauth. I want to have this integrated from the beginning, because it will determine if we need a...
- [ ] Database? Likely will need this eventually. Might as well see about doing it sooner.
- [ ] Caching? This can save a lot of api calls. Which will be highly needed if this is going to be public.
- [ ] Go to the Twitch dev center and see what's needed for the callback URL.

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

### Changed

### Removed

- [x] Moved all old repo code to <https://github.com/ksnovak/Multigame_Browser/tree/Pre-React>

### Personal

- [x] Started learning how to use Heroku
