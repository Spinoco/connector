# Spinoco Data Connector 

This project contains the source of the Spinoco data connector. 

Spinoco data connector is a tool that can be used to retrieve datasets from the Spinoco Platform in near real-time . 

The tool is designed to run as a service, ideally packaged in a provided docker image.

## Configuration

The tool is configured using environment variables.

### Common configuration parameters 

| Variable                       | Example value              | Description                                                                                                                                                             |
|--------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SP_API_TOKEN                   | None                       | API token obtained from Spinoco Account. Please see instructions on how to obtain one [here](https://help.spinoco.com/administrators/generate-an-api-token-for-a-user). |
| SP_TASK_SYNC_TAG               | my_sync_tag                | Tag that is used to keep the synchronization state on the Spinoco Platform. Must be unique for a given user, and must be maximum 64 characters (UTF8).                  |
| SP_TASK_SYNC_FILE_NAME_TEMPLATE | see below  | Contains template for the file that is generated from the metadata of the task.                                                                           |
| SP_TASK_SYNC_GET_DATA          | recordings, transcriptions |Which data to get (Recordings or Transcriptions supported now, comma separated list)          |
| SP_TASK_SYNC_DELETE_DATA       | recordings                 |  Which data to remove from the Spinoco Platform after successful synchronization (Recordings)|
| SP_TASK_SYNC_SAVE_TO           | /data                      | Root of the synchronization |

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
{{due_date|yyyy}}/{{due_date|MM}}/{{due_date|dd}}/{{due_date|yyyymmddhhmmss}}-{{task_id}}
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
 


