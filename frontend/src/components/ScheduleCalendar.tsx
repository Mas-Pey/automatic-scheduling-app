import {
    DefaultMonthlyEventItem,
    MonthlyBody,
    MonthlyCalendar,
    MonthlyDay,
    MonthlyNav
} from "@zach.codes/react-calendar"
import type { EventType, ScheduleParams } from "../types"
import { useState } from "react"

interface ScheduleCalendarProps {
    currentMonth: Date
    setCurrentMonth: (date: Date) => void
    schedules: EventType[]
    onGenerate: (params: ScheduleParams) => void
}

export const ScheduleCalendar = ({
    currentMonth,
    setCurrentMonth,
    schedules,
    onGenerate
}: ScheduleCalendarProps) => {
    const [form, setForm] = useState<ScheduleParams>({
        month: currentMonth.getMonth(),
        shift_per_day: 2,
        open_hour: 8,
        hour_shift: 7,
        employee_per_shift: 1,
        maximum_hour_per_week: 40
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: Number(value)
        }))
    }

    return (
        <MonthlyCalendar
            currentMonth={currentMonth}
            onCurrentMonthChange={setCurrentMonth}
        >
            <MonthlyNav />

            <div className='flex justify-center'>
                <button onClick={() => onGenerate(form)} className='p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700'>
                    Generate Schedule
                </button>
            </div>

            <div className="flex justify-center mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-5 max-w-2xl">

                    {/* Reusable field wrapper */}
                    <div className="grid grid-cols-2 items-center gap-2">
                        <label className="whitespace-normal leading-tight text-md text-right">Month</label>
                        <select
                            name="month"
                            value={form.month}
                            onChange={handleChange}
                            className="border p-1 rounded w-full max-w-[90px] truncate"
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
                            className="border p-1 rounded w-full max-w-[90px]"
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
                            className="border p-1 rounded w-full max-w-[90px]"
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
                            className="border p-1 rounded w-full max-w-[90px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 items-center gap-2">
                        <label className="whitespace-normal leading-tight text-md text-left">Employees per shift</label>
                        <input
                            type="number"
                            name="employee_per_shift"
                            value={form.employee_per_shift}
                            min={1}
                            onChange={handleChange}
                            className="border p-1 rounded w-full max-w-[90px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 items-center gap-2">
                        <label className="whitespace-normal leading-tight text-md text-left">Max hours per week</label>
                        <input
                            type="number"
                            name="maximum_hour_per_week"
                            value={form.maximum_hour_per_week}
                            min={1}
                            onChange={handleChange}
                            className="border p-1 rounded w-full max-w-[90px]"
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
                                date={`${item.timeStart} - ${item.timeEnd}`}
                            />
                        ))
                    }
                />
            </MonthlyBody>
        </MonthlyCalendar>
    )
}