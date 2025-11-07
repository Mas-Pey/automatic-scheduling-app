import {
    DefaultMonthlyEventItem,
    MonthlyBody,
    MonthlyCalendar,
    MonthlyDay,
    MonthlyNav
} from "@zach.codes/react-calendar"
import type { EventType, ScheduleParams, ScheduleSummary } from "../types"
import { useCallback, useEffect, useState } from "react"
import { useEmployees } from "../hooks/useEmployees"
import { EmployeeList } from "./EmployeeList"
import { BadgeInfoIcon } from "lucide-react"

interface ScheduleCalendarProps {
    currentMonth: Date
    setCurrentMonth: (date: Date) => void
    schedules: EventType[]
    onGenerate: (params: ScheduleParams) => void
    summary: ScheduleSummary | null
}

export const ScheduleCalendar = ({
    currentMonth,
    setCurrentMonth,
    schedules,
    onGenerate,
    summary
}: ScheduleCalendarProps) => {
    const {
        employees,
        manageEmployee,
        fetchEmployees,
        updateEmployee,
        addEmployee,
        deleteEmployee,
        setManageEmployee
    } = useEmployees()
    const [form, setForm] = useState<ScheduleParams>({
        month: currentMonth.getMonth(),
        shift_per_day: 2,
        open_hour: 8,
        hour_shift: 7,
        employee_per_shift: 1,
        maximum_hour_per_week: 40
    })
    const [showSummary, setShowSummary] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: Number(value)
        }))
    }

    const onCloseManage = useCallback(() => {
        setManageEmployee(false)
    }, [setManageEmployee])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowSummary(false)
        }
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [])

    return (
        <div className="calendar-wrapper">
            <MonthlyCalendar currentMonth={currentMonth} onCurrentMonthChange={setCurrentMonth}>
                <div className='flex justify-between items-center'>
                    <MonthlyNav />
                    <div className="flex space-x-4">
                        {!manageEmployee && (
                            <button
                                onClick={(fetchEmployees)}
                                className='p-2 bg-pink-500 text-white font-semibold text-md rounded-md hover:bg-pink-600 border-2 border-pink-200'
                            >
                                Manage Employees
                            </button>
                        )}
                        <button
                            onClick={() => onGenerate(form)}
                            className='p-2 bg-gradient-to-br from-pink-600 to-blue-600 text-white font-extrabold text-lg rounded-md hover:from-pink-800 hover:to-blue-800 border-2 border-pink-200'
                        >
                            Generate Schedule
                        </button>
                        {summary && !showSummary && (
                            <button
                                onClick={() => setShowSummary(true)}
                                className='flex items-center gap-1 p-2 bg-pink-500 text-white font-semibold text-md rounded-md hover:bg-pink-600 border-2 border-pink-200'
                            >
                                <span>Show Summary</span>
                                <BadgeInfoIcon className="w-6 opacity-80" />
                            </button>
                        )}
                    </div>
                </div>

                <EmployeeList
                    employees={employees}
                    manage={manageEmployee}
                    onUpdate={updateEmployee}
                    onAdd={addEmployee}
                    onDelete={deleteEmployee}
                    onCloseManage={onCloseManage}
                />

                {showSummary && summary && (
                    <div onClick={() => setShowSummary(false)} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl p-4 w-full max-w-lg max-h-[75vh] overflow-y-auto relative">

                            {/* Close Button */}
                            <button
                                onClick={() => setShowSummary(false)}
                                className="absolute top-2 right-2 text-gray-600 hover:text-black"
                            >
                                X
                            </button>

                            <h3 className="font-semibold text-lg mb-2 text-center">Schedule Summary</h3>

                            <p><strong>Median Weekly Hours:</strong> {summary.median_of_weekly_hour}</p>

                            {/* Weekly */}
                            <div className="mt-3">
                                <strong>Weekly Hours:</strong>
                                {Object.entries(summary.weekly_hour_breakdown).map(([week, data]) => (
                                    <div key={week} className="mt-1">
                                        <span className="font-medium">{week}</span>
                                        <ul className="list-disc ml-6">
                                            {Object.entries(data).map(([name, hours]) => (
                                                <li key={name}>{name}: {hours} hours</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Monthly */}
                            <div className="mt-3">
                                <strong>Monthly Hours:</strong>
                                <ul className="list-disc ml-5">
                                    {Object.entries(summary.monthly_hour_breakdown).map(([name, hours]) => (
                                        <li key={name}>{name}: {hours} hours</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Overworked */}
                            {summary.overworked_employees.length > 0 && (
                                <div className="mt-3">
                                    <strong className="text-red-600">Overworked Employees:</strong>
                                    <ul className="list-disc ml-5 text-red-600">
                                        {summary.overworked_employees.map((emp, idx) => (
                                            <li key={idx}>{emp.name} — {emp.totalHours} hours ({emp.week})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                <div className="flex justify-center mb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-5 max-w-4xl">

                        {/* Reusable field wrapper */}
                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="whitespace-normal leading-tight text-md text-right">Month</label>
                            <select
                                name="month"
                                value={form.month}
                                onChange={handleChange}
                                className="border p-1 rounded w-full max-w-[110px] truncate"
                            >
                                {[
                                    "January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"
                                ].map((m, idx) => (
                                    <option key={idx} value={idx} className="truncate">{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="whitespace-normal leading-tight text-md text-right">Shifts per day</label>
                            <input
                                type="number"
                                name="shift_per_day"
                                value={form.shift_per_day}
                                min={1}
                                onChange={handleChange}
                                className="border p-1 rounded w-full max-w-[110px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="whitespace-normal leading-tight text-md text-right">Open hour</label>
                            <input
                                type="number"
                                name="open_hour"
                                value={form.open_hour}
                                min={0}
                                max={23}
                                onChange={handleChange}
                                className="border p-1 rounded w-full max-w-[110px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="whitespace-normal leading-tight text-md text-right">Hour per shift</label>
                            <input
                                type="number"
                                name="hour_shift"
                                value={form.hour_shift}
                                min={1}
                                onChange={handleChange}
                                className="border p-1 rounded w-full max-w-[110px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="whitespace-normal leading-tight text-md text-right">Employees per shift</label>
                            <input
                                type="number"
                                name="employee_per_shift"
                                value={form.employee_per_shift}
                                min={1}
                                onChange={handleChange}
                                className="border p-1 rounded w-full max-w-[110px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 items-center gap-2">
                            <label className="whitespace-normal leading-tight text-md text-right">Max hours per week</label>
                            <input
                                type="number"
                                name="maximum_hour_per_week"
                                value={form.maximum_hour_per_week}
                                min={1}
                                onChange={handleChange}
                                className="border p-1 rounded w-full max-w-[110px]"
                            />
                        </div>
                    </div>
                </div>

                <MonthlyBody events={schedules}>
                    <MonthlyDay<EventType>
                        renderDay={(dayEvents) =>
                            dayEvents.map((item, idx) => (
                                <DefaultMonthlyEventItem
                                    key={idx}
                                    title={item.name}
                                    date={`${item.timeStart}-${item.timeEnd}`}
                                />
                            ))
                        }
                    />
                </MonthlyBody>
            </MonthlyCalendar>
        </div>

    )
}