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

Next, because the CLI is running inside a docker container, it will not have access to the filesystem on the agent. If for example you have used the Git plugin to clone a repository of AWS CLI JSON configuration files to the agent, and attempt to then use them in an AWS CLI command, you will get an error stating `No such file or directory`. Future development will address this.

Lastly, the docker container is destroyed once the command has successfully run, so any output files will also be destroyed. Future development may address this as well, but for the time being, AWS CLI commands that use files for input or output are not supported. The only outputs are found in Final Results on the Execution Results page.

As a work-around, should these limitations have severe impact on your use case, the AWS CLI can be installed on the agent and run via the Command Line plugin instead. A main purpose for this plugin is to help you avoid that inconvenience.

## Access and Authentication
AWS uses three parameters for access and authentication:
* Access Key ID, e.g. `AKIA3LQJ67DU53G3DNEW`
* Secret Access Key, e.g. `Hw8Il3qOGpOflIbCaMb0SxLAB2zk4naTBKiybsNx`
* Region, e.g. `ap-southeast-1`

Only the Secret Access Key is a genuine secret that should be guarded carefully to avoid abuse of your account. For security purposes the Kaholo plugin stores both the Access Key ID and the Secret Access Key in the Kaholo vault. This allows them to be used widely without ever appearing in configuration, logs, or output.

The Access Key ID and Secret Access Key are a matched set of credentials that will work in any Region, subject to the security configuration of the user account to which these keys belong.

Region simply determines the geographical location of the AWS data center where the underlying hardware actually runs, and to a degree which features are available and the price of the services. For example `ap-southeast-1` is AWS's data center in Singapore.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Plugin Settings
Plugin settings act as default parameter values. If configured in plugin settings, the action parameters may be left unconfigured. Action parameters configured anyway over-ride the plugin-level settings for that Action.

The settings for AWS CLI Plugin include the three discussed above in the [Access and Authentication](#Access-and-Authentication) section.

* Default Access Key ID
* Default Secret Access Key
* Default Region

These are also required parameters for all methods of this plugin.

## Method: Test CLI
This method does a trivial test to see if the plugin is working properly and the provided credentials valid. It is the equivalent of running the command:

`aws sts get-caller-identity`

### Parameters
There are no parameters required for this method beyond the three discussed above in the [Access and Authentication](#Access-and-Authentication) section.

## Method: Run Command
This method runs any AWS CLI command. While these commands all being with `aws`, in this plugin you may omit that first word if you wish. For example the command `ec2 describe-instances` will be interpreted the same as `aws ec2 describe-instances`.

### Parameters
Beyond the three discussed above in the [Access and Authentication](#Access-and-Authentication) section, only the command itself is required.

* Command - the command to run, e.g. `aws ec2 describe-instances`
