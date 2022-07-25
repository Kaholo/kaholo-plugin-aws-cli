const awsPluginLibrary = require("@kaholo/aws-plugin-library");
const kaholo = require("@kaholo/plugin-library");
const helpers = require("./helpers");
const awsCli = require("./awscli");

async function runCommand(parameters) {
  const credentials = helpers.readCredentials(parameters);
  try {
    const result = await awsCli.execute(credentials, parameters.command);
    return result.stdout;
  } catch (error) {
    throw new Error(error.stderr ?? error);
  }
}

module.exports = kaholo.bootstrap({
  runCommand,
}, {
  listRegions: awsPluginLibrary.autocomplete.listRegions,
});
