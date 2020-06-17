# Shapr3D Conversion Service
**Deployed application**: https://codesandbox.io/s/hungry-vaughan-49uno

Shapr3D backend engineer homework job application made by Najib Ghadri.

Task description: https://docs.google.com/document/d/1eA_v3622sIO4M4Hk7kUeq3nm-sn7cyXLxIpdvwr2faE

Since I have a free AWS account and already set-up EC2 and RDS instances I thought I should deploy it.
The front-end uses the deployed backend api but I found it's best to deploy the front-end in a sandbox rather than on my own website.

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
The backend is follows a **microservices** architecture:
 - Front-end + compression + file storage server - EC2 instance Node.js v12.16.3 (lts)
   - **API service** - server.js - handles REST requests, dispatches conversion transactions and connects to database and cache
   - **Compression service** - compress.js - controls the compression binary process, writes to database and cache to update conversion status
   - Storage - files are stored in a folder on this instance, the files are small stub files.
 - Database - PostgreSQL 12. RDS instance
 - Cache server - Redis 5.0.6 ElastiCache instance

The front end is a reactive and ergonomic UI for the problem.

![image](https://user-images.githubusercontent.com/11639734/84949971-63207d00-b0ee-11ea-8296-362aecb9365e.pn)

g
### API

Click to test

[Get all conversions for a user]() : `GET /shapr/conversion/`

[Get a conversion transaction by ID]() : `GET /shapr/conversion/:id/`

Create a new conversion transaction : `POST /shapr/conversion/`

```formdata
{
  targettype: [step|iges|stl|obj]
}
```

Upload a file to a conversion : `POST /shapr/upload/`
```formdata
{
    file: File,
    txid: conversion transaction id
}
```

[Download a file]() : `GET /shapr/files/:filename/`


### Server

 - Main packages used

### Binary stub

### Database

I use the transaction id to create folders and put the input and output file of each conversion into thus avoiding collisions and keeping it secure. 

The conversion tx ID (txid) is generated on Node, with the performant [nanoid](https://github.com/ai/nanoid) library. The alphabet is 42 character long
and the length of an ID is 32 characters, which gives 1%/~23 trillions years chance of collision under 1000 IDs/second frequency ([ref](https://alex7kom.github.io/nano-nanoid-cc/?alphabet=123456789abcdefghijklmnopqrstuvwxyz&size=32&speed=1000&speedUnit=second)).

The schema is defined in shapr-server/shapr.sql
I use the well-tested knex.js library for database connection. Knex allows migrations and and seed based table generation, important for production. 

### Storage

For each conversion a folder is created with the txid

### Deployment on localhost

On AWS I had to reconfigure Nginx to host shapr server next to my Quarantime.io app server. The config file can be found. shapr-server/nginx.config.

### Scalability and fault tolerance

The Node.js request server file does not hold state, thus it can be deployed in a cluster and the nodes are independent of each other and the ongoing conversion processes. The conversion processes are spawned by each server node upon request, and they update the conversion status to the database and cache database. If a conversion process fails that is written to the databases.

Hence **the system is horizontally scalable** and the only centralized points are the databases which are easy to scale-out using replicas and clusters.

Stream processsing

### Logging

### Stress testing

## Modifications for real production
The front-end server should be decomposed into request, processing and storage server:
 - Request server + front-end server - I suggest an EC2 instance with Node.js cluster (and nginx). (server.js) 
 - Conversion server - Other EC2 instance(s) focused both on CPU and RAM. (compress.js)
 - File storage server - I suggest AWS S3 

Conversion should be separate from the front-end server because it is both CPU and RAM intensive, especially if the specified rate (100.000 requests/day) holds.

 The database servers are good in the current system:
 - Cache server - I suggest Redis on AWS ElastiCache
 - Database server - I suggest PostgreSQL on RDS

Caching should be extended to cache-aside/read through strategy with ttl expiry to support efficient record retrival. This is fairly trivial to do from here.

Obviously the already existing user-management should be used also.

## Development Environment

  - Windows 10
  - Redis on localhost
  - PostgreSQL on AWS
  - Node.js
  - Visual Studio Code
  - Git
  - Testing: Advances REST client

There is no separate production and development PostgreSQL database, the RDS instance was used for testing and production. In production environment this is different obviously.