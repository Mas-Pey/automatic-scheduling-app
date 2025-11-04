import { test, type TestContext } from 'node:test'
import { buildApp } from './server.ts'
// import Database from 'better-sqlite3'

let employeeId = ''
let ScheduleResponse: any = null

// ========================= Employee Feature Tests =========================
test('Employee Feature Tests', async (t: TestContext) => {

    await t.test('can create employee', async (t: TestContext) => {
        t.plan(3)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Newname-1' }
        })

        t.assert.strictEqual(response.statusCode, 200, 'response 200')
        const json = response.json()
        t.assert.deepStrictEqual(json.employee.name, 'Newname-1')
        t.assert.ok(json.employee.id)
        employeeId = json.employee.id
    })

    await t.test('return error if name is not a string', async (t: TestContext) => {
        t.plan(2)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'POST',
            url: '/employee',
            payload: {
                name: 2025
            }
        })

        t.assert.strictEqual(response.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            message: 'Name must be a text'
        })
    })

    await t.test('return error if name is an empty or only spaces', async (t: TestContext) => {
        t.plan(4)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'POST',
            url: '/employee',
            payload: {
                name: ' '
            }
        })

        t.assert.strictEqual(response.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            message: 'Name must be a text'
        })

        const response2 = await app.inject({
            method: 'PUT',
            url: `/employee/${employeeId}`,
            payload: {
                name: '  '
            }
        })

        t.assert.strictEqual(response2.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response2.json(), {
            message: 'Name must be a text'
        })
    })

    await t.test('can return all employees', async (t: TestContext) => {
        t.plan(3)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'GET',
            url: '/employees',
        })

        t.assert.strictEqual(response.statusCode, 200, 'response 200')
        const json = response.json()
        t.assert.ok(Array.isArray(json.employees), 'employees is an array')
        t.assert.ok(json.employees.length > 0, 'employees is not empty')

    })

    await t.test('can return employee info', async (t: TestContext) => {
        t.plan(3)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'GET',
            url: `/employee/${employeeId}`
        })

        t.assert.strictEqual(response.statusCode, 200, 'response 200')
        const json = response.json()
        t.assert.deepStrictEqual(json.employee.id, employeeId)
        t.assert.deepStrictEqual(json.employee.name, 'Newname-1')
    })

    await t.test('can update employee data', async (t: TestContext) => {
        t.plan(2)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'PUT',
            url: `/employee/${employeeId}`,
            payload: { name: 'Mulyadi' }
        })

        t.assert.strictEqual(response.statusCode, 200, 'response 200')
        const json = response.json()
        t.assert.deepStrictEqual(json.employee.name, 'Mulyadi')
    })

    await t.test('return error if employee not found when updating', async (t: TestContext) => {
        t.plan(2)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'PUT',
            url: '/employee/-1',
            payload: { name: 'Mulyadi' }
        })

        t.assert.strictEqual(response.statusCode, 404, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            message: 'Employee not found'
        })
    })

    await t.test('can delete employee', async (t: TestContext) => {
        t.plan(4)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'DELETE',
            url: `/employee/${employeeId}`
        })

        t.assert.strictEqual(response.statusCode, 200, 'response 200')
        t.assert.deepEqual(response.json(), {
            message: `Employee ID : ${employeeId} successfully deleted`,
        })

        const check = await app.inject({
            method: 'GET',
            url: `/employee/${employeeId}`
        })
        t.assert.strictEqual(check.statusCode, 404, 'employee should not exist anymore')
        t.assert.deepEqual(check.json().message, 'Employee not found')
    })

    await t.test('return error if employee not found when deleting', async (t: TestContext) => {
        t.plan(2)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'DELETE',
            url: '/employee/-1'
        })

        t.assert.strictEqual(response.statusCode, 404, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            message: 'Employee not found'
        })
    })
})

// ========================= Schedule Feature Tests =========================
test('Schedule Feature Tests', async (t: TestContext) => {

    // ======================== VALIDATION TESTS ========================
    await t.test('return error if there are no employees', async (t: TestContext) => {
        // const dbMemory = new Database('employee.db', { verbose: console.log })

        t.plan(2)
        const app = buildApp({
            logger: false
        })

        const response = await app.inject({
            method: 'POST',
            url: '/create-schedule',
            payload: {
                month: 0,
                shift_per_day: 2,
                open_hour: 8,
                hour_shift: 8,
                employee_per_shift: 1,
                maximum_hour_per_week: 40
            }
        })
        t.assert.strictEqual(response.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            message: 'There are no employees available to create a schedule'
        })
    })

    // await t.test('return error if employee_per_shift > total employees', async (t: TestContext) => {
    //     t.plan(2)
    //     const app = buildApp({ logger: false })

    //     await app.inject({
    //         method: 'POST',
    //         url: '/employee',
    //         payload: { name: 'Alice' }
    //     })

    //     const response = await app.inject({
    //         method: 'POST',
    //         url: '/create-schedule',
    //         payload: {
    //             month: 0,
    //             shift_per_day: 2,
    //             open_hour: 8,
    //             hour_shift: 8,
    //             employee_per_shift: 2 // lebih dari total employee = 1
    //         }
    //     })

    //     t.assert.strictEqual(response.statusCode, 400, 'response error')
    //     t.assert.deepStrictEqual(response.json().message, 'Number of employees per shift cannot exceed total employees')
    // })

    await t.test('return error if total shift hours exceed 24', async (t: TestContext) => {
        t.plan(2)
        const app = buildApp({ logger: false })

        const response = await app.inject({
            method: 'POST',
            url: '/create-schedule',
            payload: {
                month: 0,
                shift_per_day: 3,
                open_hour: 8,
                hour_shift: 10, // 3*10 = 30 > 24
                employee_per_shift: 1
            }
        })

        t.assert.strictEqual(response.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response.json().message, 'Total shift hours in a day exceed 24 hours')
    })

    // await t.test('return error if not enough employees to cover all shifts', async (t: TestContext) => {
    //     t.plan(2)
    //     const app = buildApp({ logger: false })

    //     // 1 employee, shift_per_day = 2, employee_per_shift = 2 → 2>1
    //     const response = await app.inject({
    //         method: 'POST',
    //         url: '/create-schedule',
    //         payload: {
    //             month: 0,
    //             shift_per_day: 2,
    //             open_hour: 8,
    //             hour_shift: 8,
    //             employee_per_shift: 2
    //         }
    //     })

    //     t.assert.strictEqual(response.statusCode, 400, 'response error')
    //     t.assert.deepStrictEqual(response.json().message, 'Not enough employees to cover all shifts')
    // })

})