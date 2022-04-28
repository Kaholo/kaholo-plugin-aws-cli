const awsPluginLibrary = require("kaholo-aws-plugin-library");
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
  try {
    const result = await awsCli.execute(credentials, parameters.command);
    return result.stdout;
  } catch (error) {
    throw new Error(error.stderr ?? error);
  }
}

module.exports = {
  ...kaholo.bootstrap({
    testCli,
    runCommand,
  }),
  listRegions: awsPluginLibrary.autocomplete.listRegions,
};
