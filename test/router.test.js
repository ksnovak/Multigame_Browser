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
  return chai
    .request(app)
    .get(url)
    .query(query);
}

describe('Router', function () {
  // Define what a "slow" execution is. Because these tests all have to hit Twitch's API, they're expected to be slower than others
  this.slow(400);

  // Some names/IDs used for multiple tests, for ease/consistenccy
  const commonGames = {
    rimworld: { name: 'RimWorld', id: 394568 },
    alwaysOn: { name: 'Always On', id: 499973 },
    creative: { name: 'Creative', id: 488191 },
    fortnite: { name: 'Fortnite', id: 33214 },
    deadCells: { name: 'Dead Cells', id: 495961 },
    league: { name: 'League of Legends', id: 21779 }
  };

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
      // Awkward test because for some reason the Twitch API sometimes returns 1-too-few games in the /top list.
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

      const games_count = 4;
      it("Accepts 'games_count' to retrieve a specific number of games", (done) => {
        commonRequest({
          url,
          query: { games_count },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf.within(games_count - 1, games_count);
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

      describe('Multiple tests on same result:', async () => {
        let results;

        before(async () => {
          const response = await asyncCommonRequest({
            url,
            query: {
              game: [
                commonGames.rimworld.name,
                commonGames.creative.name,
                'World of wo',
                "Tom Clancy's Rainbow Six: Siege",
                'Dungeons & Dragons',
                'Tidalis'
              ],
              game_id: [commonGames.rimworld.id, commonGames.deadCells.id]
            }
          });
          results = response.body;
        });

        it('Accepts multiple games', (done) => {
          results.should.have.lengthOf(6);
          done();
        });
        it('Does not have duplicates', (done) => {
          const rimworldID = commonGames.rimworld.id;
          const resultsIDs = results.map(game => game.id);

          resultsIDs
            .indexOf(rimworldID)
            .should.equal(resultsIDs.lastIndexOf(rimworldID))
            .and.not.equal(-1);

          done();
        });

        it('Accepts a game by name', (done) => {
          results.map(game => game.name).should.contain(commonGames.creative.name);
          done();
        });

        it('Accepts a game by ID', (done) => {
          results.map(game => game.id).should.contain(commonGames.deadCells.id);
          done();
        });

        it('Does not return partial matches', (done) => {
          results.map(game => game.name).should.not.contain('World of Warcraft');
          done();
        });

        it('Accepts unusual characters (Apostrophe, Colon, Ampersand)', (done) => {
          results
            .map(game => game.name)
            .should.contain("Tom Clancy's Rainbow Six: Siege")
            .and.contain('Dungeons & Dragons');
          done();
        });

        // Imperfect test. We can't know for sure that this game has no viewers, and no streamers. It's a fairly safe bet though.
        it('Returns a game even if it has no viewers', (done) => {
          results.map(game => game.name).should.contain('Tidalis');
          done();
        });
      });
    });

    describe('/games/combo', () => {
      const url = '/api/games/combo';

      it('Returns nothing, if nothing is specified', (done) => {
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

      it('Does not return top games if the flag is false', (done) => {
        commonRequest({
          url,
          query: {
            include_top: false,
            game: [commonGames.rimworld.name, commonGames.deadCells.name]
          },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(2);
            done();
          }
        });
      });

      it('Gets the top games and specified ones', (done) => {
        commonRequest({
          url,
          query: {
            include_top: true,
            game: [commonGames.rimworld.name, commonGames.deadCells.name]
          },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            // See comment on the main /games/top test for why this is a "within" range
            res.body.should.be.an('array').and.have.lengthOf.within(21, 22);

            const rimworldLocation = res.body
              .map(game => game.name)
              .indexOf(commonGames.rimworld.name);

            rimworldLocation.should.not.equal(-1);
            res.body[rimworldLocation].should.have.property('selected', true);

            done();
          }
        });
      });

      describe('Multiple tests on same result:', async () => {
        const games_count = 5;
        const passedGames = [commonGames.fortnite, commonGames.league, commonGames.rimworld];
        let results;

        before(async () => {
          const response = await asyncCommonRequest({
            url,
            games_count,
            query: {
              include_top: true,
              games_count,
              game: [passedGames[0].name, passedGames[0].name, passedGames[2].name],
              game_id: [passedGames[1].id, passedGames[0].id]
            }
          });

          results = response.body;
        });

        it("Accepts 'games_count' to change the number of games", (done) => {
          results.should.be
            .an('array')
            .with.lengthOf.within(games_count, games_count + passedGames.length);
          done();
        });

        it('Has a special flag for all Specified games', (done) => {
          let selectedCount = 0;
          const passedIDs = passedGames.map(game => game.id);
          results.forEach((game) => {
            if (game.selected && passedIDs.includes(game.id)) {
              selectedCount += 1;
            }
          });

          selectedCount.should.equal(passedGames.length);
          done();
        });

        it('Does not have any duplicated games (top x name x id)', (done) => {
          const passedIDs = passedGames.map(game => game.id);
          const resultsIDs = results.map(game => game.id);

          passedIDs.forEach((id) => {
            resultsIDs
              .indexOf(id)
              .should.equal(resultsIDs.lastIndexOf(id))
              .and.not.equal(-1);
          });

          done();
        });
      });
    });
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
      it("Accepts 'streams_count' to reduce the number of streams", (done) => {
        const streams_count = 7;
        commonRequest({
          url,
          query: { streams_count },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(streams_count);
            done();
          }
        });
      });

      it("Accepts 'exclude' to remove certain specific streams", (done) => {
        commonRequest({
          url,
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            const outerNames = res.body.map(stream => stream.name);

            commonRequest({
              url,
              query: { exclude: outerNames[0] },
              rejectErrors: true,
              done,
              onSuccess: (err, innerRes) => {
                const innerNames = innerRes.body.map(stream => stream.name);

                expect(innerNames).to.not.contain(outerNames[0]);
                done();
              }
            });
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

      describe('Multiple tests on same result:', async () => {
        let results;
        const streams_count = 15;
        const passedIDs = [commonGames.league.id, commonGames.fortnite.id];

        before(async () => {
          const response = await asyncCommonRequest({
            url,
            query: { streams_count, game_id: passedIDs }
          });
          results = response.body;
        });

        it('Gets streamers by game ID', (done) => {
          results.should.be.an('array').with.lengthOf.above(0);
          done();
        });

        it('Displays results from multiple specified games', (done) => {
          let gotLeague = false;
          let gotFortnite = false;

          results.forEach((stream) => {
            if (stream.game_id === passedIDs[0]) gotLeague = true;
            else if (stream.game_id === passedIDs[1]) gotFortnite = true;
          });

          expect(gotLeague).to.be.true;
          expect(gotFortnite).to.be.true;
          done();
        });

        it("Allows 'streams_count' to reduce the number of streams", (done) => {
          results.should.have.lengthOf.within(0, streams_count);
          done();
        });

        // Has an inner request
        it("Allows 'language' to filter for certain languages", (done) => {
          commonRequest({
            url,
            query: { streams_count, game_id: passedIDs, language: 'es' },
            rejectErrors: true,
            done,
            onSuccess: (err2, innerResults) => {
              expect(results).to.not.deep.equal(innerResults.body);
              done();
            }
          });
        });

        // Has an inner request
        it("Allows 'exclude' to prevent certain streamers from showing up", (done) => {
          const outerNames = results.map(stream => stream.name);

          commonRequest({
            url,
            query: { streams_count, game_id: passedIDs, exclude: [outerNames[0]] },
            rejectErrors: true,
            done,
            onSuccess: (err2, innerResults) => {
              const innerNames = innerResults.body.map(stream => stream.name);

              expect(innerNames).to.not.contain(outerNames[0]);

              done();
            }
          });
        });
      });
    });
  });

  describe('Combo', () => {
    const url = '/api/combo';

    it('Returns nothing, if nothing is specified', (done) => {
      commonRequest({
        url,
        rejectErrors: true,
        done,
        onSuccess: (err, res) => {
          res.body.games.should.have.lengthOf(0);
          res.body.streams.should.have.lengthOf(0);
          done();
        }
      });
    });
    it("Returns the top games, when passed 'include_top'", (done) => {
      commonRequest({
        url,
        query: { include_top: true },
        rejectErrors: true,
        done,
        onSuccess: (err, res) => {
          res.body.games.should.have.lengthOf.within(19, 20);
          done();
        }
      });
    });

    it("Returns the top streams, when passed 'include_top_streams'", (done) => {
      commonRequest({
        url,
        query: { include_top_streams: true },
        rejectErrors: true,
        done,
        onSuccess: (err, res) => {
          res.body.streams.should.have.lengthOf(20);
          done();
        }
      });
    });

    it('Makes sure to obtain game information for streams before returning', (done) => {
      commonRequest({
        url,
        query: { name: 'rifftrax' },
        rejectErrors: true,
        done,
        onSuccess: (err, res) => {
          const stream = res.body.streams[0];
          const gameDetails = res.body.games.filter(game => game.id === stream.game_id);

          gameDetails.should.be.an('array').with.lengthOf(1);
          gameDetails[0].should.have.property('id');
          gameDetails[0].should.have.property('name');
          gameDetails[0].should.not.have.property('selected');

          done();
        }
      });
    });

    describe('Multiple tests on same result:', () => {
      const streams_count = 25;
      let results;

      before(async () => {
        const response = await asyncCommonRequest({
          url,
          query: {
            streams_count,
            game: [commonGames.rimworld.name],
            game_id: [commonGames.deadCells.id],
            name: ['hungry'],
            stream_id: 7832442 // RiffTrax
          }
        });

        results = response.body;
      });

      it('Returns both Game and Stream data', (done) => {
        results.should.have.property('games');
        results.should.have.property('streams');

        results.games.should.have.lengthOf.at.least(2);
        done();
      });
      it('Returns s&g when passed a game name', (done) => {
        results.games.map(game => game.id).should.include(commonGames.rimworld.id);
        results.streams.map(stream => stream.game_id).should.include(commonGames.rimworld.id);
        done();
      });
      it('Returns s&g when passed a game ID', (done) => {
        results.games.map(game => game.id).should.include(commonGames.deadCells.id);
        results.streams.map(stream => stream.game_id).should.include(commonGames.deadCells.id);
        done();
      });
      it('Returns stream data when passed a username', (done) => {
        results.streams.map(stream => stream.name).should.include('hungry');
        done();
      });
      it('Returns stream data when passed a user ID', (done) => {
        results.streams.map(stream => stream.name).should.include('rifftrax');
        done();
      });
      it("Accepts 'streams_count' to specify the number of streams returned", (done) => {
        // Expected 2 extra because of 2 special users passed
        results.streams.should.have.lengthOf(streams_count + 2);
        done();
      });
      it("Accepts 'exclude' to remove specific streams from the results", async () => {
        const outerNames = results.streams.map(stream => stream.name);

        const innerResponse = await asyncCommonRequest({
          url,
          query: {
            streams_count,
            game: [commonGames.rimworld.name],
            game_id: [commonGames.deadCells.id],
            name: ['hungry'],
            stream_id: 7832442, // RiffTrax,
            exclude: outerNames[2]
          }
        });

        const innerNames = innerResponse.body.streams.map(stream => stream.name);

        expect(innerNames).to.not.include(outerNames[2]);
      });
    });
  });
});
