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
  '/streams/list': {
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
  },
  '/combo': {
    includetop: { type: 'boolean', default: false },
    first: { type: 'number' },
    id: { type: 'number', duplicate: true }, // game ID
    name: { duplicate: true }, // game name
    game_id: { type: 'number', duplicate: true },
    language: { duplicate: true },
    user_id: { type: 'number', duplicate: true },
    user_login: { duplicate: true }
  }
};

// All options from the user that we accept
const incomingOptions = {
  '/games/top': {
    games_count: { type: 'number', default: 30, duplicate: true },
    games_before: { type: 'number' },
    games_after: { type: 'number' },
    include_top: { type: 'boolean' }
  },
  '/games/specific': {
    game_id: { type: 'number', duplicate: true },
    game_name: { duplicate: true }
  },
  '/games/combo': {
    include_top_games: { type: 'boolean', default: false },
    games_count: { type: 'number' },
    game_id: { type: 'number', duplicate: true },
    game_name: { duplicate: true }
  },
  '/streams/list': {
    streams_count: { type: 'number' },
    streams_before: { type: 'number' },
    streams_after: { type: 'number' },
    game_id: { type: 'number', duplicate: true },
    stream_id: { type: 'number', duplicate: true },
    stream_name: { duplicate: true },
    language: { duplicate: true }
  },
  '/streams/top': {
    streams_count: { type: 'number' },
    streams_before: { type: 'number' },
    streams_after: { type: 'number' },
    language: { duplicate: true }
  },
  '/combo': {
    include_top_games: { type: 'boolean', default: false },
    include_top_streams: { type: 'boolean', default: false },
    games_count: { type: 'number' },
    streams_count: { type: 'number' },
    game_id: { type: 'number', duplicate: true }, // game ID
    game_name: { duplicate: true }, // game name
    stream_id: { type: 'number', duplicate: true },
    stream_name: { duplicate: true },
    language: { duplicate: true }
  }
};

module.exports = {
  // Get all of the possible options for a given endpoint
  getOptionSet(endpoint) {
    return incomingOptions[endpoint] || null;
  },

  // Make sure the passed-in parameter is even able to be valid
  getCleanName(name) {
    if (name.length === 0 || !isNaN(name)) {
      return null;
    }
    return name.toLowerCase();
  },

  // For a given parameter, get all of the properties that it can have.
  getAllowedProperties(optionSet, cleanName) {
    return optionSet[cleanName] || null;
  },

  // With the user-sent params, get all of the parameter names that clean up to the specified one
  getMatchingNames(params, optionName) {
    const names = Object.keys(params).filter(
      paramName => optionName === this.getCleanName(paramName)
    );
    return names.length ? names : null;
  },

  // Retrieve the user-sent values that match the specified parameter
  getPassedVals(allowedProperties, passedNames, params) {
    let values = [];
    passedNames.forEach((name) => {
      values = values.concat(params[name]);
    });
    return values.length ? values : null;
  },

  // In case the params have to be numbers, retrieve an array of only valid numbers from the given values
  getCleanedNumbers(values) {
    const cleanedNumbers = [];
    values.forEach((val) => {
      if (!isNaN(val) && val !== null) cleanedNumbers.push(Number(val));
    });

    return cleanedNumbers.length ? cleanedNumbers : null;
  },

  // In case the params have to be bool, retrieve an array of only valid booleans from the given values
  getCleanedBools(values) {
    const cleanedBools = [];
    values.forEach((val) => {
      if (typeof val === 'boolean') {
        cleanedBools.push(val);
      }
      else if (typeof val === 'number' && (val === 0 || val === 1)) {
        cleanedBools.push(!!val);
      }
      else if (typeof val === 'string') {
        const lowerString = val.toLowerCase();

        if (lowerString === 't' || lowerString === 'true') cleanedBools.push(true);
        else if (lowerString === 'f' || lowerString === 'false') cleanedBools.push(false);
      }
    });

    return cleanedBools.length ? cleanedBools : null;
  },

  // Check if there is a default value for a given parameter, and fall back to it if the parameter value currently is invalid
  getDefaultValue(defaultVal, currentVal) {
    if (currentVal !== undefined && currentVal !== null) {
      return currentVal;
    }

    if (defaultVal !== undefined) {
      return defaultVal;
    }

    return currentVal;
  },

  // Simplify the array if possible - if either there's only 1 element, or multiples are disallowed, return the first element
  getSimplifiedArray(duplicatesAllowed, currentVal) {
    if (Array.isArray(currentVal)) {
      if (!duplicatesAllowed || currentVal.length === 1) {
        return currentVal[0];
      }
      if (currentVal.length > 1) {
        return currentVal;
      }
    }

    return currentVal != null ? currentVal : null;
  },

  //
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
              if (typeof params[paramName] === 'boolean') {
                cleanedVal = params[paramName]
              }
              else {

                let toLower = params[paramName].toLowerCase();
                if (toLower === 'true' || toLower === 't')
                  cleanedVal = true;
                else if (toLower === 'false' || toLower === 'f')
                  cleanedVal = false;
              }
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
