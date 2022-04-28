function readCredentials(parameters) {
  if (!parameters.AWS_ACCESS_KEY_ID || !parameters.AWS_SECRET_ACCESS_KEY || !parameters.REGION) {
    throw new Error("Access Key ID, Secret Access Key and Region are required parameters. Please specify them in the action's parameters or plugin's settings.");
  }
  return {
    AWS_ACCESS_KEY_ID: parameters.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: parameters.AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION: parameters.REGION,
  };
}

module.exports = {
  readCredentials,
};
