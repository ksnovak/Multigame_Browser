import assert from 'assert';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chalk from 'chalk';
import { app } from '../src/server/server';
import Errors from '../src/server/Models/Errors';

process.env.NODE_ENV = 'test';

const should = chai.should();
chai.use(chaiHttp);

// All requests made have some very common functionality, reducec the repetition.
function commonRequest(url, query, results) {
  chai
    .request(app)
    .get(url)
    .query(query)
    .end((err, res) => {
      results(err, res);
    });
}

describe('Router', () => {
  it('Gets a response from the server', () => {
    chai
      .request(app)
      .get('/')
      .end((err, res) => {
        if (err || res.err) {
          throw err || res.err;
        } else {
          res.should.have.status(404);
        }
      });
  });

  describe('Games', () => {
    describe('/games/top', () => {
      const url = '/api/games/top';
      it('Gets top 20 games by default', (done) => {
        commonRequest(url, {}, (err, res) => {
          if (err || res.err) {
            done(err || res.err);
          } else {
            res.body.should.be.an('array').and.have.lengthOf.within(19, 20);
            done();
          }
        });
      });

      const first = 4;
      it(`Gets the specified ${first} top games`, (done) => {
        commonRequest(url, { first }, (err, res) => {
          if (err || res.err) {
            done(err || res.err);
          } else {
            res.body.should.be.an('array').and.have.lengthOf(first);
            done();
          }
        });
      });
    });

    describe('/games/specific', () => {
      const url = '/api/games/specific';
      it('Returns nothing with no games specified', (done) => {
        commonRequest(url, {}, (err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(400);
          res.body.should.be.empty;
          done();
        });
      });

      it('Accepts a game by name', (done) => {
        commonRequest(url, { name: 'rimworld' }, (err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          expect(res.body)
            .to.be.an('array')
            .with.lengthOf(1);
          expect(res.body[0]).to.have.property('id', 394568);

          done();
        });
      });
      it('Accepts a game by ID', (done) => {
        commonRequest(url, { id: 394568 }, (err, res) => {
          if (err) {
            done(err);
          }

          res.should.have.status(200);
          expect(res.body)
            .to.be.an('array')
            .with.lengthOf(1);
          expect(res.body[0]).to.have.property('name', 'RimWorld');

          done();
        });
      });
      it('Accepts multiple games', (done) => {
        const gameNames = [
          'Dead Cells', // Spaces in name
          "Tom Clancy's Rainbow Six: Siege", // Apostrophe and Colon in name
          'Dungeons & Dragons', // Ampersand in name
          'Tidalis' // A game that is almost guaranteed to have no viewers (sorry, Arcen Games)
        ];
        commonRequest(url, { name: gameNames }, (err, res) => {
          if (err) {
            done(err);
          }

          res.should.have.status(200);
          expect(res.body)
            .to.be.an('array')
            .with.lengthOf(gameNames.length);

          done();
        });
      });
      it('Does not return partial matches', (done) => {
        commonRequest(url, { name: 'World of Wo' }, (err, res) => {
          if (err) {
            done(err);
          }

          expect(res.body)
            .to.be.an('array')
            .with.lengthOf(0);
          done();
        });
      });
    });
  });

  describe.skip('Streams', () => {});
});
