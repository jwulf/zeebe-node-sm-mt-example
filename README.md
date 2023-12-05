# Zeebe Node Self-Managed Multi-tenancy Example

An example of using the Node.js Zeebe client with a Self-Managed Multi-tenant setup

## How to run this example

* Clone this repository: 

```bash
git clone https://github.com/jwulf/zeebe-node-sm-mt-example.git
```

* Install dependencies: 

```bash
npm i
```

* Start the Self-Managed [multitenancy profile](https://github.com/jwulf/camunda-platform/tree/multi-tenancy) using docker compose: 

```bash
docker compose -f docker-compose-multitenancy.yaml up -d
```

* Open Identity at [http://localhost:8084/](http://localhost:8084/). Login with demo/demo.

* Go to Applications > Add Application. 

* Select M2M. Call it "NodeApp".

* Click on the newly created "NodeApp". 

* Go to "Tenants". Click "Assign Tenant". Select the Default Tenant.

* Go to "Access to APIs". Click "Assign Permissions". Select "Zeebe API", then enable "write:*".

* Go to "Application details", and copy the Client ID and Client secret.

* In the terminal, set your environment variables, substituting your Client ID and Client secret: 

```bash
export ZEEBE_CLIENT_ID='nodeapp'
export ZEEBE_CLIENT_SECRET='WxRB6QcEyOmKkvrFLAGveyZ5TJaj8JJ2'
export ZEEBE_TENANT_ID='<default>'
export ZEEBE_SECURE_CONNECTION=false
export ZEEBE_ADDRESS='localhost:26500'
export ZEEBE_AUTHORIZATION_SERVER_URL='http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token'
export ZEEBE_TOKEN_AUDIENCE='zeebe.camunda.io'
export CAMUNDA_CREDENTIALS_SCOPES='Zeebe'
export CAMUNDA_OAUTH_URL='http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token'
```

* In the same terminal, run the example app: 

```bash
node app.js
```

You should see output like this: 

```
jwulf@Joshs-MBP zeebe-node-sm-mt-example % node app.js
Topology {
  brokers: [
    {
      partitions: [Array],
      nodeId: 0,
      host: '172.20.0.5',
      port: 26501,
      version: '8.3.0'
    }
  ],
  clusterSize: 1,
  partitionsCount: 1,
  replicationFactor: 1,
  gatewayVersion: '8.3.0'
}
Deployment {
  deployments: [ { process: [Object], Metadata: 'process' } ],
  key: '2251799813685270',
  tenantId: '<default>'
}
Process Instance {
  processDefinitionKey: '2251799813685251',
  bpmnProcessId: 'simple',
  version: 1,
  processInstanceKey: '2251799813685271',
  tenantId: '<default>'
}
Worker received job {
  key: '2251799813685276',
  type: 'service-task',
  processInstanceKey: '2251799813685271',
  bpmnProcessId: 'simple',
  processDefinitionVersion: 1,
  processDefinitionKey: '2251799813685251',
  elementId: 'Activity_077bokr',
  elementInstanceKey: '2251799813685275',
  customHeaders: {},
  worker: '2c3ea9f6-a9da-48ee-8f8c-243b26f9875c',
  retries: 3,
  deadline: '1701749012716',
  variables: {},
  tenantId: '<default>',
  cancelWorkflow: [Function (anonymous)],
  complete: [Function (anonymous)],
  fail: [Function (anonymous)],
  error: [Function (anonymous)],
  forward: [Function (anonymous)]
}
If you didn't see any errors, then everything went according to plan. Exiting.
```

## Running the Red / Green Test

The Red / Green test shows how tenants are isolated. The code deploys a process to two different tenants, and then instantiates two workers - one for each tenant - that each service jobs for a single tenant without ever seeing jobs for the other tenant. 

Note: One thing to note about this is that the code example itself violates tenant isolation by implementing access to isolated tenants in a single application. The consequence of this architecture is that a logic error in the application can mix data between tenants, defeating the point of isolation. 

In the normal course of events, you should abstract connection data to the environment variables and keep the application logic "tenant-unaware". 

Instructions:

* Open Identity and create two new tenants: `green` and `red`
* Edit the NodeApp application
* Go to Tenants
* Add the `green` and `red` tenants to the NodeApp application

You can now use the same credentials to run `node red-green.js`. 

You will see output like this:

```
Red Deployment {
  deployments: [ { process: [Object], Metadata: 'process' } ],
  key: '2251799813685366',
  tenantId: 'red'
}
Green Deployment {
  deployments: [ { process: [Object], Metadata: 'process' } ],
  key: '2251799813685367',
  tenantId: 'green'
}


Started 4 processes on Red Tenant
Completed 4 jobs on Red Tenant
Started 4 processes on Green Tenant
Completed 4 jobs on Green Tenant


Started 9 processes on Red Tenant
Completed 9 jobs on Red Tenant
Started 9 processes on Green Tenant
Completed 9 jobs on Green Tenant


Started 14 processes on Red Tenant
Completed 14 jobs on Red Tenant
Started 14 processes on Green Tenant
Completed 14 jobs on Green Tenant
```

# Running against Camunda SaaS

To run against Camunda SaaS, just export the credentials for your API client from the Camunda SaaS Console. 

One gotcha is this: 

If you exported the Self-Managed credentials previously in the terminal, you will need to explicitly turn on TLS with this:

```bash
export ZEEBE_SECURE_CONNECTION=true
```

This is because TLS needs to be turned off for the Self-Managed Docker stack running locally, but turned on for Camunda SaaS. And the Camunda SaaS API credentials from the console do not export this. 

So add it to your credentials set from Camunda SaaS to avoid getting an error like this:

```
 code: 13,
  details: 'Received RST_STREAM with code 2 triggered by internal client error: Protocol error',
  metadata: Metadata { internalRepr: Map(0) {}, options: {} },
  rstCode: 2,
```