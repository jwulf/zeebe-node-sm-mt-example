const ZB = require('zeebe-node')
const path = require('path')

const zbc = new ZB.ZBClient()

/**
 * All configuration about which server it is running against and for which tenant is configurable via env vars, 
 * making that a separate concern from the business logic.
 * 
 * If you want to address different tenants in the same code, then I made it possible to override the tenantId explicitly in code.
 * 
 * I don't recommend using explicit tenant Ids in API calls and addressing distinct tenants in the same code as the 
 * usual practice. This code is to demonstrate how tenant isolation works, in a simple code example. 
 * 
 * Note that tenant isolation is at risk when addressing multiple tenants with the same code because a coding error 
 * can mix up data between two otherwise isolated tenants. 
 * 
 */
async function main() {

    const deploymentRed = await zbc.deployResource({
        processFilename: path.join(process.cwd(), 'resources', 'simple.bpmn'),
        tenantId: 'red'
    })

    console.log('Red Deployment', deploymentRed)

    const deploymentGreen = await zbc.deployResource({
        processFilename: path.join(process.cwd(), 'resources', 'simple.bpmn'),
        tenantId: 'green'
    })

    console.log('Green Deployment', deploymentGreen)

    let redDone = 0
    let greenDone = 0

    // Green tenant worker
    const greenTenantId = 'green'
    zbc.createWorker({
        taskType: 'service-task',
        taskHandler: job => {
            if (job.tenantId !== greenTenantId) {
                console.log(`ERROR: Green Tenant worker received job for tenant: ${job.tenantId}`)
            }
            greenDone ++
            return job.complete()
        },
        tenantId: greenTenantId
    })

    // Red tenant worker
    const redTenantId = 'red'
    zbc.createWorker({
        taskType: 'service-task',
        taskHandler: job => {
            if (job.tenantId !== redTenantId) {
                console.log(`ERROR: Red Tenant worker received job for tenant: ${job.tenantId}`)
            }
            redDone++
            return job.complete()
        },
        tenantId: redTenantId
    })

    let redStarted = 0
    let greenStarted = 0

    setInterval(() => zbc.createProcessInstance({
            bpmnProcessId: 'simple',
            variables: {},
            tenantId: 'green'
        }).then(() => greenStarted++)
    , 1000)

    setInterval(() => zbc.createProcessInstance({
            bpmnProcessId: 'simple',
            variables: {},
            tenantId: 'red'
        }). then(() => redStarted++)
    , 1000)

    setInterval(() => {
        console.log('\n')
        console.log(`Started ${redStarted} processes on Red Tenant
Completed ${redDone} jobs on Red Tenant
Started ${greenStarted} processes on Green Tenant
Completed ${greenDone} jobs on Green Tenant`)
    }, 5000)
}

main()