/*
This is gigantic and disgusting, I'm sorry world.


*/

// All options from the user that we accept
const incomingOptions = {
  '/games/top': {
    games_count: { type: 'number', outgoing: 'first' },
    games_before: { type: 'number', outgoing: 'before' },
    games_after: { type: 'number', outgoing: 'after' },
    include_top: { type: 'boolean' }
  },
  '/games/specific': {
    game_id: { type: 'number', duplicate: true, outgoing: 'id' },
    game_name: { duplicate: true, outgoing: 'name' }
  },
  '/games/combo': {
    include_top_games: { type: 'boolean', default: false },
    games_count: { type: 'number' },
    game_id: { type: 'number', duplicate: true },
    game_name: { duplicate: true }
  },
  '/streams/list': {
    streams_count: { type: 'number', outgoing: 'first' },
    streams_before: { type: 'number', outgoing: 'before' },
    streams_after: { type: 'number', outgoing: 'after' },
    game_id: { type: 'number', duplicate: true, outgoing: 'game_id' },
    stream_id: { type: 'number', duplicate: true, outgoing: 'user_id' },
    stream_name: { duplicate: true, outgoing: 'user_login' },
    language: { duplicate: true, outgoing: 'language' }
  },
  '/streams/top': {
    streams_count: { type: 'number', outgoing: 'first' },
    streams_before: { type: 'number', outgoing: 'before' },
    streams_after: { type: 'number', outgoing: 'after' },
    language: { duplicate: true, outgoing: 'language' }
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
  getPassedVals(passedNames, params) {
    let values = [];
    if (Array.isArray(passedNames)) {
      passedNames.forEach((name) => {
        if (params && params[name] !== undefined) {
          values = values.concat(params[name]);
        }
      });
    }
    else if (params && (params[passedNames] !== undefined || params[passedNames !== null])) {
      values.push(params[passedNames]);
    }
    return values.length ? values : null;
  },

  // In case the params have to be numbers, retrieve an array of only valid numbers from the given values
  getCleanedNumbers(values) {
    const cleanedNumbers = [];
    values.forEach((val) => {
      if (!isNaN(val) && val !== null && (typeof val === 'string' || typeof val === 'number')) {
        cleanedNumbers.push(Number(val));
      }
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

  getTypedValues(type, values) {
    if (type === 'number') {
      return this.getCleanedNumbers(values);
    }

    if (type === 'boolean') {
      return this.getCleanedBools(values);
    }

    return values;
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
  cleanIncomingQueryOptions(endpoint, params) {
    const optionSet = this.getOptionSet(endpoint);
    const cleanedParams = {};

    // Iterate through all of the acceptable parameters
    Object.keys(optionSet).forEach((optionName) => {
      // See if the user passed anything that matches the current acceptable param
      const passedNames = this.getMatchingNames(params, optionName);
      const allowedProperties = optionSet[optionName];
      let cleanedVal;

      if (passedNames) {
        const passedVal = this.getPassedVals(passedNames, params);

        if (passedVal != null) {
          cleanedVal = this.getTypedValues(allowedProperties.type, passedVal);
        }
      }

      cleanedVal = this.getSimplifiedArray(allowedProperties.duplicate, cleanedVal);

      cleanedVal = this.getDefaultValue(allowedProperties.default, cleanedVal);

      if (cleanedVal !== undefined && cleanedVal !== null) {
        cleanedParams[optionName] = cleanedVal;
      }
    });

    return cleanedParams;
  },

  // Convert the internal parameters to the Twitch-appropriate param name
  getOutgoingOptions(endpoint, params) {
    const optionSet = this.getOptionSet(endpoint);
    const outgoing = {};

    if (!optionSet)
      return null;

    Object.keys(params).forEach((paramName) => {
      const option = optionSet[paramName];
      if (option.outgoing !== undefined) {
        outgoing[option.outgoing] = params[paramName];
      }
    });

    return outgoing;
  }
};
