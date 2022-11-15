const _ = require("lodash");

function readCredentials(parameters) {
  if (!parameters.accessKeyId || !parameters.secretAccessKey || !parameters.region) {
    throw new Error("Access Key ID, Secret Access Key and Region are required parameters. Please specify them in the action's parameters or plugin's settings.");
  }

  return {
    AWS_ACCESS_KEY_ID: parameters.accessKeyId,
    AWS_SECRET_ACCESS_KEY: parameters.secretAccessKey,
    AWS_DEFAULT_REGION: parameters.region,
  };
}

function sanitizeCommand(command) {
  let sanitized = command;
  if (_.startsWith(command.toLowerCase(), "aws ")) {
    sanitized = command.slice(4);
  }

  // This is the safest way to escape the user provided command.
  // By putting the command in double quotes, we can be sure that
  // every character within the command is escaped, including the
  // ones that could be used for shell injection (e.g. ';', '|', etc.).
  // The escaped string needs then to be echoed back to the docker command
  // in order to be properly executed - simply passing the command in double quotes
  // would result in docker confusing the quotes as a part of the command.
  return `$(echo "${sanitized}")`;
}

module.exports = {
  readCredentials,
  sanitizeCommand,
};
