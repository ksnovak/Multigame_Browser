import assert from 'assert';
import chai, { expect } from 'chai';
import QueryOptions from '../src/server/Models/QueryOptions';

const should = chai.should();

describe('Models', () => {
  describe('Game', () => {
    it('is game');
  });
  describe('Stream', () => {
    it('is stream');
  });
  describe('Errors', () => {
    it('is error');
  });
  describe('QueryOptions', () => {
    describe('Option set', () => {
      it('Gets a set of valid options when passed a valid endpoint', (done) => {
        expect(QueryOptions.getOptionSet('/games/specific')).to.have.property('game_id');
        done();
      });

      it('Gets no options when passed an invalid endpoint', (done) => {
        expect(QueryOptions.getOptionSet('/blah/bloop')).to.equal(null);
        expect(QueryOptions.getOptionSet(null)).to.equal(null);
        done();
      });
    });

    describe('Name cleaning', () => {
      it('Can parse all-caps query values passed in', (done) => {
        const cleanName = QueryOptions.getCleanName('GAME_NAME');
        cleanName.should.equal('game_name');
        done();
      });

      it('Returns null if an unexpected query param is passed in', (done) => {
        expect(QueryOptions.getCleanName('4')).to.equal(null);
        expect(QueryOptions.getCleanName('')).to.equal(null);
        done();
      });
    });

    describe('Allowed qualities', () => {
      const optionSet = {
        include_top_games: { type: 'boolean', default: false },
        games_count: { type: 'number' },
        game_id: { type: 'number', duplicate: true }
      };

      it('Lists the qualities a given parameter can have', (done) => {
        const qualities = QueryOptions.getAllowedProperties(optionSet, 'include_top_games');
        expect(qualities).to.have.property('type', 'boolean');
        expect(qualities).to.have.property('default', false);
        done();
      });

      it('returns null for a non-existent parameter', (done) => {
        expect(QueryOptions.getAllowedProperties(optionSet, 'language')).to.equal(null);
        expect(QueryOptions.getAllowedProperties(optionSet, 5)).to.equal(null);
        expect(QueryOptions.getAllowedProperties(optionSet, null)).to.equal(null);
        done();
      });
    });

    describe('Parameter name cleaning', () => {
      it('Finds relevant parameters in the user-passed params', () => {
        const names = QueryOptions.getMatchingNames(
          { include_TOP: true, include_top: [true, 0], INCLUDE_TOP: false, include_t: false },
          'include_top'
        );

        names.should.be.an('array').of.length(3);
      });

      it('Returns null if no relevant parameters were passed', () => {
        const names = QueryOptions.getMatchingNames(
          {
            include_t: true,
            games_first: 20,
            games_before: 5,
            game_name: 'Rimworld'
          },
          'include_top'
        );

        expect(names).to.equal(null);
      });
    });

    describe('Parameter value cleaning', () => {
      const optionSet = {
        include_top_games: { type: 'boolean', default: false },
        games_count: { type: 'number' },
        game_id: { type: 'number', duplicate: true }
      };

      const params = {
        INCLUDE_TOP_GAMES: false,
        games_count: 5,
        game_id: [1, 20, 500],
        GAME_ID: 63
      };

      const vals = QueryOptions.getPassedVals(optionSet, ['game_id', 'GAME_ID'], params);
      expect(vals)
        .to.be.an('array')
        .with.lengthOf(4);
    });

    });
  });
});
