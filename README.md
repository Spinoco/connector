# Spinoco Data Connector 

This project contains the source of the Spinoco data connector. 

Spinoco data connector is a tool that can be used to retrieve datasets from the Spinoco Platform in near real-time . 

The tool is designed to run as a service, ideally packaged in a provided docker image.

## Configuration

The tool is configured using environment variables.

### Common configuration parameters 

| Variable                       | Example value              | Description                                                                                                                                                                                                                                                                                |
|--------------------------------|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SP_API_TOKEN                   |                            | API token obtained from Spinoco Account. Please see instructions on how to obtain one [here](https://help.spinoco.com/administrators/generate-an-api-token-for-a-user).                                                                                                                    |
| SP_TASK_SYNC_TAG               | my_sync_tag                | Tag that is used to keep the synchronization state on the Spinoco Platform. Must be unique for a given user, and must be maximum 64 characters (UTF8).                                                                                                                                     |
| SP_TASK_SYNC_FILE_NAME_TEMPLATE | see below                  | Contains template for the file that is generated from the metadata of the task.                                                                                                                                                                                                            |
| SP_TASK_SYNC_GET_DATA          | recordings, transcriptions | Which data to get. See below for supported options.                                                                                                                                                                                                                                        |
| SP_TASK_SYNC_DELETE_DATA       | recordings                 | Which data to remove from the Spinoco Platform after successful synchronization (Recordings only supported now)                                                                                                                                                                            |
| SP_TASK_SYNC_SAVE_TO           | /data                      | Root of the synchronization                                                                                                                                                                                                                                                                |
| SP_TASK_START_FROM | 2024-09-09T15:45:47.277Z   | Date from which the synchronization should start. This is useful when you want to synchronize only the data that was created after a certain date. Note that this is only applied on the initial synchornization start. If the synchrionization has been started already, this is ignored. |
| SP_TASK_SYNC_STORAGE_PROVIDER   | local                      | Storage provider to use. Currently supported are: local, s3, gcs, azure.                                                                                                                                                                                                                   |
| SP_LOG_LEVEL | info                       | Log level of the tool. Possible values are: error, warn, info, debug, trace.                                                                                                                                                                                                               |


### File Storage Configuration

Tool supports multiple storage providers. Currently following storage providers are supported:

- Local File System
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

See below for configuring the storage providers.

#### Local File System

This is default storage provider. Value of SP_TASK_SYNC_STORAGE_PROVIDER must be set to `local` or leaved as empty for this storage provider to work.
There is no additional parameters / configuration options required to be specified.

Files will be stored under directory specified in SP_TASK_SYNC_SAVE_TO environment variable.

#### AWS S3

This is storage provider that allows to store files in AWS S3 Bucket. To use this provider value of SP_TASK_SYNC_STORAGE_PROVIDER must be set to `s3`.

Following additional parameters must be set (all required):

| Variable                         | Example value | Description                                                                                                                 |
|----------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------|
| SP_TASK_SYNC_S3_BUCKET           | my_bucket   | Name of the S3 bucket where the files will be stored.                                                    |
| SP_TASK_SYNC_S3_REGION           | eu-central-1 | Region of the S3 bucket.                                                                                                    |

Following methods can be used to provide credentials:
- Environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Shared credentials file at `~/.aws/credentials`
- Credentials provided by ECS orchestrator
- Credentials loaded from AWS IAM using the credentials provider of the Amazon EC2 instance (if configured in the instance metadata)

For more information see [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html)

#### Google Cloud Storage

This is storage provider that allows to store files in Google Cloud Storage. To use this provider value of SP_TASK_SYNC_STORAGE_PROVIDER must be set to `gcs`.

Following additional parameters must be set (all are required):

| Variable                 | Example value | Description                                                              |
|--------------------------|-------------|--------------------------------------------------------------------------|
| SP_TASK_SYNC_GCS_BUCKET  | my_bucket   | Name of the GCS bucket where the files will be stored.  |
| SP_TASK_SYNC_GCS_PROJECT | my_project  | User project identification where the bucket is created.                 |

Following methods can be used to provide credentials:
- Environment variable `GOOGLE_APPLICATION_CREDENTIALS` that stores path to the JSON file with the credentials of service account
- Google's default application credentials
- Credentials provided by GCP orchestrator.

For more information see [Google Cloud Storage](https://cloud.google.com/docs/authentication/getting-started)

#### Azure Blob Storage

This is storage provider that allows to store files in Azure Blob Storage. To use this provider value of SP_TASK_SYNC_STORAGE_PROVIDER must be set to `azure`.

Following additional parameters must be set (all are required):

| Variable                       | Example value | Description                                                                 |
|--------------------------------|---------------|-----------------------------------------------------------------------------|
| SP_TASK_SYNC_AZURE_DSN         | my_bucket     | Azure DSN Connection string, containing the credentials to the BLOB storage |
| SP_TASK_SYNC_AZURE_CLIENT_NAME | my_client     | Name of teh Azure Blob Storage client                                       |

### Supported data types

Tool allows to configure which data to support while synchronizing. Following data types are supported:

- CallMetadata - Metadata of the calls. Data are downloaded as file with `meta.json` suffix. 
- Recordings - Call recordings. There may be 0 or more recordings per task. Data are downloaded as file with `.ogg` suffix.
- Transcriptions - Transcriptions of the calls. Each recording may or may not have a transcription. Data are downloaded as file with `trans.json` suffix.
- ChatMetadata - Metadata of the chat messages. Data are downloaded as file with `meta.json` suffix.
- ChatHistory - Chat history. Individual chat messages received or sent in each chat conversation.  Data are downloaded as file with `history.json` suffix.
- SMSMetadata - Metadata of the SMS messages. Data are downloaded as file with `meta.json` suffix.
- EmailMetadata - Metadata of the emails. Data are downloaded as file with `meta.json` suffix.
- CommonMetadata - Metadata of the tasks. Data are downloaded as file with `meta.json` suffix.
- WorkflowMetadata - Metadata of the workflows. Data are downloaded as file with `meta.json` suffix.


### File Name Template 

To facilitate different needs to organize and structure data at the storage provider side, there is a template that allows to provide a custom format of the directories and filenames where the data will be stored. 

The template is using the following placeholders:

| Placeholder | Example | Description |
|-------------|---|---|
| due_date    | 2021-01-01 | Due date of the task. This is the date at which the task was scheduled to be completed. Additionally, formating options can be passed after due_date to extract the date or just a part of the date. |
| task_id     | b808d74e-84b2-11ef-b864-0242ac120002 | ID of the task |
| call_from   | 420123456789 | Caller number in the E164 international format |
| call_to     | 420987654321 | Called number in the E164 international format|

To format the date (due_date), you can use date formatting options from the Java Date Format described here : [Java Date Format](https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html). 

### Example template 

```
{{due_date|yyyy}}/{{due_date|MM}}/{{due_date|dd}}/{{due_date|yyyyMMddHHmmss}}-{{task_id}}
```

This will result in the following file name 

`2004/12/01/20041201120000-b808d74e-84b2-11ef-b864-0242ac120002`

Note that based on the type of the file, the following suffixes are added : 

| suffix       | Description|
|--------------|---|
| .ogg         | Call recording in ogg format. |
|  .trans.json | Transcription of the call in JSON format.|

If, for example, the template results in the file name above and both the recording and the transcription are downloaded, the following files will be created: 

`2004/12/01/20041201120000-b808d74e-84b2-11ef-b864-0242ac120002.ogg`
`2004/12/01/20041201120000-b808d74e-84b2-11ef-b864-0242ac120002.trans.json`


## Usage

As the tool is provided as a docker image, it can be easily used by any orchestrator, which supports docker images, such as Docker Compose or Kubernetes. 

Docker image is available from the public docker hub repository - `spinoco/connector:latest`.
 

### Docker Compose 

Docker Compose is natively supported and there is even a sample `docker-compose-example.yml` file provided in the repository. 


```shell
docker-compose up -d docker-compose-example.yml
```

### Running it from the command line 

Before you can run the tool, you need to build it.

```shell
# this installs all the needed npm packages 
npm install

# this creates the distribution package in the dist directory 
npm run dist
```

To run the tool from the command line, you can use the following command

```shell
node dist/bundle.js
```
 


