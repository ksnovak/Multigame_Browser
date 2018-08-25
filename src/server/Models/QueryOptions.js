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
  '/games/specific': {
    id: { type: 'number', duplicate: true },
    name: { duplicate: true }
  },
  '/games/combo': {
    includetop: { type: 'boolean', default: false },
    first: { type: 'number' },
    id: { type: 'number', duplicate: true },
    name: { duplicate: true }
  },
  '/streams/details': {
    id: { type: 'number', duplicate: true },
    login: { duplicate: true }
  },
  '/streams/games': {
    first: { type: 'number' },
    before: { type: 'number' },
    after: { type: 'number' },
    game_id: { type: 'number', duplicate: true },
    language: { duplicate: true },
    user_id: { type: 'number', duplicate: true },
    user_login: { duplicate: true }
  },
  '/streams/top': {
    first: { type: 'number' },
    language: { duplicate: true }
  }
};

module.exports = {
  // Return all valid and relevant querystring parameters, given the specified endpoint, and the starting querystring object.
  getValidQueryOptions(endpoint, params) {
    const allowedParams = queryOptions[endpoint]; // Based on the endpoint, get the list of allowed parameters
    const cleanedParams = {};


    // console.log('Starting params:')
    // console.log(params);

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
          if (paramRequirements.type) {
            if (paramRequirements.type === 'number') {
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
            else if (paramRequirements.type === 'boolean') {
              let toLower = params[paramName].toLowerCase();
              if (toLower === 'true' || toLower === 't')
                cleanedVal = true;
              else if (toLower === 'false' || toLower === 'f')
                cleanedVal = false;
            }
          }

          // See if we're allowing multiple values for a specific key. If not, just grab the first value
          if (!paramRequirements.duplicate) {
            const tempVal = cleanedVal || paramVal;
            if (Array.isArray(tempVal)) {
              [cleanedVal] = tempVal;
            }
          } else {
            cleanedVal = cleanedVal || paramVal;
          }


          //TODO: This is NOT the right way. This just handles if the value is invalid; doesn't care if the key is non-existant
          if (cleanedVal == undefined && paramRequirements.default != undefined) {
            cleanedVal = paramRequirements.default;
          }

          // Finishing; if there is a valid value at the end of everything, add it to the cleanedParams object
          if (cleanedVal != undefined) {
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
    // console.log('Ending params: ')
    // console.log(cleanedParams)
    return cleanedParams;
  }
};
