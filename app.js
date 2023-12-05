const ZB = require('zeebe-node')
const path = require('path')

const zbc = new ZB.ZBClient()

async function main() {
    const topology = await zbc.topology()

    console.log('Topology', topology)

    const deployment = await zbc.deployResource({
        processFilename: path.join(process.cwd(), 'resources', 'simple.bpmn')
    })

    console.log('Deployment', deployment)

    const processInstance = await zbc.createProcessInstance({
        bpmnProcessId: 'simple',
        variables: {}
    })

    console.log('Process Instance', processInstance)

    zbc.createWorker({
        taskType: 'service-task',
        taskHandler: job => {
            console.log('Worker received job', job)
            setTimeout(() => {
                console.log(`We deployed, started, and serviced a job in a process instance. If you didn't see any errors, then everything went according to plan. Exiting.`)
                process.exit()
            }, 1000)
            return job.complete()
        }
    })
}

main()