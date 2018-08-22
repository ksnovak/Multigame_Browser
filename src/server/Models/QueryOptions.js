/*
This is gigantic and disgusting, I'm sorry world.


*/

// Relevant parameters for each specified endpoint
const queryOptions = {
  '/games/top': {
    first: { type: 'number' },
    before: { type: 'number' },
    after: { type: 'number' }
  },
  '/games/specific': {}
};

module.exports = {
  // Return all valid and relevant querystring parameters, given the specified endpoint, and the starting querystring object.
  getValidQueryOptions(endpoint, params) {
    const allowedParams = queryOptions[endpoint]; // Based on the endpoint, get the list of allowed parameters
    const cleanedParams = {};

    // Go through each of the given parameters, weeding out the irrelevant and invalid ones, and consolidating them (in case of differing capitalization)
    Object.keys(params).forEach((paramName) => {
      const cleanedName = paramName.toLowerCase();

      // Check if this parameter is allowed to be used
      if (allowedParams[cleanedName]) {
        const paramRequirements = allowedParams[cleanedName];

        // If the value for this name is already set once (and we don't want duplicates), we can skip this entire iteration
        if (!cleanedParams[cleanedName] || paramRequirements.duplicate) {
          const paramVal = params[paramName];
          let cleanedVal;

          // Check if a specific type is required
          if (paramRequirements.type && paramRequirements.type === 'number') {
            // If number is required, make sure this value is able to become a number
            if (!isNaN(params[paramName])) {
              cleanedVal = Number(paramVal);
            } else if (Array.isArray(paramVal)) {
              // Note that if the value is an array, we have to validate each member of it.
              cleanedVal = paramVal
                .filter(elem => !isNaN(elem))
                .map(elem => Number(elem));
            }
          }

          // See if we're allowing multiple values for a specific key. If not, just grab the first value
          if (!paramRequirements.duplicate) {
            const tempVal = cleanedVal || paramVal;
            if (Array.isArray(tempVal)) {
              [cleanedVal] = tempVal;
            }
          }

          // Finishing; if there is a valid value at the end of everything, add it to the cleanedParams object
          if (cleanedVal) {
            // If the param doesn't exist yet, simply set it.
            if (!cleanedParams[cleanedName]) {
              cleanedParams[cleanedName] = cleanedVal;
            } else if (paramRequirements.duplicate) {
              // If it does exist, then make sure duplicate values are allowed -- and if they are, concatenate as an array

              cleanedParams[cleanedName] = [].concat(
                cleanedParams[cleanedName],
                cleanedVal
              );
            }
          }
        }
      }
    });

    return cleanedParams;
  }
};
