import chalk from 'chalk';

export default {
  devLog(message) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(message);
    }
  },

  devChalk(color, message) {
    if (message === undefined) return chalk.keyword(color);
    return chalk.keyword(color)(message);
  },

  // Check if the given name is in the "exclude" list
  isInExclude(name, exclude) {
    // If no exclude is given, exit early
    if (!exclude) {
      return false;
    }

    // If exclude is a string, do a simple comparison
    if (typeof exclude === 'string') {
      return name === exclude;
    }

    // If exclude is an array, check if the name is somewhere within
    if (Array.isArray(exclude)) {
      return exclude.indexOf(name) > -1;
    }

    return false;
  },

  // Check if the passed object is in the array.
  isAlreadyInArray(obj, key = null, array) {
    // If key is null, we consider the obj to be just a value, and the array to be an array of values -- instead of entire Objects
    return array.filter(elem => (key ? elem[key] === obj[key] : elem === obj)).length > 0;
  },

  // Get an array without any duplicated elements in it
  removeArrayDuplicates(array, key) {
    try {
      // Iterate through the array, filtering out...
      return array.filter(
        (elem, index, self) => index === self.findIndex(innerElem => innerElem[key] === elem[key])
      );
    }
    catch (err) {
      throw err;
    }
  },

  // Combine two arrays without any duplicated keys
  // Prime Array is the one that will be added first. In case there are additional flags or details in the object (e.g. "selected" flag), they will remain
  // passing the checkForIndividualDupes will help in case either primeArray or secondArray has dupes to begin with.
  combineArraysWithoutDuplicates(primeArray, secondArray, key, checkForIndividualDupes = false) {
    try {
      // If one of the two arrays has no elements, then we can take a shortcut and just directly return the array that does have elements.
      if (!primeArray.length || !secondArray.length) {
        const newArr = primeArray.length ? primeArray : secondArray;
        return checkForIndividualDupes ? this.removeArrayDuplicates(newArr, key) : newArr;
      }
      // Otherwise, we have to put in the work and combine the arrays.

      // Take in the prime array, whose data is slightly more important
      const newArr = checkForIndividualDupes
        ? this.removeArrayDuplicates(primeArray, key)
        : primeArray;

      // Iterate through the secondary array
      secondArray.forEach((secElem) => {
        // Search for the the current element's key in the New Array.
        // Note that we do a .map to get a temporary array with JUST the key values, and do an indexOf on that temp array.
        const index = newArr.map(newElem => newElem[key]).indexOf(secElem[key]);

        // If it was not found, then add the element.
        if (index === -1) {
          newArr.push(secElem);
        }
      });

      return newArr;
    }
    catch (err) {
      throw err;
    }
  },

  // Within a given array, get rid of duplicate values, as well as undefined and null values.
  // To be used with an `array.filter` run
  filterSelfDuplicatesAndInvalid(elem, index, arr) {
    return arr.indexOf(elem) === index && elem !== undefined && elem != null;
  },

  // Filter out elements that are present in another array
  filterMergedDupes(elem) {
    return this.indexOf(elem) === -1;
  },

  // Turn the given element into an array
  getArrayFromPassedElem(elem) {
    // If it's already an array, simply return it.
    if (Array.isArray(elem)) {
      return elem;
    }

    // If it is an individual (and valid) value, return that as an array
    if (elem != null && elem !== undefined) {
      return [elem];
    }

    // Else, return an empty array
    return [];
  },

  // Given two arrays, return them as a single combined array.
  // Allows sorting and filtering duplicates.
  mergeArraysOfValues(prime, second, sortResults = false, filterDuplicates = true) {
    // Depending on whether duplicates should get filtered, decide the filter function to use.
    const selfFilter = filterDuplicates ? this.filterSelfDuplicatesAndInvalid : () => true;

    // No matter what is passed in, we turn it into a usable array, and filter out duplicates if necessary.
    const left = this.getArrayFromPassedElem(prime).filter(selfFilter);
    const right = this.getArrayFromPassedElem(second).filter(selfFilter);

    // Combine the two arrays, removing duplicates between them if necessary.
    const res = left.concat(filterDuplicates ? right.filter(this.filterMergedDupes, left) : right);

    // Return the resultant array, sorting if necessary.
    return sortResults ? res.sort() : res;
  }
};
