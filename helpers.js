const { extname: getFileExtension } = require("path");

const FILEPATH_REGEX = /(?:fileb?:\/\/[^\s'"]+|"fileb?:\/\/.*?[^\\]"|'fileb?:\/\/.*?[^\\]')+/g;

function readCredentials(parameters) {
  return {
    AWS_ACCESS_KEY_ID: parameters.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: parameters.AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION: parameters.REGION,
  };
}

function generateRandomTemporaryPath() {
  return `/tmp/${generateRandomString()}`;
}

function generateRandomString() {
  return Math.random().toString(36).substring(2);
}

function generateRandomEnvironmentVariableName() {
  return `KAHOLO_AWS_CLI_TMP_VAR_${generateRandomString().toUpperCase()}`;
}

function extractFileArgumentsFromCommand(command) {
  return [...command.matchAll(FILEPATH_REGEX)].map(([path]) => ({
    path: extractPathFromFileArgument(path),
    replaceBy: path,
    environmentVariable: generateRandomEnvironmentVariableName(),
  }));
}

function extractPathFromFileArgument(fileArgument) {
  return fileArgument
    .replace(/((?<!\\)["']$|^(?<!\\)["'])/g, "")
    .replace(/^(?:fileb?:\/\/)?/, "");
}

function createVolumeEntriesFromFiles(files) {
  return files.map((file) => ({
    mountPoint: {
      path: `${generateRandomTemporaryPath()}${getFileExtension(file.path)}`,
      environmentVariable: generateRandomEnvironmentVariableName(),
    },
    file,
  }));
}

function mapEnvironmentVariablesFromVolumes(volumes) {
  return volumes
    .map(({ mountPoint, file }) => ({
      [mountPoint.environmentVariable]: mountPoint.path,
      [file.environmentVariable]: file.path,
    }))
    .reduce((accumulate, current) => Object.assign(accumulate, current), {});
}

function replaceFileArguments(command, volumes = []) {
  return volumes.reduce((commandString, volume) => (
    commandString.replace(volume.file.replaceBy, `file://$${volume.mountPoint.environmentVariable}`)
  ), command);
}

module.exports = {
  readCredentials,
  extractFileArgumentsFromCommand,
  generateRandomTemporaryPath,
  generateRandomString,
  createVolumeEntriesFromFiles,
  mapEnvironmentVariablesFromVolumes,
  replaceFileArguments,
};
