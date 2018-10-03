# Changelog

## [Unreleased]

### Overview

### Added

### Changed

### Removed

### Personal

## 0.5.2 - Sat, Sept 22, 2018 - Battling the beast of Travis and Heroku

### Overview

While trying to deploy 0.5.1, suddenly, the deploy proccess... broke. The main push here is to fix that and optimize the deploy process.

It seems that something got messed up with devDependencies vs. dependencies -- Heroku was suddenly saying that certain packages (which had _always_ been in devDependencies) couldn't be found, and the only way to fix it was to move them to dependencies.
I had been discontent with the deploy process for a while, so I wanted to tackle that while fixing the big issue.

### Added

- A "Save search" button. This will take your search configuration and save it, for use with the "My favorites" (now just "Faves") button. It uses local storage, so it persists on your computer even with closing and re-opening the browser. It has a confirmation before saving anything.

### Changed

- Deploying to Heroku is now done through Travis, instead of going Github -> Travis -> Github -> Heroku
- Fixed the giant issue of slow bootup after Heroku sleeps. Now the whole webpack process only gets done on a new deploy; restarts just force a new "npm start" call.
- Shifted around a lot of dependencies; removed unneeded ones; updated all possible ones
- The "Favorites" button is now user-configurable, working with the "Save search" feature.

### Personal

This was really frustrating, because I only have a very thin film of knowledge regarding Travis, Heroku, Webpack, Babel.... and once things were working, I was afraid of breaking them.
Some things were a very painstaking process, and reminded me of my old job where I'd have to wait 10 minutes for a build to run, just to realize I messed something up. In this case, I was literally testing things with the Travis/Heroku integrations, so it was necessary to wait the ~5 minutes for that entire process to run. Additionally, since I was testing the "Heroku sleeping" case, I had to put everything on hold for 30 minutes a couple of times to see how the sleep interacted with everything else.

Also in the meanwhile, Twitch released a brand new feature: tags for streams and games; You can classify your stream with things like, "Hard mode" or "Casual playthrough". Games have genre tags (e.g. RPG, Battle Royale). I'm really excited to implement this in the app, but it is a bit daunting.

I really desperately need to get back to writing tests. I know I've been awful about it. I also need to clean them up; a lot of times the test suite can fail due to just Twitch's API being wonky, and I need to get a handle on that.

## 0.5.1 - Fri, Sept 21, 2018 - Exclude, and usability changes

### Overview

Making a lot of changes focused around making the app more... usable. Not necessarily new features, but just less "programmer-y".

### Added

- "Exclude" functionality. If there's a game you like, but don't want to see certain users, that's where this comes in handy.
- Loading indicator. This only appears if the query takes more than a half-second, and it has a fade-out animation so that it doesn't jarringly just appear and disappear.
- "Generated At" value flashes upon update. This works hand-in-hand with the loading indicator, to make the user aware that new data has arrived. The background color briefly changes and then animates back to normal.

### Changed

- The common querystring names, for simplicity. include_top_games -> include_top, stream_name -> name, game_name -> game, exclude_stream_name -> exclude
- Data passed from the API. Streams now pass: Title, viewers, game_id, language, and name. Games now pass: ID, name, and selected.
- Thumbnail URLs are all generated client-side. Maybe this is less future-proof, but the previous way wasn't exactly future-proof either.
- Merged some logic for the Directory, and simplified it.
- Stream Cell cleanup. No more overlapping text, 3-line limit to titles, less awkward whitespace due to name+viewers+game being part of a line with the game thumbnail.
- Generated At is now "Streams updated at" for more immediate understanding, and only show the time instead of Date+Time
- Bottom Links got separated from Generated At, now is at the bottom of the Directory, for a bit less visual clutter.

### Personal

- I definitely ran into the problem of running out of steam again, feeling like I was at that plateau. The #1 thing I want to change is something that's extremely daunting and way out of my knowledge range, but is incredibly important (The problem with [Heroku timeout](https://github.com/ksnovak/Multigame_Browser/issues/72)). I know that it's surrounding my Webpack and run processes, but I don't understand Webpack at all, and am scared to break it.

## 0.4.2 - Sun, Sept 9, 2018 - Cleanup day

### Overview

After a few iterations of bigger changes, it's time to go back and clean up the mess. Particularly, the Select components.

### Changed

- Made sure State was properly updating and getting reflected upon using the top shortcut buttons (Home and Favorites).
- A lot of cleanup surrounding the Select components; making sure that elements are properly addable and removable. There were issues surrounding removing a game from the Games list that was part of existing search results.
- Querystring param ordering; Now the less-spammy params (include_top and language) show first, since that's more important to see than the list of all games/streams.
- Worked on the stream directory visuals: no more text overlap, slightly more spacing between elements, bolding streamers' names, italicizing stream titles, fixed the Game thumbnail links.
- Renamed BottomButtons to BottomLinks to better match what they are.
- Bottom links, Generated time, and version number are all sticky to the bottom of the screen.

### Removed

- GamesList component; now merged into Textlist component.

### Personal

