# Shapr3D Conversion Service
Shapr3D backend engineer homework job application made by Najib Ghadri.

Task description: https://docs.google.com/document/d/1eA_v3622sIO4M4Hk7kUeq3nm-sn7cyXLxIpdvwr2faE

Since I have a free AWS account and already set-up EC2 and RDS instances I thought I should deploy it.
The front-end uses the deployed backend api but I found it's best to deploy the front-end in a sandbox rather than on my own website.

**Deployed application**: https://codesandbox.io/s/hungry-vaughan-49uno


## Main points of the specification
 - Hundreds of thousands of conversion requests/day
 - 

## Overview
The backend is built with Node.js and the front-end is built with React.js.
The server is deployed on AWS Frankfurt region.
The current architecture is a bit like **microservices**:
 - Fron-end/compression/file storage server - EC2 instance
   - **API service**: recieves requests, dispatches conversion transactions and connects to database and cache
   - **Compression service**: controls the compression binary process, writes to database and cache
 - Database - PostgreSQL RDS instance
 - Cache server - Redis ElastiCache instance


### Binary stub

### Deployment

### Scalability and fault tolerance

Stream processsing

### Logging

### Performance testing

## Modifications for real production
The architecture should be microservice based.
 - Request server / front-end server - I suggest EC2 instance with node.js cluster (and nginx).
 - Cache server - I suggest Redis on AWS ElastiCache
 - Database server - I suggest PostgreSQL on RDS
 - Storage server - I suggest AWS S3 
 - Processing server - Other EC2 instance(s) focused both on CPU and RAM.

Conversion should definitely be separate from the front-end server, because it is both CPU and RAM intensive, especially if the specified rate (100.000 requests/day) holds.

## Development Environment

  - Windows 10
  - Redis on localhost
  - PostgreSQL on AWS
  - Node.js v12.16.3 (stable)
  - Visual Studio Code
  - Git

There is no separate production and development PostgreSQL database, the RDS instance was used for testing and production. In production environment this is different obviously.