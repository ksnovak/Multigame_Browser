import assert from 'assert';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import chalk from 'chalk';
import { app } from '../src/server/server';
import Errors from '../src/server/Models/Errors';

process.env.NODE_ENV = 'test';

const should = chai.should();
chai.use(chaiHttp);

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
      it('Gets top 20 games by default', (done) => {
        chai
          .request(app)
          .get('/api/games/top')
          .end((err, res) => {
            if (err || res.err) {
              done(err || res.err);
            } else {
              // WARNING: This is a really weird hacky situation. For some reason, twitch API inconsistently sends either 19 or 20.
              //   console.log(`${chalk.green('Note:')} got ${res.body.length} from /games/top`);
              res.body.should.be.an('array').and.have.lengthOf.within(19, 20);
              done();
            }
          });
      });

      const first = 4;
      it(`Gets the specified ${first} top games`, (done) => {
        chai
          .request(app)
          .get('/api/games/top')
          .query({ first })
          .end((err, res) => {
            if (err || res.err) {
              done(err || res.err);
            } else {
              res.body.should.be.an('array').and.have.lengthOf(first);
              done();
            }
          });
      });
    });

    describe.only('/games/specific', () => {
      it('Returns nothing with no games specified', (done) => {
        chai
          .request(app)
          .get('/api/games/specific')
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(400);
            expect(res.body).to.be.empty;
            done();
          });
      });
      it('Accepts a game by name');
      it('Accepts a game by ID');
      it('Accepts multiple games');
      it('Does not return partial matches');
    });
  });

  describe.skip('Streams', () => {});
});
