import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../src/server/server';
import Errors from '../src/server/Models/Errors';

process.env.NODE_ENV = 'test';

const should = chai.should();
chai.use(chaiHttp);

// All requests made have some very common functionality, reducec the repetition.
function commonRequest({ url, query, onSuccess, rejectErrors, done }) {
  return chai
    .request(app)
    .get(url)
    .query(query)
    .end((err, res) => {
      // Automatically fail a test that has an error, if the "rejectErrors" flag is set to true, and the "done" function is passed
      if (rejectErrors && done && (err || res.error)) {
        done(err || res.error);
      }
      onSuccess(err, res);
    });
}

async function asyncCommonRequest({ url, query }) {
  return await chai
    .request(app)
    .get(url)
    .query(query)
}

describe('Router', function () {
  // Define what a "slow" execution is. Because these tests all have to hit Twitch's API, they're expected to be slower than others
  this.slow(400);

  //Some names/IDs used for multiple tests, for ease/consistenccy
  let commonGames = {
    rimworld: { name: 'RimWorld', id: 394568 },
    alwaysOn: { name: 'Always On', id: 499973 },
    creative: { name: 'Creative', id: 488191 },
    fortnite: { name: 'Fortnite', id: 33214 },
    deadCells: { name: 'Dead Cells', id: 495961 },
    league: { name: 'League of Legends', id: 21779 },
  }

  it('Gets a response from the server', (done) => {
    commonRequest({
      url: '/',
      onSuccess: (err, res) => {
        if (err) {
          done(err);
        }
        res.should.have.status(404);
        done();
      }
    });
  });

  describe('Games', () => {

    describe('/games/top', () => {
      const url = '/api/games/top';
      //Awkward test because for some reason the Twitch API sometimes returns 1-too-few games in the /top list.
      it('Gets top 20 games by default', (done) => {
        commonRequest({
          url,
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf.within(19, 20);
            done();
          }
        });
      });

      const first = 4;
      it(`Accepts \'first\' to retrieve a specific number of games`, (done) => {
        commonRequest({
          url,
          query: { first },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf.within(first - 1, first);
            done();
          }
        });
      });
    });

    describe('/games/specific', () => {
      const url = '/api/games/specific';
      it('Returns nothing with no games specified', (done) => {
        commonRequest({
          url,
          onSuccess: (err, res) => {
            if (err) {
              done(err);
            }

            expect(res.body)
              .to.be.an('array')
              .with.lengthOf(0);
            done();
          }
        });
      });

      describe('Multiple tests on same result:', async (done) => {
        let results;

        before(async () => {
          let response = await asyncCommonRequest({
            url,
            query: {
              name: [commonGames.rimworld.name, commonGames.creative.name, 'World of wo', "Tom Clancy's Rainbow Six: Siege", "Dungeons & Dragons", "Tidalis"],
              id: [commonGames.rimworld.id, commonGames.deadCells.id]
            }
          })
          results = response.body
        })

        it('Accepts multiple games', (done) => {
          results.should.have.lengthOf(6)
          done();
        })
        it('Does not have duplicates', (done) => {
          let rimworldID = commonGames.rimworld.id;
          let resultsIDs = results.map(game => game.id);

          resultsIDs.indexOf(rimworldID).should.equal(resultsIDs.lastIndexOf(rimworldID)).and.not.equal(-1)

          done();
        })

        it('Accepts a game by name', (done) => {
          results.map(game => game.name).should.contain(commonGames.creative.name)
          done();
        })

        it('Accepts a game by ID', (done) => {
          results.map(game => game.id).should.contain(commonGames.deadCells.id)
          done();

        })

        it('Does not return partial matches', (done) => {
          results.map(game => game.name).should.not.contain('World of Warcraft')
          done();
        })

        it('Accepts unusual characters (Apostrophe, Colon, Ampersand)', (done) => {
          results.map(game => game.name).should.contain("Tom Clancy's Rainbow Six: Siege").and.contain("Dungeons & Dragons")
          done();
        })

        //Imperfect test. We can't know for sure that this game has no viewers, and no streamers. It's a fairly safe bet though.
        it('Returns a game even if it has no viewers', (done) => {
          results.map(game => game.name).should.contain('Tidalis')
          done()
        })
      })


    });

    describe('/games/combo', () => {
      const url = '/api/games/combo';

      it('Returns nothing, if nothing is specified', (done) => {
        commonRequest({
          url, rejectErrors: true, done, onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(0);
            done();
          }
        })
      })

      it('Does not return top games if the flag is false', (done) => {
        commonRequest({
          url, query: { includeTop: false, name: [commonGames.rimworld.name, commonGames.deadCells.name] }, rejectErrors: true, done, onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(2);
            done();
          }
        })
      })


      it('Gets the top games and specified ones', (done) => {
        commonRequest({
          url, query: { includeTop: true, name: [commonGames.rimworld.name, commonGames.deadCells.name] }, rejectErrors: true, done, onSuccess: (err, res) => {
            //See comment on the main /games/top test for why this is a "within" range
            res.body.should.be.an('array').and.have.lengthOf.within(21, 22);

            let rimworldLocation = res.body.map(game => { return game.name }).indexOf(commonGames.rimworld.name);

            rimworldLocation.should.not.equal(-1)
            res.body[rimworldLocation].should.have.property('selected', true)

            done();
          }
        })
      })

      describe('Multiple tests on same result:', async (done) => {
        const first = 5;
        const passedGames = [commonGames.fortnite, commonGames.league, commonGames.rimworld]
        let results;

        before(async () => {
          let response = await asyncCommonRequest({
            url,
            first,
            query: {
              includeTop: true,
              first,
              name: [passedGames[0].name, passedGames[0].name, passedGames[2].name],
              id: [passedGames[1].id, passedGames[0].id]
            }
          })
          results = response.body
        })

        it('Accepts \'first\' to change the number of games', (done) => {
          results.should.be.an('array').with.lengthOf.within(first, first + passedGames.length)
          done();
        })

        it('Has a special flag for all Specified games', (done) => {
          let selectedCount = 0;
          const passedIDs = passedGames.map(game => game.id)
          results.forEach(game => {
            if (game.selected && passedIDs.includes(game.id)) {
              selectedCount++;
            }
          })

          selectedCount.should.equal(passedGames.length);
          done();
        })

        it('Does not have any duplicated games (top x name x id)', (done) => {
          let passedIDs = passedGames.map(game => game.id);
          let resultsIDs = results.map(game => game.id);

          passedIDs.forEach(id => {
            resultsIDs.indexOf(id).should
              .equal(resultsIDs.lastIndexOf(id))
              .and.not.equal(-1)
          })

          done();
        })
      })
    })
  });

  describe('Streams', () => {
    describe('/streams/top', () => {
      const url = '/api/streams/top';
      it('Gets the top overall streams', (done) => {
        commonRequest({
          url,
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(20);
            done();
          }
        });
      });
      it("Accepts 'first' to reduce the number of streams", (done) => {
        const first = 7;
        commonRequest({
          url,
          query: { first },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(first);
            done();
          }
        });
      });
    });
    describe('/streams/list', () => {
      const url = '/api/streams/list';
      it('Returns nothing with no games specified', (done) => {
        commonRequest({
          url,
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(0);

            done();
          }
        });
      });

      describe('Multiple tests on same result:', async (done) => {
        let results;
        let first = 15;
        let passedIDs = [commonGames.league.id, commonGames.fortnite.id]

        before(async () => {
          let response = await asyncCommonRequest({
            url,
            query: { first, game_id: passedIDs },
          })
          results = response.body
        })

        it('Gets streamers by game ID', (done) => {
          results.should.be.an('array').with.lengthOf.above(0)
          done();
        })

        it('Displays results from multiple specified games', (done) => {
          let gotLeague = false;
          let gotFortnite = false;

          results.forEach(stream => {
            if (stream.game_id === passedIDs[0])
              gotLeague = true;
            else if (stream.game_id === passedIDs[1])
              gotFortnite = true;
          })

          expect(gotLeague).to.be.true;
          expect(gotFortnite).to.be.true;
          done();
        })

        it("Allows 'first' to reduce the number of streams", (done) => {
          results.should.have.lengthOf.within(0, first)
          done()
        })

        it('Allows \'language\' to filter for certain languages', (done) => {
          commonRequest({
            url,
            query: { game_id: passedIDs, language: 'es' },
            rejectErrors: true,
            done,
            onSuccess: (err2, innerResults) => {

              expect(results).to.not.deep.equal(innerResults.body);
              done();
            }
          });
        })
      })
    });
  });

  describe('Combo', () => {
    const url = '/api/combo';

    it('Returns nothing, if nothing is specified', (done) => {
      commonRequest({
        url, rejectErrors: true, done, onSuccess: (err, res) => {

          res.body.games.should.have.lengthOf(0);
          res.body.streams.should.have.lengthOf(0);
          done();
        }
      })
    })
    it('Returns the top games and streams, when passed \'includetop\'', (done) => {
      commonRequest({
        url, query: { includeTop: true }, rejectErrors: true, done, onSuccess: (err, res) => {
          res.body.games.should.have.lengthOf(20);
          res.body.streams.should.have.lengthOf(20);
          done();
        }
      })
    })


    describe('Multiple tests on same result:', function () {
      const first = 25;
      let results;

      before(async function () {
        let response = await asyncCommonRequest({
          url, first,
          query: {
            first,
            name: [commonGames.rimworld.name],
            id: [commonGames.deadCells.id],
            user_login: ['food'],
            user_id: 149747285 //TwitchPresents
          }
        })

        results = response.body
      })

      it('Returns both Game and Stream data', (done) => {

        results.should.have.property('games');
        results.should.have.property('streams')

        results.games.should.have.lengthOf(2)
        done();
      })
      it('Returns s&g when passed a game name', (done) => {

        results.games.map(game => game.id).should.include(commonGames.rimworld.id)
        results.streams.map(stream => stream.game_id).should.include(commonGames.rimworld.id)
        done();
      })
      it('Returns s&g when passed a game ID', (done) => {
        results.games.map(game => game.id).should.include(commonGames.deadCells.id)
        results.streams.map(stream => stream.game_id).should.include(commonGames.deadCells.id)
        done();
      })
      it('Returns stream data when passed a username', (done) => {
        results.streams.map(stream => stream.login).should.include('food')
        done();
      })
      it('Returns stream data when passed a user ID', (done) => {

        results.streams.map(stream => stream.login).should.include('twitchpresents')
        done();

      })
      it('Accepts \'first\' to specify the number of streams returned', (done) => {
        //Expected 2 extra because of 2 special users passed
        results.streams.should.have.lengthOf(first + 2)
        done()
      })

    })

  })
});
