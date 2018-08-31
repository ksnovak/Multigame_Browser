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

    describe('Parameter value retrieving', () => {
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

      it('Gets the values from a specified parameter', () => {
        const vals = QueryOptions.getPassedVals('games_count', params);
        expect(vals)
          .to.be.an('array')
          .with.lengthOf(1);
      });
      it('Gets the values when there are 2 relevant parameters', () => {
        const vals = QueryOptions.getPassedVals(['game_id', 'GAME_ID'], params);
        expect(vals)
          .to.be.an('array')
          .with.lengthOf(4);
      });
      it('Gracefully handles a non-existent parameter', () => {
        expect(QueryOptions.getPassedVals('height', params)).to.equal(null);
        expect(QueryOptions.getPassedVals('', params)).to.equal(null);
        expect(QueryOptions.getPassedVals(null, params)).to.equal(null);
        expect(QueryOptions.getPassedVals(54353, params)).to.equal(null);
      });
      it('Gracefully handles a non-existent params set', () => {
        const vals = QueryOptions.getPassedVals('games_count', null);
      });
    });

    describe.only('Typed value cleanup', () => {
      const optionSet = {
        include_top_games: { type: 'boolean', duplicate: true, default: false },
        games_count: { type: 'number' },
        game_id: { type: 'number', duplicate: true }
      };

      it('Retrieves all numbers from the passed parameter array', () => {
        const inValues = [5, '6', 'seven', null, undefined, true];
        const outValues = QueryOptions.getCleanedNumbers(inValues);

        expect(outValues).to.deep.equal([5, 6]);
      });

      it('Returns null if there were no valid numerical values', () => {
        expect(QueryOptions.getCleanedNumbers(['seven', 'fifty'])).to.equal(null);
      });

      it('Retrieves all the boolean values from the passed parameter array', () => {
        const inValues = [true, false, 'TRUE', 'f', 1, 50, null, undefined, 'tralse', false];
        const outVals = QueryOptions.getCleanedBools(inValues);
        expect(outVals).to.deep.equal([true, false, true, false, true, false]);
      });

      it('Returns null if there were no valid boolean values', () => {
        expect(QueryOptions.getCleanedBools(['troo', 'flase'])).to.equal(null);
      });
    });

    describe('Array simplification', () => {
      it('Retrieves the first value of an array, if arrays are disallowed', () => {
        expect(QueryOptions.getSimplifiedArray(false, [5, 23, 900, 'awesome'])).to.equal(5);
      });

      it('Correctly handles a single element being passed in', () => {
        expect(QueryOptions.getSimplifiedArray(true, 23)).to.equal(23);
      });

      it('Converts from array of 1 into the single element', () => {
        expect(QueryOptions.getSimplifiedArray(true, ['Bananas'])).to.equal('Bananas');
      });

      it('Retains an array if allowed to', () => {
        const inValues = ['Balance', 'Brilliance', 'Bravery'];
        expect(QueryOptions.getSimplifiedArray(true, inValues)).to.equal(inValues);
      });

      it('Returns null if there are no valid values to return', () => {
        expect(QueryOptions.getSimplifiedArray(true, undefined)).to.equal(null);
      });
    });

    describe.only('Default values', () => {
      it('Returns a default value if the given one is invalid', () => {
        expect(QueryOptions.getDefaultValue(37, undefined)).to.equal(37);
        expect(QueryOptions.getDefaultValue('Rimworld', null)).to.equal('Rimworld');
      });

      it('Ignores default value if there is a valid user-passed value', () => {
        const valueSets = [
          { default: 37, user: 50 },
          { default: 'Rimworld', user: 'Dead Cells' },
          { default: true, user: false },
          { default: 1, user: 0 }
        ];

        valueSets.forEach((vals) => {
          expect(QueryOptions.getDefaultValue(vals.default, vals.user)).to.equal(vals.user);
        });
      });
    });
    });
  });
});
