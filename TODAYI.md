# Tues, Aug 14, 2018 - Started anew.

I had some really good progress with the directory, but I ran into a brick wall when I wanted to add in React.
It was part "not knowing shit about React", part "poorly architected code", and part "frustrated at coding overall"

- [x] Moved all old repo code to <https://github.com/ksnovak/Multigame_Browser/tree/Pre-React>
- [x] Used someone else's boilerplate (<https://github.com/crsandeep/simple-react-full-stack>) to create an app that simultaneously runs React & Express, and adds in a bunch of other important things like Webpack
- [x] Started learning how to use Heroku

# Wed, Aug 15, 2018 - Built the foundation (deployment)

What I want to do is be able to deploy new builds to the world and have people actually use this app. From the beginning, not at some eventual date.

- [x] Split my active code into two branches. [Master](https://github.com/ksnovak/Multigame_Browser) and [Heroku](https://github.com/ksnovak/Multigame_Browser/tree/Heroku)
- [x] Set the very basics for running tests
- [x] Set up [Travis CI](https://travis-ci.org/ksnovak/Multigame_Browser)
- [x] Travis will run the `test` and `build` scripts for the `Master` and `Heroku` branches.
- [x] If the `Heroku` branch succeeds in Travis, then it will get deployed to Heroku
- [x] Set up [Heroku](https://dashboard.heroku.com/apps/multigame-browser)
- [x] Heroku has the app publicly accessible at <https://multigame-browser.herokuapp.com/>

# Thurs, Aug 16, 2018 - Build the foundation (usage)

Now that the details for deploying the app are out of the way, there's foundation within the app needed to be done.

- [ ] Remove all boilerplate code, add in extreme barebones details for our own site
- [ ] Add in Twitch oauth. I want to have this integrated from the beginning, because it will determine if we need a...
- [ ] Database? Likely will need this eventually. Might as well see about doing it sooner.
- [ ] Caching? This can save a lot of api calls. Which will be highly needed if this is going to be public.
- [ ] Go to the Twitch dev center and see what's needed for the callback URL.
