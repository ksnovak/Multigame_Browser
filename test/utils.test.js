import assert from 'assert';
import chai, { expect } from 'chai';
import utils from '../src/utils';

const should = chai.should();

describe('Array merging function', () => {
  const tests = [
    { text: 'Array + Array', prime: [1, 3, 5], second: [2, 4, 6], results: [1, 3, 5, 2, 4, 6] },
    { text: 'Array + Val', prime: [1, 3, 5], second: 2, results: [1, 3, 5, 2] },
    { text: 'Array + []', prime: [1, 3, 5], second: [], results: [1, 3, 5] },
    { text: 'Array + null', prime: [1, 3, 5], second: null, results: [1, 3, 5] },
    { text: 'Array + [null]', prime: [1, 3, 5], second: [null], results: [1, 3, 5] },
    { text: 'Val + val', prime: 1, second: 2, results: [1, 2] },
    { text: 'Val + []', prime: 1, second: [], results: [1] },
    { text: '[] + []', prime: [], second: [], results: [] },
    { text: 'Val + [null]', prime: 1, second: [null], results: [1] },
    { text: '[] + []', prime: [], second: [null], results: [] },
    {
      text: 'Two arrs of strings',
      prime: ['a', 'b', 'c'],
      second: ['d', 'e', 'f'],
      results: ['a', 'b', 'c', 'd', 'e', 'f']
    },
    {
      text: 'Arr of strings & string',
      prime: ['a', 'b', 'c'],
      second: 'd',
      results: ['a', 'b', 'c', 'd']
    },
    { text: 'Two strings', prime: 'a', second: 'b', results: ['a', 'b'] },
    { text: 'Different casing', prime: 'a', second: 'A', results: ['a', 'A'] },

    {
      text: 'Remove duplicates',
      prime: [1, 3, 5, 3, 6],
      second: [2, 4, 6, 4, 6],
      results: [1, 3, 5, 6, 2, 4]
    }
  ];

  tests.forEach((test) => {
    it(test.text, () => {
      expect(utils.mergeArraysOfValues(test.prime, test.second, false, true)).deep.equals(
        test.results
      );
    });
  });

  tests.forEach((test) => {
    it(`Sort and ${test.text}`, () => {
      expect(utils.mergeArraysOfValues(test.prime, test.second, true, true)).deep.equals(
        test.results.sort()
      );
    });
  });

  it("Doesn't remove dupes if unneccessary", () => {
    const test = {
      prime: [1, 3, 5, 3, 6],
      second: [2, 4, 6, 4, 6],
      results: [1, 3, 5, 3, 6, 2, 4, 6, 4, 6]
    };

    expect(utils.mergeArraysOfValues(test.prime, test.second, false, false)).deep.equals(
      test.results
    );
  });
});
