I have a small web application that I'm working on. I'm using all the hot technologies: It's a React app, with an Express backend. I use Travis-CI with it, and deploy to Heroku. It's got webpack, babel, mocha, all the jargon.

All of these things, I understand _just_ well enough for them to work. And that's it.
My app was built based on a boilerplate ([https://github.com/crsandeep](crsandeep)'s [Simple react full-stack](https://github.com/crsandeep/simple-react-full-stack)) that had Webpack and Babel all set up, and a Travis config script included.
I commit my code to Github, and I have Travis automatically trigger a build from there. If the build passes, and it's on my Master branch, it deploys to Heroku.

All of these things, I'm afraid to touch. Like any slight changes are going to break them all. I don't understand how they work, let alone how they interact.

I have no idea how to have more static pages, since the Webpack config just accepts the one index.html file as a static file.
My Travis builds take ~3 minutes each, even though I feel like they could probably take ~45 seconds.
My Heroku deployment goes to sleep after ~30 mins of inactivity, and when it wakes, it takes ~1 minute to be usable (and in the meantime it sends users a `CANNOT GET /` error). That seems like it very much shouldn't happen.
But I don't know anything about these technologies that I'm using.

Something happened the other week, though, that forced my hand. Suddenly when I deployed, things... broke. Even though I had changed nothing about it, suddenly my deployment was upset that Babel plugins were missing (they were in DevDependencies, not Dependencies). After I moved those up to Dependencies, it was mad that it didn't see my Webpack plugins. This all smelled _wrong_. It was time to figure out what the hell everything did, and make it actually work.

#### Travis

Starting out, here's my .travis.yml file:

```
language: node_js

node_js:
  - 8.12

script:
  - npm test && npm run build

cache:
  directories:
    - node_modules

branches:
  only:
    - development
    - master
```

It only cares about my development and master branches; any time one of them makes a commit, Travis triggers a build. It runs my `test` and `build` scripts. Both of them passing is a passing build.

The first order of business is, I want my deployments to Heroku to be part of this all.

#### Dependencies

After the commitpocalypse that happened to me, I hurredly moved many packages from devDependencies to dependencies, just to make it work. Now I needed to put things back in order.

Unfortunately, I could not find any great way to test whether something _should_ be a devDependency or not. There were some things I absolutely knew were needed as pure dependencies (e.g. Express, React), or as devDependencies (e.g. eslint, mocha). But there were a lot of question marks. Especially for things like Webpack or Babel, when I have not only a core library but many plugins needed.

Here's how I tackled it:

- With everything currently installed, I ran my `webpack -p` script, to get my serv-able bundle.
- I moved everything out of the "dependencies" list (it's fine to move them to devDep for now) and ran `npm prune --production`. `prune` uninstalls packages. `--production` flag makes it so that it uninstalls all packages that are NOT needed for production (i.e. are not in dependencies).
- This got me a clean slate of no packages installed. So then came the scary first step. `npm start`. First thing it said was that I didn't have babel, which is reasonable since that script runs `babel-node src/server/server.js`.
- One at a time, I added the necessary package to dependencies, and ran `npm install --only=prod` - which as you might guess, will install ONLY the packages listed in proper dependencies. Once done, `npm start`. Rinse and repeat.
- After a handful of packages, it finally was able to boot up and be accessible. At this point, we're maybe 2/3rds of the way to the finish line. Now we know that, with the webpacked package, I can serve it up. I foolishly removed some other packages thinking they were unnecessary - like @babel/preset-react - because it was all running without that.
- Make sure what you've got left is able to build that package. Now was time to run the plain `npm install`, to bring in all of the devDeps and make sure you didn't mess anything up (like preemptively removing anything from the list that you thought was unnecessary).
- Run your tests, boot up your dev server, and test it out.
- Just to be sure you didn't fudge things up again, hit up that webpack script and run its result.

Something that I didn't realize until going through this all, that is a very important thing to realize: [By default, Heroku will install all dependencies listed in package.json under dependencies and devDependencies. After running the installation and build steps Heroku will strip out the packages declared under devDependencies before deploying the application.](https://devcenter.heroku.com/articles/nodejs-support#package-installation)
I had interpreted "devdependencies" as "what I need on my personal machine to develop this app". Rather, it should be seen as "what is needed to create a deployable version of the app".
I wish there were some different type of dependency for things like mocha, eslint, prettier, etc.

#############################################
#############################################
#############################################
#############################################
#############################################
#############################################
#############################################

#### Setup

The Great Breakening started with it not noticing Babel plugins. Babel 7 had been recently released, which changed the naming scheme for a lot of its plugins (from babel-foo to @babel/foo). Even though I had deployed a new version with that change already, I figured maybe that was the cause. I temporarily moved Babel things to Dependencies (from DevDependencies), although I still don't really understand the full difference there.

After doing that, it was failing to recognize Webpack. So I moved that.

But I have plugins for Webpack. So I moved all of them (which took a few commits, since I absentmindedly didn't make sure that I had them all).

During all of this, Travis didn't throw a single error. In fact, Heroku acted like everything was peachy too, until I tried visiting the app and got an error, and had to dig through the logs.

I had already wanted to change the whole deploy process, due to how long it takes, and our obnoxious recurring [Heroku timeout issue](https://github.com/ksnovak/Multigame_Browser/issues/72). The whole thing had a very smelly smell, just due to the fact that it had to take in the entire repo, run the build process, and deploy, and then have to RE-RUN the build process if the server went to sleep. But this issue made it a necessity.

#### What's needed?

I need to learn how the following work:

- Dependencies vs. DevDependencies - What things do I actually need in Prod? How does an environment actually know it's in Prod?
- Babel - I get that it turns ES6 into Javascript. But what all is truly needed for this app? How does it change on Dev vs Prod? How does it change on build&start vs. run server&client?
- Webpack - How do I really control the input and outputs? How do I properly use plugins? How do I handle Dev vs Prod here?
- Travis and Travis.yml - What do I really need in my yml file? What does running through Travis actually do for me?
- Heroku - How can I minimize what gets sent to Heroku? How can I have a stable process that doesn't get messed up by going to sleep?

#### Travis

Our Travis script at the start:

```
language: node_js

node_js:
  - 8.12

script:
  - npm test && npm run build

cache:
  directories:
    - node_modules

branches:
  only:
    - development
    - master
```

We're targetting only this single version of Node, we run our test scripts and then also just do a smoke-test by running the build process (because of the &&, if the first one fails, it doesn't bother with the second). If either one fails, then the Travis run fails.
Travis caches the node_modules folder, so we don't re-download that.
And it only gets run on the development and master branches (note: those are the only 2 I use currently)

I'm realizing now that I can deploy straight from Travis to Heroku, with something like:

```
deploy:
  provider: heroku
  api_key:
    secure: "YOUR ENCRYPTED API KEY"
  app: my-app-123
  on: master
  run: "npm run herokuDeploy"
  skip_cleanup: true
```

Making use of this required me to install [Ruby](https://rubyinstaller.org/downloads/), and then the [Travis CLI client](https://github.com/travis-ci/travis.rb#installation). Heroku CLI is also needed, but I already had it.
Then in terminal, with it pointed to your repo directory, use the command `travis encrypt $(heroku auth:token) --add deploy.api_key`. It'll ask to confirm the repository. If you look at your .travis.yml file, it'll have the key in there.
Note that `heroku auth:token` is a Heroku CLI command that runs. So tha `$()` wrapper lets one command call another one, which is cool.

Upon running that and committing the new travis details, Travis ran, and after successfully doing test && build, it seems like it tried to deploy, but gave this error:

```Successfully installed dpl-1.10.2
1 gem installed
 ▸    not logged in
invalid option "--api_key="
failed to deploy
```

I simplified the travis.yml file (previously I was doing some logic with different branches going to different Heroku apps), and reran. At the end, got:

```
Skipping a deployment with the heroku provider because this branch is not permitted: DeploymentChanges
```

Notably, I did have DeploymentChanges listed in the "branches" parameter.
But in retrospect, it makes sense that it worked that way. You could want to run Travis for 5 branches, but only deploy with 1. So I needed to add the branch within the "deploy" section.

So at this point, my deploy segment is:

```
deploy:
  provider: heroku
  api_key:
    secure: ...
  run: npm run herokuDeploy
  app: multigame-browser-test
  on: DeploymentChanges
```

Upon committing, Travis runs as normal, but still returns the same error.

I tried separating the commands.
`heroku auth:token` to get a raw key, and then `travis encrypt MYKEYHERE -r ksnovak/Multigame_Browser --add deploy.api_key`. That added the encrypted key to my travis file.

This time around, it seems like things worked.

```
Installing deploy dependencies
Successfully installed multipart-post-2.0.0
Successfully installed faraday-0.15.3
Successfully installed rendezvous-0.1.2
Successfully installed netrc-0.11.0
Successfully installed dpl-heroku-1.10.2
5 gems installed
authentication succeeded
checking for app multigame-browser-test
found app multigame-browser-test
Preparing deploy
...
```

Ran the full herokuDeploy script. Looking over at my Heroku app, I see a new deployment triggered.
I was able to open the app and see the home screen. But upon trying to search My Favorites, nothing happened.
I looked in chrome console and got `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`.
I realized that this was a new Heroku app, so it didn't have my Twitch API keys added. I went and added those, it restarted the app, and then it all worked.

So now, we're at the point where it "works". It does what it used to, just Github -> Travis -> Heroku, instead of Github -> Travis -> Github -> Heroku. Which is nice. But that's only part of the goal here. We want to run `build` on the initial deploy, and then just `serve` in Heroku.

A new issue is discovered. After doing other stuff and then looking back at the commit, I noticed that it said the Travis build failed. Which seemed completely wrong, so I looked at the build log and saw:
[No output has been received in the last 10m0s, this potentially indicates a stalled build or something wrong with the build itself.](https://travis-ci.org/ksnovak/Multigame_Browser/builds/433922662#L4180).
So we need to figure out something that will send a signal back to Travis, that things went fine. We can't have every build marked as failing even though it worked perfectly.

After the deployment changes revolving around Webpack (see next section), builds pass now that they just have to run `npm start`.

```
Already up to date!
HEAD detached at 0e1418b
nothing to commit, working tree clean
Dropped refs/stash@{0} (ca88b1db2f4f404f07c89f9767ac42b3520d0a4b)
Done. Your build exited with 0.
```

#### Webpack

My webpack config came from the boilerplate I used (by [crsandeep](https://github.com/crsandeep/simple-react-full-stack)), and I am terrified to touch any part of it.
In terms of usage and deployment, I had a script called herokuDeploy, which ran `npm run build & npm run start`, which are, respectively, `webpack -p` and `babel-node src/server/server.js`. These scripts both got ran every time the Heroku instance had to restart. Which added a ~45sec delay every time it went to sleep, due to the webpack process.
So what we want to do is only run `webpack -p` when deploying from Travis, and then just do `babel-node ...` as needed.

I tried changing things accordingly, and I wanted to put version number to `0.5.1.2` just to see quick iterations of changes, but apparently that is illegal with semver and caused the build to break.

So after changing scripts as such:

```
"scripts": {
	...
    "start": "babel-node src/server/server.js",
	"herokuDeploy": "npm run start",
	"heroku-postbuild": "webpack -p"
	...
}
```

and deploying, things seemed to work. Now the next test is leaving the app alone for ~30 minutes to see how it acts upon sleeping and wakeup.

It no longer returns an error to the user. It still takes ~20sec to boot up, but maybe that's the best we can get for a free service.

```
2018-09-27T07:44:54.934294+00:00 heroku[web.1]: Idling
2018-09-27T07:44:54.934945+00:00 heroku[web.1]: State changed from up to down
2018-09-27T07:44:55.710426+00:00 heroku[web.1]: Stopping all processes with SIGTERM
2018-09-27T07:44:55.876541+00:00 heroku[web.1]: Process exited with status 143
2018-09-27T07:47:56.286634+00:00 heroku[web.1]: Unidling
2018-09-27T07:47:56.286920+00:00 heroku[web.1]: State changed from down to starting
2018-09-27T07:48:07.408957+00:00 heroku[web.1]: Starting process with command `npm start`
2018-09-27T07:48:10.000000+00:00 app[api]: Build started by user knovak8@gmail.com
2018-09-27T07:48:11.012903+00:00 app[web.1]:
2018-09-27T07:48:11.012921+00:00 app[web.1]: > multigame_browser@0.5.1 start /app
2018-09-27T07:48:11.012923+00:00 app[web.1]: > babel-node src/server/server.js
2018-09-27T07:48:11.012925+00:00 app[web.1]:
2018-09-27T07:48:24.311253+00:00 app[web.1]: Listening on port 6074, at 07:48:24 am (Thursday)
2018-09-27T07:48:24.987744+00:00 heroku[web.1]: State changed from starting to up
```
