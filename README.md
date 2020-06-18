# Shapr3D Conversion Service
**Deployed application**: https://codesandbox.io/s/hungry-vaughan-49uno (Note: files wont't be downloaded in the sandbox, instead open the file link in a new tab.)

Task description: https://docs.google.com/document/d/1eA_v3622sIO4M4Hk7kUeq3nm-sn7cyXLxIpdvwr2faE

Since I have a free AWS account and already set-up EC2 and RDS instances, and my app domain [Quarantime.io](https://quarantime.io/) I thought I should deploy it.
The front-end uses the deployed backend api but I found it's the best to show you the front-end in a cloudsandbox.

![image](https://user-images.githubusercontent.com/11639734/84949971-63207d00-b0ee-11ea-8296-362aecb9365e.png)

## Main points of the specification
 - Hundreds of thousands of conversion requests per day.
 - Conversion transactions and requests as defined in the spec.
 - Appealing and usable UI.
 - High performance, scalability and fault tolerance.
 - Converter binary is given but has to be stubbed.

I assumed one user in the system, as user-management and auth were not required, but this can easily be extended to multi-user.

## Overview
The backend is built with Node.js and the front-end is built with React.js.
The server is deployed on AWS Frankfurt region.
The backend follows a **microservices** architecture:
 - Front-end + Conversion + file storage server - EC2 instance Node.js v12.16.3 (lts)
   - **API service** - */shapr-server/server.js* - handles REST requests, dispatches conversion transactions and connects to database and cache
   - **Conversion service** - */shapr-server/convert.js* - controls the conversion binary process, writes to database and cache to update conversion status
   - Storage - files are stored in a folder on this instance, the files are small stub files.
 - Database - PostgreSQL 12. RDS instance
 - Cache server - Redis 5.0.6 ElastiCache instance

The front end is a reactive and ergonomic UI for the problem.

### API

I created the following simple REST api:

`GET /shapr/conversion/` : Get all conversions for a user

`GET /shapr/conversion/:id/`: Get a conversion transaction by ID

Sample output
```
  created_at: "2020-06-17T20:56:24.539Z"
  finished_at: "2020-06-17T20:56:33.623Z"
  id: "Oi6C6Itz5jNlT71zJ213sztAUEmiDbff"
  input_file: "cardesign.shapr"
  output_file: "cardesign.iges"
  status: 2 (0: waiting, 1: in-progress, 2: completed, 3: failed)
  target_type: "iges"
  user_id: "0"
```

`POST /shapr/conversion/`: Create a new conversion transaction

Sample input
```
{
  targettype: [step|iges|stl|obj]
}
```

`POST /shapr/upload/`: Upload a file to a conversion

Sample input
```

    file: File,
    txid: conversion transaction id

```

`GET /shapr/files/:filename/`: Download a file 


### Server

Main packages used
 - Koa and a lot of Koa middlewares - a much better webserver framework than Express
 - ioredis - async Redis client
 - knex - async query builder and migrations manager
 - pino - verbose logger
 - nanoid - very secure string generation

There are two parts for the currrent server. The request server handles incoming requests and files and handles file serving, and in case of a conversion transaction request it spawns an **independent** node.js conversion process. **Note**, in production instead of using Node.js for the conversion control process a more lightweight process, such as a Go srevice would be prefect, which has faster spin-up speed and doesn't eat a lot of memory, like a V8 does. Conversion processes control and read the conversion binary (that is mocked/stubbed here). The conversion processes write updates to both Redis and Postgre and the request servers read/write data from/to there.

Architecture:
![image](https://user-images.githubusercontent.com/11639734/84956013-a384f880-b0f8-11ea-9bc3-ccb545afe92a.png)

### Binary stub

Creating the binary mock was an interesting task. I followed the task deskription and created a javascript file that takes as input an .shapr file a supported target filetype and the output file name. It does error checking, and fails on an invalid argument. Then writes to the stdout the specified string, increasing the progress percent **randomy** by 10% in intervals between 0.5 and 2 seconds, simulating a longer process. In order to simulate a failing conversion, if you name the input file fail.shapr, it will fail at 60%. :)

Invokation example:
```
node .\binary-stub.js ./files/3847238423872384.hello.shapr iges ./files/3847238423872384.hello
```

### Database, cache and storage

I use the transaction id to create folders and put the input and output file of each conversion into sthem, avoiding collisions and keeping it secure and simple. 

The conversion tx ID (txid) is generated on Node, with the performant [nanoid](https://github.com/ai/nanoid) library. The alphabet is 42 character long
and the length of an ID is 32 characters, which gives 1%/~23 trillions years chance of collision under 1000 IDs/second frequency ([ref](https://alex7kom.github.io/nano-nanoid-cc/?alphabet=123456789abcdefghijklmnopqrstuvwxyz&size=32&speed=1000&speedUnit=second)). I used a B-Tree index on the conversiontx id and user_id due to the nature of our requests.
The schema is defined in shapr-server/shapr.sql
I use the well-tested knex.js library for database connection. Knex allows migrations and and seed based table generation, important for production. 

This is how the schema looks:
![image](https://user-images.githubusercontent.com/11639734/84951667-0bcfdc00-b0f1-11ea-9a19-edfed7dba523.png)

The cache server is simply used to store and retrieve the progress of each transaction rapidly. It's a very simple hash store.

Redis cache populated:
![image](https://user-images.githubusercontent.com/11639734/84951762-2f932200-b0f1-11ea-8d39-6302eaf5d8f1.png)



### Scalability and fault tolerance

The Node.js request server does not hold state, thus it can be deployed in a cluster, for example with pm2, and scaled out and the nodes are independent of each other and the ongoing conversion processes. The conversion processes are spawned by each server node upon request, and they update the conversion status to the database and cache database. The conversion processes should not be Node.js rather Go or something similarly lighterweight. If a conversion process fails that is written to the databases.

Hence **the system is horizontally scalable** and the only centralized points are the databases which are easy to scale-out using replicas and clusters.

### Stress testing

I tested these on my own machine which has almost the same specs as the t2.micro instance I have on AWS (except of course the OS, where Windows is a disadvantage)
Getting a list of all conversions for a user:
Testfile: *shapr-server/test/test.js*

10.000 `GET /shapr/conversion/` requests (Get all conversions for a user):

`7989 milliseconds` which gives `1252 request/second` GET ALL performance on my machine.

Initiating new conversions:

10.000 `POST /shapr/conversion/`: Create a new conversion transaction

`21089 milliseconds` which gives `474 request/second` performance on my machine. This is without uploading and spawning conversion servces. Those shold be in a different machine.

## Modifications for real production
The front-end server should be decomposed into request, processing and storage server:
 - Request server + front-end server - I suggest an EC2 instance with Node.js cluster (and nginx). (*server.js*) 
 - Conversion server - Other EC2 instance(s) focused both on CPU and RAM. (*convert.js*)
 - File storage server - I suggest AWS S3 

Conversion should be separate from the front-end server because it is both CPU and RAM intensive, especially if the specified rate (100.000 requests/day) holds. **Also instead of using Node.js for conversion dispatching another, more light-weight language should be used (a node V8 takes 30ms to spawn and eats 10mb memory at least)**. A Go service would be perefect.

The database servers are good in the current system:
 - Cache server - I suggest Redis on AWS ElastiCache
 - Database server - I suggest PostgreSQL on RDS

Caching should be extended to cache-aside/read through strategy with ttl expiry to support efficient record retrival. This is fairly trivial to do from here. And obviously the already existing user-management should be used too.

## Deployment

On AWS I set up the smallest (500MB) free ElastiCache Redis instance and I already had a Postgresql instance and an EC2 instance. I used the local DB and Redis for testing and the RDS and ElastiCache for "production".

I had to reconfigure Nginx to host shapr server next to the [Quarantime.io](https://quarantime.io/) app server. The config file can be found. shapr-server/nginx.config.

## Development Environment

  - Windows 10 and Ubuntu 19 ( for curl testing)
  - Redis on localhost
  - PostgreSQL on AWS
  - pgAdmin client for Postgre
  - RedisInsight client for Redis
  - Node.js
  - Visual Studio Code
  - Git
  - Testing: Advances REST client

### Deployment on localhost
In order to deploy on localhost the following must be done:
 - Install PostgreSQL, Redis, Nodejs (version specified above, for redis it doesn't matter) and start the two DBs.
 - Execute shapr.sql on postgre
 - pm2 start server.js in /shapr-server
 - npm start in /shapr-client
 - Enjoy.
