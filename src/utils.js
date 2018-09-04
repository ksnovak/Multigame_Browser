import chalk from 'chalk';

module.exports = {
  devLog(message) {
    if (process.env.NODE_ENV === 'dev') {
      console.log(message);
    }
  },

  devChalk(color, message) {
    if (message === undefined)
      return chalk.keyword(color)
    else
      return chalk.keyword(color)(message);
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
  }
};
