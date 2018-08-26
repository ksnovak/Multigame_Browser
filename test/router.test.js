import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../src/server/server';
import Errors from '../src/server/Models/Errors';

process.env.NODE_ENV = 'test';

const should = chai.should();
chai.use(chaiHttp);

// All requests made have some very common functionality, reducec the repetition.
function commonRequest({
  url, query, onSuccess, rejectErrors, done
}) {
  chai
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

describe('Router', function () {
  // Define what a "slow" execution is. Because these tests all have to hit Twitch's API, they're expected to be slower than others
  this.slow(400);

  //Some names/IDs used for multiple tests, for ease/consistenccy
  let commonGames = {
    rimworld: { name: 'RimWorld', id: 394568 },
    alwaysOn: { name: 'Always On', id: 499973 },
    creative: { name: 'Creative', id: 488191 }
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
      it(`Gets the specified ${first} top games`, (done) => {
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

      it('Accepts a game by name', (done) => {
        commonRequest({
          url,
          query: { name: commonGames.rimworld.name },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.should.have.status(200);
            expect(res.body)
              .to.be.an('array')
              .with.lengthOf(1);
            expect(res.body[0]).to.have.property('id', commonGames.rimworld.id);

            done();
          }
        });
      });
      it('Accepts a game by ID', (done) => {
        commonRequest({
          url,
          query: { id: commonGames.rimworld.id },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.should.have.status(200);
            expect(res.body)
              .to.be.an('array')
              .with.lengthOf(1);
            expect(res.body[0]).to.have.property('name', commonGames.rimworld.name);

            done();
          }
        });
      });
      it('Accepts multiple games', (done) => {
        const gameNames = [
          'Dead Cells', // Spaces in name
          "Tom Clancy's Rainbow Six: Siege", // Apostrophe and Colon in name
          'Dungeons & Dragons', // Ampersand in name
          'Tidalis' // A game that is almost guaranteed to have no viewers (sorry, Arcen Games)
        ];
        commonRequest({
          url,
          query: { name: gameNames },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.should.have.status(200);
            expect(res.body)
              .to.be.an('array')
              .with.lengthOf(gameNames.length);

            done();
          }
        });
      });
      it('Does not return partial matches', (done) => {
        commonRequest({
          url,
          query: { name: 'World of Wo' },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            expect(res.body)
              .to.be.an('array')
              .with.lengthOf(0);
            done();
          }
        });
      });
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

      it('Gets the top games and specified ones', (done) => {
        commonRequest({
          url, query: { includeTop: true, name: ['Rimworld', 'Dead Cells'] }, rejectErrors: true, done, onSuccess: (err, res) => {
            //See comment on the main /games/top test for why this is a "within" range
            res.body.should.be.an('array').and.have.lengthOf.within(21, 22);

            let rimworldLocation = res.body.map(game => { return game.name }).indexOf('RimWorld');

            rimworldLocation.should.not.equal(-1)
            res.body[rimworldLocation].should.have.property('selected', true)

            done();
          }
        })
      })

      it('Has a special flag for all Specified games', (done) => {
        let gameNames = [commonGames.rimworld.name, commonGames.alwaysOn.name, 'Fortnite']
        commonRequest({
          url, query: { includeTop: true, name: gameNames, first: 5 }, rejectErrors: true, done, onSuccess: (err, res) => {
            res.body.should.be.an('array').with.lengthOf.at.least(5);
            let foundGames = 0;

            res.body.forEach(game => {
              if (gameNames.includes(game.name) && game.selected) {
                foundGames++;
              }
            })

            foundGames.should.equal(gameNames.length);

            done();
          }
        })
      })

      it('Does not return top games if the flag is false', (done) => {
        commonRequest({
          url, query: { includeTop: false, name: ['Rimworld', 'Dead Cells'] }, rejectErrors: true, done, onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(2);
            done();
          }
        })
      })


      it('Accepts \'first\' to change the number of games', (done) => {
        const first = 9
        commonRequest({
          url, query: { includeTop: true, first, name: ['Rimworld', 'Dead Cells'] }, rejectErrors: true, done, onSuccess: (err, res) => {
            //See comment on the main /games/top test for why this is a "within" range
            res.body.should.be.an('array').and.have.lengthOf.within(10, 11);
            done();
          }
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
    describe('/streams/games', () => {
      const url = '/api/streams/games';
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
      it('Gets streamers by game ID', (done) => {
        commonRequest({
          url,
          query: { game_id: commonGames.alwaysOn.id }, // Always On
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf.above(0);
            done();
          }
        });
      });
      it('Accepts multiple games (awkward test)', (done) => {
        const gameIDs = [commonGames.creative.id, commonGames.alwaysOn.id];
        commonRequest({
          url,
          query: { game_id: gameIDs },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            let gotCreative = false;
            let gotAlwaysOn = false;

            res.body.forEach((stream) => {
              if (stream.game_id === gameIDs[0]) {
                gotCreative = true;
              } else if (stream.game_id === gameIDs[1]) {
                gotAlwaysOn = true;
              }
            });

            expect(gotCreative).to.be.true;
            expect(gotAlwaysOn).to.be.true;
            done();
          }
        });
      });
      it("Allows 'first' to reduce the number of streams", (done) => {
        const first = 2;
        commonRequest({
          url,
          query: { game_id: commonGames.alwaysOn.id, first },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            res.body.should.be.an('array').and.have.lengthOf(first);
            done();
          }
        });
      });

      it("Allows 'language' to filter out certain languages", (done) => {
        // This is an awkward test. Making two calls, one nested, and testing that they have different results.
        commonRequest({
          url,
          query: { game_id: commonGames.alwaysOn.id },
          rejectErrors: true,
          done,
          onSuccess: (err, res) => {
            const results = res.body;

            commonRequest({
              url,
              query: { game_id: commonGames.alwaysOn.id, language: 'es' },
              rejectErrors: true,
              done,
              onSuccess: (err2, res2) => {
                expect(results).to.not.deep.equal(res2.body);
                done();
              }
            });
          }
        });
      });
    });
    describe('/streams/combo', () => {
      it('exists')
    })
  });
});
