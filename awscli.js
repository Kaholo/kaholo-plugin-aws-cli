const util = require("util");
const childProcess = require("child_process");
const { sanitizeCommand } = require("./helpers");
const { helpers } = require("@kaholo/plugin-library");

const exec = util.promisify(childProcess.exec);

function createDockerCommand(params) {
  const {
    workingDirInfo,
    environmentVariables = [],
  } = params;

  if (workingDirInfo.type !== "directory") {
    throw new Error(`Specified working directory path is not a directory: ${workingDirInfo.absolutePath}`);
  }

  const environmentVariablesString = environmentVariables
    .map((environmentVariable) => `-e ${environmentVariable}`)
    .join(" ");

  return `docker run \
    -e AWS_ACCESS_KEY_ID \
    -e AWS_SECRET_ACCESS_KEY \
    -e AWS_DEFAULT_REGION \
    ${environmentVariablesString} \
    -v ${workingDirInfo.absolutePath}:/aws \
    --rm amazon/aws-cli`;
}

async function execute(credentials, parameters) {
  const {
    command,
    workingDir: workingDirInfo = await helpers.analyzePath("./"), // allow undefined param
  } = parameters;

  const dockerCommand = createDockerCommand({ workingDirInfo });
  const awsCommand = sanitizeCommand(command);
  const cmdToExecute = `${dockerCommand} ${awsCommand}`;

  return exec(cmdToExecute, {
    env: {
      ...credentials,
    },
  });
}

module.exports = {
  execute,
};
