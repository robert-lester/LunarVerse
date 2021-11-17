# Shuttle
> An easy way to send data from point A to point B

Shuttle is an application that takes in various types of data via a POST request, normalizes it, and sends it to various types of outputs. The project is written in Typescript 2.9 and the compiled webpack bundle is running on AWS Lambdas on Node 8.10.

## Offline
To run the API for the first time offline, run the following commands:
```bash
~/shuttle: yarn
~/shuttle: sls offline
```

To run the API on a different stage or a different port, you can add `--port` and `--stage` flags:
```bash
~/shuttle: sls offline --stage=production --port=8000
```

## Database
To run database migrations you need to have `knex` installed globally. You can do that with:
```bash
npm i -g knex
```

**NOTE**: You need to manually set `knexfile.js` to be hardcoded to contain the database creds.

**DO NOT COMMIT THIS TO GIT.**

After that, you can run the following command to run the migrations
```bash
~/: cd ~/shuttle/database
~/shuttle/database: knex migrate:latest
```

## Deploying
There are two different types of deployments
- Development
- Production

### Development Deploy
To deploy to a development environment, you need to manually update the `serverless.yml` file to change the AWS VPC settings.

```bash
# PRODUCTION VPC
# vpc:
#   securityGroupIds:
#     - sg-e470c392
#   subnetIds:
#     - subnet-738fa17f
#     - subnet-3513c00a
#     - subnet-1e968732
#     - subnet-3860dc5c
#     - subnet-89e9e3d3
#     - subnet-3e22f275

# STAGING, QA, DEMO, VPC
vpc:
  securityGroupIds:
    - sg-7bcd3a09
  subnetIds:
    - subnet-3e22f275
    - subnet-89e9e3d3
```

After updating the `serverless.yml` to use the right VPC, run:
```bash
~/shuttle: sls offline --stage=staging
```

The existing development environments are:
- `staging`: Shared dev build for testing the UI and new fetaures
- `qa`: "Stable" QA environment for Damien to test new/existing features in
- `demo`: A stable environment equal with Production used by Sales to run tests

### Production deploy
To deploy to production, you need to manually update the `serverless.yml` file to change the AWS VPC settings.

```bash
# PRODUCTION VPC
vpc:
  securityGroupIds:
    - sg-e470c392
  subnetIds:
    - subnet-738fa17f
    - subnet-3513c00a
    - subnet-1e968732
    - subnet-3860dc5c
    - subnet-89e9e3d3
    - subnet-3e22f275

# STAGING, QA, DEMO, VPC
# vpc:
#   securityGroupIds:
#     - sg-7bcd3a09
#   subnetIds:
#     - subnet-3e22f275
#     - subnet-89e9e3d3
```

After updating the `serverless.yml` to use the right VPC, run:
```bash
~/shuttle: sls offline --stage=staging
```

## API Documentation

Every request must have an `Authorization` header which is your JWT that is returned after logging in using Core. See the core docs for more info.

### Destinations
Get all Destinations
> `GET /destinations`
<details>
<summary>Details</summary>
<p>

  ```typescript
  ?withTags: boolean = true
  ```

</p>
</details>
<br/>

Create a new Destination
> `POST /destinations`
<details>
<summary>Details</summary>
<p>

  ```typescript
  {
    name: string
    type?: string = 'email'
    config?: Object
    mapping?: Object
    validation?: Object
    tags?: Object[]
  }
  ```

</p>
</details>
<br/>

Get a single Destination
> `GET /destinations/:id`
<details>
<summary>Details</summary>
<p>

  ```typescript
  ?withTags: boolean = true
  ```

</p>
</details>
<br/>

Update an existing Destination
> `PATCH /destinations/:id`
<details>
<summary>Details</summary>
<p>

  ```typescript
  {
    name?: string
    type?: string
    config?: Object
    mapping?: Object
    validation?: Object
  }
  ```

</p>
</details>
<br/>

Archive a Destination (soft delete)
> `DELETE /destinations/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

Restore a Destination
> `PUT /destinations/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

### Pods
Paginate on Pods (doesn't return decrypted data)
> `GET /pods`
<details>
<summary>Details</summary>
<p>

  ```typescript
  current: number = 1
  pageSize: number = 25
  ?destinations: number[]
  ?sources: number[]
  ```

</p>
</details>
<br/>

Create a new Pod (USE ONLY FOR DEBUGGING)
> `POST /pods`
<details>
<summary>Details</summary>
<p>

  ```typescript
  {
    api_key: string
    param_1: any
    param_2: any
    ...
    param_x: any
  }
  ```

</p>
</details>
<br/>

Get a single Pod (returns decrypted data)
> `GET /pods/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

### Relays
Get all Relays
> `GET /relays`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

Create a new Relay
> `POST /relays`
<details>
<summary>Details</summary>
<p>

  ```typescript
  {
    name: string
  }
  ```

</p>
</details>
<br/>

Archive a Relay (soft delete)
> `DELETE /relays/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

Restore a Relay
> `PUT /relays/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

### Sources
Get all Sources
> `GET /sources`
<details>
<summary>Details</summary>
<p>

  ```typescript
  ?withTags: boolean = true
  ```

</p>
</details>
<br/>

Create a new Source
> `POST /sources`
<details>
<summary>Details</summary>
<p>

  ```typescript
  {
    name: string
    config?: Object
    relays?: Object[]
    router?: Object[]
    form: Object
    tags?: Object[]
  }
  ```

</p>
</details>
<br/>

Get a single Source
> `GET /sources/:id`
<details>
<summary>Details</summary>
<p>

  ```typescript
  ?withTags: boolean = true
  ```

</p>
</details>
<br/>

Update an existing Source
> `PATCH /sources/:id`
<details>
<summary>Details</summary>
<p>

  ```typescript
  {
    name?: string
    type?: string
    config?: Object
    mapping?: Object
    validation?: Object
  }
  ```

</p>
</details>
<br/>

Archive a Source (soft delete)
> `DELETE /sources/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

Restore a Source
> `PUT /sources/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

### Tags
Get all Tags
> `GET /tags`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>

Create a new Tag
> `POST /tags`
<details>
<summary>Details</summary>
<p>

  ```typescript
  {
    name: string
  }
  ```

</p>
</details>
<br/>

Delete a Tag
> `DELETE /tags/:id`
<details>
<summary>Details</summary>
<p>No options available</p>
</details>
<br/>