const ZB = require('zeebe-node')
const path = require('path')

const zbc = new ZB.ZBClient()

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
    let greenDone =0

    zbc.createWorker({
        taskType: 'service-task',
        taskHandler: job => {
            if (job.tenantId !== 'green') {
                console.log(`ERROR: Green Tenant worker received job for tenant: ${job.tenantId}`)
            }
            greenDone ++
            return job.complete()
        },
        tenantId: 'green'
    })

    zbc.createWorker({
        taskType: 'service-task',
        taskHandler: job => {
            if (job.tenantId !== 'red') {
                console.log(`ERROR: Red Tenant worker received job for tenant: ${job.tenantId}`)
            }
            redDone++
            return job.complete()
        },
        tenantId: 'red'
    })

    let red = 0
    let green = 0

    setInterval(() => {
        green++
        zbc.createProcessInstance({
            bpmnProcessId: 'simple',
            variables: {},
            tenantId: 'green'
        })
    }, 1000)

    setInterval(() => {
        red++
        zbc.createProcessInstance({
            bpmnProcessId: 'simple',
            variables: {},
            tenantId: 'red'
        })
    }, 1000)

    setInterval(() => {
        console.log('\n')
        console.log(`Started ${red} processes on Red Tenant
Completed ${redDone} jobs on Red Tenant
Started ${green} processes on Green Tenant
Completed ${greenDone} jobs on Green Tenant`)
    }, 5000)

    // console.log('Process Instance', processInstance)


}

main()