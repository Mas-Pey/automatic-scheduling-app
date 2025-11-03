import { useState } from "react"
import type { EventType, Schedule, ScheduleParams, ScheduleSummary } from "../types"

export const useSchedule = () => {
    const [schedules, setSchedules] = useState<EventType[]>([])
    const [summary, setSummary] = useState<ScheduleSummary | null>(null)

    const createSchedule = async (params: ScheduleParams) => {
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
            setSummary(json.summary)

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
        summary,
        createSchedule
    }
}