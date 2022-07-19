const { access } = require("fs/promises");
const { extname: getFileExtension } = require("path");

function readCredentials(parameters) {
  if (!parameters.awsAccessKeyId || !parameters.awsSecretAccesssKey || !parameters.awsRegion) {
    throw new Error("Access Key ID, Secret Access Key and Region are required parameters. Please specify them in the action's parameters or plugin's settings.");
  }

  return {
    AWS_ACCESS_KEY_ID: parameters.awsAccessKeyId,
    AWS_SECRET_ACCESS_KEY: parameters.awsSecretAccessKey,
    AWS_DEFAULT_REGION: parameters.awsRegion,
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
  // Example matches: file:///path/to/file, "file://file.json", 'fileb:///path/to/binary-file'
  const filepathRegex = /(?:fileb?:\/\/[^\s'"]+|"fileb?:\/\/.*?[^\\]"|'fileb?:\/\/.*?[^\\]')+/g;
  return [...command.matchAll(filepathRegex)].map(([fileArgument]) => ({
    path: extractPathFromFileArgument(fileArgument),
    replaceBy: fileArgument,
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

async function validatePaths(paths) {
  const validationResults = await Promise.all(
    paths.map(async (path) => [path, await pathExists(path)]),
  );

  const nonexistentPaths = validationResults.filter(([, exists]) => !exists);
  if (nonexistentPaths.length === 1) {
    throw new Error(`Path ${nonexistentPaths[0][0]} does not exist!`);
  } else if (nonexistentPaths.length > 1) {
    const pathsString = nonexistentPaths.map(([path]) => path).join(", ");
    throw new Error(`Paths ${pathsString} do not exist!`);
  }
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  readCredentials,
  extractFileArgumentsFromCommand,
  generateRandomTemporaryPath,
  generateRandomString,
  createVolumeEntriesFromFiles,
  mapEnvironmentVariablesFromVolumes,
  replaceFileArguments,
  validatePaths,
};