- I had a big interview for a company, and one of the interviewers mentioned that he tried out this project and thought it was cool. That was a great boost of confidence, but it was also kind of scary because I know just how much is completely Wrong with it now. If he tried it literally a night before, it would've not worked at all.
- I also really ran out of steam this week too. I reached the point that I had been stretching for a long time: implementing React. Even though there are so many other things to do, that was kind of a plateau and I had a hard time of mentally moving forward once I was there. Which tells me that it's time to clean up a bit more, and have people actually test it out to help guide me.
- During my interview, an interviewer asked me about time complexity of an algorithm (removing duplicates from an array), which now has me super-conscious of how little I think about that stuff, and now I have to work hard to resist the urge to spend hours trying to optimize that all. Something for the backburner certainly, but our current datasets are so small that the gains are negligible compared to other things.

## 0.4.1 - Tues, Sept 4, 2018 - "My favorites" button

### Overview

Extremely minor, but a lifesaver in making a simple search.

### Added

- Functionality on the "My favorites" button
- "Home" now just changes the state instead of being a full reload

### Removed

- Temporarily removed the Exclude Select, since the server has nothing to handle it yet.

### Personal

- I don't like that, despite updating the state and causing appropriate renders to trigger, this button doesn't make the Games/Inludes Selects update visually.

## 0.4.0 - Mon, Sept 3, 2018 - Searching, and hooking up React events

### Overview

This is another one for important, focused wins. Querystring parsing, actual search functionality

### Added

- Brand new way of handling querystring params, decoupled from Twitch's naming schema.
- Tons of tests that were way overdue for querystring parsing.
- Changed our 4 different inputs for games/streamers to 3 really nice tag-like [React-Select](https://github.com/jedwatson/react-select) elements
- Search button works!
- A version number on the client screen, pulled from package.json.

### Changed

- Went back to ESLint/Prettier. A lot of formatting in the code is changing.
- Updated to Babel 7, which allegedly comes with a lot of performance updates, and does things in a much more Modern way, in terms of NPM usage.

### Removed

### Personal

- I did a really awful job of having Monolithic commits. It felt awkward, though, because I broke a lot of things in the process of changing other things. But that's what I should be going to new Branches for. I need to get more comfortable with that idea.
- I grossly over-engineered the querystring situation, but I really like the way it was done regardless. I could've gotten away with 10% of the effort and had it work for 90% of the situations. I wonder how often something like my solution is needed by others, and if it's worth making an external module to share.
- I don't like the naming system I used for query params. It seems... over-specific? We'll see how it feels later on with other things implemented.
- The QS situation was relatively easy (which was expected), but took more time and effort than I did expect. There was a lot of consideration for edge cases. So I'm counting that as both Easy and a Stretch for my "_Sprint Planning as Self Care_". Caching will have to wait till later.
- [The best way to bind event handlers in React](https://medium.freecodecamp.org/the-best-way-to-bind-event-handlers-in-react-282db2cf1530) really helped with react event handlers
- Bubbling events up was really hard for me to grasp, but it's really cool to see it work.
- [React-Select](https://github.com/jedwatson/react-select) is an awesome module.

## 0.3.0 - Tues, Aug 28, 2018 - The client technically works now!

### Overview

I was tired of sitting deep in the weeds. There's an absolute ton of cleanup and implementation that needs doing on the backend, but I wanted a win.
The client technically works. You've got to pass things in the querystring, but it accepts name, id, user_id, user_login, includetop, and first, to get streams and games.

### Added

- Client base functionality, with React (That was, after all, why I restarted this entire project)
- You can search for games & users (via querystring, unfortunately), and will see them appear in the directory grid.
- /api/combo. This is our entry into the app, grabbing both Stream and Game information
-

### Changed

- Fixed a bug with boolean queryoptions
- Added a couple common functions for combining arrays, they are very nice and handsome.
- Tests got cleaned up a LOT. We went from calling Twitch 20x in 20 Tests, to 17x in 32 tests (a few new tests for existing services, and a few for the new api/combo endpoint).

### Personal

- Even though it's ugly as sin, it felt like a huge win to get the Directory to load.
- I'm starting to wonder why I made endpoints other than /combo, since I'm not sure how often I'll ever need JUST games or streams.
- React is surprisingly easy to use for passing data downward. I'm worried about working on bubbling it back up though
- My QueryOptions mess is getting increasingly uncomfortable. I want to switch to a popular Validator/Sanitizer, and I also want to have a differentiation between incoming (User -> Us) QS and outgoing (Us -> Twitch) QS. Since we combine games & streams, there is some ambiguity (is "id" for the game or the stream? is includeTop the top games or top streams? how about first?), and we shouldn't be so closely coupled with Twitch's nomenclature.
- There was a post on dev.to, "[Sprint Planning as Self Care](https://dev.to/kathryngrayson/sprint-planning-as-self-care-j59)", that suggested to make sure you have 3 types of stories in each sprint: Exciting, Easy, Stretch. Even though I don't exactly do sprints, I want to try enforcing that. Coming up next: Hooking up client event handlers to allow searches (with hard refreshes to begin with), Fixing query param nonsense, Caching

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
