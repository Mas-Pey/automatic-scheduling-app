import { useState } from "react"
import type { EventType, Schedule } from "../types"

export const useSchedule = () => {
    const [schedules, setSchedules] = useState<EventType[]>([])

    const createSchedule = async (params: {
        month: number
        shift_per_day: number
        open_hour: number
        hour_shift: number
        employee_per_shift: number
        maximum_hour_per_week: number
    }) => {
        try {
            const response = await fetch(
                'http://127.0.0.1:3000/create-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to create schedule")
            }

            const json = await response.json()
            console.log(json)
            const mappedSchedules: EventType[] = json.schedules.flatMap((list: Schedule) =>
                list.employees.map((emp: string) => ({
                    name: emp,
                    date: new Date(list.date),
                    timeStart: list.time_start,
                    timeEnd: list.time_end
                }))
            )
            console.log(mappedSchedules)
            setSchedules(mappedSchedules)

        } catch (error: unknown) {
            console.log(error)
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Failed to create schedules");
            }
        }
    }

    return {
        schedules,
        createSchedule
    }
}