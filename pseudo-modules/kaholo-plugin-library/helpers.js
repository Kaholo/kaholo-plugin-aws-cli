const _ = require("lodash");
const parsers = require("./parsers");

function loadConfiguration() {
  try {
    // eslint-disable-next-line global-require
    return require("../../config.json");
  } catch (exception) {
    console.error(exception);
    throw new Error("Could not retrieve the plugin configuration");
  }
}

function loadMethodFromConfiguration(methodName) {
  const config = loadConfiguration();
  return config.methods.find((m) => m.name === methodName);
}

function removeUndefinedAndEmpty(object) {
  if (!_.isPlainObject(object)) { return object; }
  return _.omitBy(object, (value) => value === "" || _.isNil(value) || (_.isObjectLike(value) && _.isEmpty(value)));
}

function readActionArguments(action, settings) {
  const method = loadMethodFromConfiguration(action.method.name);
  const paramValues = removeUndefinedAndEmpty(action.params);
  const settingsValues = removeUndefinedAndEmpty(settings);

  if (_.isNil(method)) {
    throw new Error(`Could not find a method "${action.method.name}" in config.json`);
  }

  method.params.forEach((paramDefinition) => {
    paramValues[paramDefinition.name] = parseMethodParameter(
      paramDefinition,
      paramValues[paramDefinition.name],
      settingsValues[paramDefinition.name],
    );
  });

  return removeUndefinedAndEmpty(paramValues);
}

function parseMethodParameter(paramDefinition, paramValue, settingsValue) {
  const valueToParse = paramValue || settingsValue || paramDefinition.default;
  if (_.isNil(valueToParse)) {
    if (paramDefinition.required) {
      throw Error(`Missing required "${paramDefinition.name}" value`);
    }
    return valueToParse;
  }

  const parserToUse = paramDefinition.parserType || paramDefinition.type;
  return parsers.resolveParser(parserToUse)(valueToParse);
}

module.exports = {
  readActionArguments,
};