function readCredentials(parameters) {
  return {
    AWS_ACCESS_KEY_ID: parameters.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: parameters.AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION: parameters.REGION,
  };
}

module.exports = {
  readCredentials,
};
