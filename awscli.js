const _ = require("lodash");
const util = require("util");
const childProcess = require("child_process");

const exec = util.promisify(childProcess.exec);

// eslint-disable-next-line no-multi-str
const DOCKER_AWS_CLI_COMMAND = "\
docker run \
-e AWS_ACCESS_KEY_ID \
-e AWS_SECRET_ACCESS_KEY \
-e AWS_DEFAULT_REGION \
--rm amazon/aws-cli";

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

function execute(credentials, command) {
  const cmdToExecute = `${DOCKER_AWS_CLI_COMMAND} ${sanitizeCommand(command)}`;
  return exec(cmdToExecute, { env: credentials });
}

module.exports = {
  execute,
};
