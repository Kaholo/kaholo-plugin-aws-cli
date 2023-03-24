# Kaholo AWS CLI Plugin
This plugin runs commands using the [AWS Command-Line Interface(CLI)](https://aws.amazon.com/cli/). The AWS CLI is capable of a very broad range of operations on Amazon's Web Services platform (AWS).

Kaholo provides specific plugins to work with AWS is a more user-friendly way, for example EC2, S3, and EKS. It is recommended to use the specific plugin if one is available, and resort to the AWS CLI plugin only if you are familiar and comfortable using the AWS CLI, migrating automation that is already written in AWS CLI, or if the specific plugins are lacking features to meet your needs.

AWS CLI commands are easily recognizable because they all begin with `aws`. Some examples include:

`aws ec2 describe-instances`

`aws sns publish --topic-arn arn:aws:sns:us-east-1:546419318123:OperationsError --message "Script Failure"`

`aws route53 create-traffic-policy --name mypolicy --document file://mypolicy.json`

The output of the command, which would normally appear in the command window, is made available in Final Result section of the Execution Results page in Kaholo. This is also downloadable and accessible in code as a JSON document.

## Use of Docker
This plugin relies on the [Amazon-provided docker container](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-docker.html) to run the AWS CLI. This has many upsides but a few downsides as well of which the user should be aware.

If running your own Kaholo agents in a custom environment, you will have to ensure docker is installed and running on the agent and has sufficient privilege to retrieve the image and start a container. If the agent is already running in a container (kubernetes or docker) then this means a docker container running within another container.

The first time the plugin is used on each agent, docker may spend a minute or two downloading the image. After that the delay of starting up another docker image each time is quite small, a second or two.

Next, because the CLI is running inside a docker container, it will not have access to the filesystem on the agent. If for example you have used the Git plugin to clone a repository of AWS CLI JSON configuration files to the agent, using them in a command will require that directory being mounted as a docker volume within the container. To accomodate this there is a `Working Directory` parameter. The working directory is accessible within the docker container and will remain after the AWS CLI command completes and the continaer is deleted. Be sure any files to be read or written by your AWS CLI commands are inside the specified `Working Directory`.

## Access and Authentication
AWS uses two parameters for access and authentication, these are stored in the Kaholo Vault and configured via a Kaholo Account.
* Access Key ID, e.g. `AKIA3LQJ67DU53G3DNEW`
* Access Key Secret, e.g. `Hw8Il3qOGpOflIbCaMb0SxLAB2zk4naTBKiybsNx`

Only the Access Key Secret is a genuine secret that should be guarded carefully to avoid abuse of your account. For security purposes the Kaholo plugin stores both the Access Key ID and the Secret Access Key in the Kaholo vault. This allows them to be used widely without ever appearing in configuration, logs, or output.

The Access Key ID and Secret Access Key are a matched set of credentials that will work in any Region, subject to the security configuration of the user account to which these keys belong.

## Plugin Settings
There is one Plugin setting, Default AWS Region. Region simply determines the geographical location of the AWS data center where the underlying hardware actually runs, and to a degree which features are available and the price of the services. For example `ap-southeast-1` is AWS's data center in Singapore.

Any new AWS CLI plugin action created will by default have (if configured) this Default AWS Region. If the action requires another region or no region it can be simply edited. If the CLI command include a `--region` argument that overrides what is configured in the parameter.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Method: Run Command
This method runs any AWS CLI command.

### Parameter: Working Directory
Working Directory may be left empty or defined as a relative or absolute path to a directory on the Kaholo Agent. This is necessary only if files are read or written by the AWS CLI command. The Working Directory is mounted as a docker volume by the container running the AWS CLI command so that files will be accessible by the CLI and also remain after the command completes and the docker container is destroyed.

### Parameter: AWS CLI Command
The command to run, e.g. `aws ec2 describe-instances`

### Parameter: AWS Region
Many AWS CLI commands require a `--region` argument, specifying which geographical AWS Region to target. Often the same region is used again and again and including this argument in the commands is tedius. For this reason AWS Region is provided as a Kaholo parameter and also as a plugin setting, so that it may default appropriately and/or be tied into configuration or code rather than included directly in commands. If the Kaholo parameter is defined and the `--region` argument also appears in the AWS CLI Command, the one specified in the command takes precedence.

