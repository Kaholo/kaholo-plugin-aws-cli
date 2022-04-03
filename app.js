const kaholo = require("kaholo-plugin-library");
const helpers = require("./helpers");
const awsCli = require("./awscli");

const TEST_COMMAND = "sts get-caller-identity";

async function testCli(parameters) {
  return runCommand({
    ...parameters,
    command: TEST_COMMAND,
  });
}

async function runCommand(parameters) {
  const credentials = helpers.readCredentials(parameters);
  const result = await awsCli.execute(credentials, parameters.command);
  return result.stdout;
}

module.exports = kaholo.bootstrap({
  testCli,
  runCommand,
}, {});
