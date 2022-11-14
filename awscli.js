const _ = require("lodash");
const util = require("util");
const childProcess = require("child_process");
const {
  extractFileArgumentsFromCommand,
  createVolumeEntriesFromFiles,
  mapEnvironmentVariablesFromVolumes,
  replaceFileArguments,
  validatePaths, createVolumeFromWorkingDir, createWorkingDirectoryVolume,
} = require("./helpers");

const exec = util.promisify(childProcess.exec);

function createDockerCommand({ volumes = [], environmentVariables = [] }) {
  const volumesString = volumes
    .map(({ file, mountPoint }) => (
      `-v $${file.environmentVariable}:$${mountPoint.environmentVariable}`
    ))
    .join(" ");
  const environmentVariablesString = environmentVariables
    .map((environmentVariable) => `-e ${environmentVariable}`)
    .join(" ");

  return `docker run \
    -e AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION \
    ${environmentVariablesString} \
    ${volumesString} \
    --rm amazon/aws-cli`;
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

async function execute(credentials, parameters) {
  // console.info(process.cwd());
  const { command, workingDirectory } = parameters;
  // Extract filepaths from the command string
  // const files = extractFileArgumentsFromCommand(command);

  const workingDirectoryVolume = createWorkingDirectoryVolume(workingDirectory);
  // const files = extractFiles
  // console.info("files", files);
  // Validate paths
  // await validatePaths(files.map(({ path }) => path));
  // Create Docker volume mounting points
  // const volumes = createVolumeEntriesFromFiles(files);
  // console.info("volumes", volumes);

  const volumeWorkingDir = createVolumeFromWorkingDir(workingDirectoryVolume);

  // Prepare environmental variables containing filepaths and Docker volume mounting points
  const volumesEnvironmentVariables = mapEnvironmentVariablesFromVolumes(volumeWorkingDir);
  console.info("volumesEnvironmentVariables", volumesEnvironmentVariables);
  // Replace filepaths with Docker volume mounting points
  const preparedCommand = replaceFileArguments(command, volumeWorkingDir);
  console.info("prepareCommand", preparedCommand);

  const dockerCommand = createDockerCommand({
    volumeWorkingDir,
    environmentVariables: volumeWorkingDir.environmentVariable,
  });
  console.info("dockerCommand", dockerCommand);

  const awsCommand = sanitizeCommand(preparedCommand);

  console.info("awsCommand", awsCommand);
  const cmdToExecute = `${dockerCommand} ${awsCommand}`;
  console.info("cmdToExecute", cmdToExecute);
  return exec(cmdToExecute, {
    env: {
      ...credentials,
      ...volumesEnvironmentVariables,
    },
  });
}

module.exports = {
  execute,
};

execute(
  { login: "A", password: "B" },
  { command: "aws s3 sync ./logo.png s3://my-s3-bucket/" },
).then(console.info);
