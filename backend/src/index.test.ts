import { test, type TestContext } from 'node:test'
import { buildApp } from './server.js'
import Database from 'better-sqlite3'
import { 
    addHours, 
    generateShiftTimes, 
    getEmployeeOnDate, 
    getEmployeeOnShift, 
    getMedianofWeeklyHours, 
    getOverworkedEmployees 
} from './features/schedule.js'

let employeeId = ''

function resetEmployeeTable() {
    const db = new Database('employee.db', { verbose: console.log })
    db.prepare('DELETE FROM employees').run()
    db.close()
}

// ========================= Employee Feature Tests =========================
test('Employee Feature Tests', async (t: TestContext) => {

    await t.test('can create employee', async (t: TestContext) => {
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
        resetEmployeeTable()

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
            error: "No employees",
            message: 'There are no employees available to create a schedule'
        })
    })

    await t.test('return error if employees per shift exceed total employees', async (t: TestContext) => {
        resetEmployeeTable()

        const app = buildApp({ logger: false })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Tole' }
        })

        const response = await app.inject({
            method: 'POST',
            url: '/create-schedule',
            payload: {
                month: 0,
                shift_per_day: 2,
                open_hour: 8,
                hour_shift: 8,
                employee_per_shift: 2, // 2 > 1 (Employee only 1 : Tole)
                maximum_hour_per_week: 40
            }
        })

        t.assert.strictEqual(response.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            error: "Invalid configuration",
            message: "Number of employees per shift cannot exceed total employees"
        })
    })

    await t.test('return error if schedule hours exceed 24 hours a day', async (t: TestContext) => {
        resetEmployeeTable()

        const app = buildApp({ logger: false })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Dul' }
        })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Komeng' }
        })

        const response = await app.inject({
            method: 'POST',
            url: '/create-schedule',
            payload: {
                month: 0,
                shift_per_day: 4,
                open_hour: 8,
                hour_shift: 8, // 4*8 = 32 > 24 hours
                employee_per_shift: 1,
                maximum_hour_per_week: 40
            }
        })

        t.assert.strictEqual(response.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            error: "Invalid configuration",
            message: "Total shift hours in a day exceed 24 hours"
        })
    })

    await t.test('return error if not enough employees to cover all shifts', async (t: TestContext) => {
        resetEmployeeTable()

        const app = buildApp({ logger: false })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Dul' }
        })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Komeng' }
        })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Ucok' }
        })

        const response = await app.inject({
            method: 'POST',
            url: '/create-schedule',
            payload: {
                month: 0,
                shift_per_day: 2,
                open_hour: 8,
                hour_shift: 8,
                employee_per_shift: 2, // (2 * 2) > 3 
                maximum_hour_per_week: 40
            }
        })

        t.assert.strictEqual(response.statusCode, 400, 'response error')
        t.assert.deepStrictEqual(response.json(), {
            error: "Invalid configuration",
            message: "Not enough employees to cover all shifts"
        })
    })

    // ======================== HELPER FUNCTION TESTS ========================
    await t.test('generate shift times function works correctly', async (t: TestContext) => {
        const shiftTimes = generateShiftTimes(8, 3, 7)

        t.assert.strictEqual(shiftTimes.length, 3)

        t.assert.deepStrictEqual(shiftTimes, [
            { shift: 1, time_start: '08:00', time_end: '15:00' },
            { shift: 2, time_start: '15:00', time_end: '22:00' },
            { shift: 3, time_start: '22:00', time_end: '05:00' }
        ])
    })

    await t.test('generate shift times works without passing hour shift', async (t: TestContext) => {
        const shiftTimes = generateShiftTimes(8, 3) // 24/3 = 8 hours per shift

        t.assert.deepStrictEqual(shiftTimes, [
            { shift: 1, time_start: '08:00', time_end: '16:00' },
            { shift: 2, time_start: '16:00', time_end: '00:00' },
            { shift: 3, time_start: '00:00', time_end: '08:00' }
        ])
    })

    await t.test('get employee on date distinguishes between scheduled and unscheduled employee', async (t: TestContext) => {
        const date = new Date(2026, 0, 1).toString()

        const employee1 = 'Toli'
        const employee2 = 'Tole'

        const employeeHours = [
            {
                date: new Date(2026, 0, 1).toString(),
                employees: [employee1],
                time_start: '08:00',
                time_end: '16:00'
            }
        ]

        // case: employee already scheduled 
        const resultExist = getEmployeeOnDate(date, employee1, employeeHours)
        t.assert.ok(resultExist, 'should return schedule object when already scheduled')

        // case: employee not scheduled
        const resultNotExist = getEmployeeOnDate(date, employee2, employeeHours)
        t.assert.strictEqual(resultNotExist, null, 'should return null when employee has no schedule')
    })

    await t.test('get employee on shift return correct shift or null', async (t: TestContext) => {
        const date = new Date(2026, 0, 1).toString()

        const employee1 = 'Toli'
        const employee2 = 'Tole'

        const shiftTimes = [
            { shift: 1, time_start: '08:00', time_end: '16:00' }
        ]

        // Case: schedules empty -> should return null
        let schedules: any = []
        const case1 = getEmployeeOnShift(date, employee1, 0, 2, schedules, shiftTimes)
        t.assert.strictEqual(case1, null, 'should return null when schedules are empty')

        // Case: employee 2 not yet scheduled and shift has space
        schedules = [
            {
                date,
                employees: [employee1],
                time_start: '08:00',
                time_end: '16:00'
            }
        ]
        const case2 = getEmployeeOnShift(date, employee2, 0, 2, schedules, shiftTimes)
        t.assert.ok(case2, 'should return shift object when employee not scheduled yet and shift has space')
        case2.employees.push(employee2)

        // Case: employee already scheduled in that shift -> should return null
        const case3 = getEmployeeOnShift(date, employee2, 0, 2, schedules, shiftTimes)
        t.assert.strictEqual(case3, null, 'should return null when employee already scheduled in that shift')

        // Case: shift index out of range -> should return null
        const case4 = getEmployeeOnShift(date, employee2, 1, 2, schedules, shiftTimes)
        t.assert.strictEqual(case4, null, 'should return null when shift index out of range')
    })

    await t.test('add hours updates total and weekly hours correctly', async (t: TestContext) => {
        const totalHoursWorkedPerEmployee: Record<string, number> = {}
        const weeklyHours: Record<string, Record<string, number>> = {}

        // Case 1: Add hours for new employee in new week
        addHours('Toli', 'week_1', totalHoursWorkedPerEmployee, weeklyHours, 8)
        t.assert.ok(totalHoursWorkedPerEmployee['Toli'], 'total hours for Toli should be initialized')
        t.assert.ok(weeklyHours['week_1']!['Toli'], 'weekly hours for Toli in week_1 should be initialized')
        t.assert.deepStrictEqual(totalHoursWorkedPerEmployee['Toli'], 8, 'total hours for Toli should be 8')
        t.assert.deepStrictEqual(weeklyHours['week_1']!['Toli'], 8, 'weekly hours for Alice in week_1 should be Toli')

        // Case 2: Add more hours to same employee in same week
        addHours('Toli', 'week_1', totalHoursWorkedPerEmployee, weeklyHours, 8)
        t.assert.deepStrictEqual(totalHoursWorkedPerEmployee['Toli'], 16, 'total hours for Toli should now be 16')
        t.assert.deepStrictEqual(weeklyHours['week_1']!['Toli'], 16, 'weekly hours for Toli in week_1 should now be 16')

        t.assert.ok('Toli' in totalHoursWorkedPerEmployee, 'Toli should be in totalHoursWorkedPerEmployee')
        t.assert.ok('week_1' in weeklyHours, 'week_1 should be in weeklyHours')
        t.assert.notDeepStrictEqual('Tole' in totalHoursWorkedPerEmployee, true, 'Tole should not be in totalHoursWorkedPerEmployee')
    })

    await t.test('can identify overworked employees correctly', async (t: TestContext) => {
        const weeklyHours = {
            'week_1': { 'Toli': 48, 'Tole': 48 },
            'week_2': { 'Toli': 40, 'Tole': 32 }
        }

        // Case: no overworked employees
        const overworkedEmpty = getOverworkedEmployees(weeklyHours, 50)
        t.assert.deepStrictEqual(overworkedEmpty, [], 'should return empty array when no overworked employees')

        // Case: overworked detected
        const overworked = getOverworkedEmployees(weeklyHours, 40)
        t.assert.deepStrictEqual(overworked, [
            { name: 'Toli', totalHours: 48, week: 'week_1' },
            { name: 'Tole', totalHours: 48, week: 'week_1' }
        ])
    })

    await t.test('get median of weekly hours correctly', async (t: TestContext) => {
        // Case: odd count -> return middle value
        const weeklyHoursOdd = {
            'week_1': { 'Toli': 35, 'Tole': 35, 'Tina': 28 }
        }
        const case1 = getMedianofWeeklyHours(weeklyHoursOdd)
        t.assert.deepStrictEqual(case1, 35, 'median of [28,35,35] should be 35')

        // Case: even count -> return average of middle two
        const weeklyHoursEven = {
            'week_1': { 'Toli': 35, 'Tole': 35, 'Tina': 28, 'Tio': 25 }
        }
        const case2 = getMedianofWeeklyHours(weeklyHoursEven)
        t.assert.deepStrictEqual(case2, (28 + 35) / 2, 'median of [25,28,35,35] should be (28+35)/2 = 31.5')
    })

    // ======================== SCHEDULE ROUTE TESTS ========================
    await t.test('should generate schedule and summaries', async (t: TestContext) => {
        resetEmployeeTable()

        const app = buildApp({ logger: false })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Toli' }
        })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Tole' }
        })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Tina' }
        })

        await app.inject({
            method: 'POST',
            url: '/employee',
            payload: { name: 'Tralala' }
        })

        const response = await app.inject({
            method: 'POST',
            url: '/create-schedule',
            payload: {
                month: 0,
                shift_per_day: 2,
                open_hour: 7,
                hour_shift: 8,
                employee_per_shift: 2,
                maximum_hour_per_week: 40
            }
        })

        t.assert.strictEqual(response.statusCode, 200)
        const json = response.json()
        t.assert.ok(json.schedules.length > 0, 'schedule should not be empty')
    })

})

test('Cleanup after all tests', async () => {
    resetEmployeeTable()
})