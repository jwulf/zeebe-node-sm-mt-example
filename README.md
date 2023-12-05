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
