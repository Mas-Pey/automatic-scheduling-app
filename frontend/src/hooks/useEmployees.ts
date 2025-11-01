import { useState } from "react"
import type { Employee } from "../types"

export const useEmployees = () => {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [showList, setShowList] = useState(false)

    const fetchEmployees = async () => {
        try {
            const response = await fetch(
                'http://127.0.0.1:3000/employees',
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to fetch employees")
            }

            const json = await response.json()
            setEmployees(json.employees)
            setShowList(true)

        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message)
            } else {
                alert('Failed to fetch employees')
            }
        }
    }

    const updateEmployee = async (id: number, name: string) => {
        try {
            const response = await fetch(
                `http://127.0.0.1:3000/employee/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name })
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to edit employee')
            }

            const json = await response.json()
            const updated = json.employee

            setEmployees(prev =>
                prev.map(e => (e.id) === updated.id ? updated : e)
            )

        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message)
            } else {
                alert('Failed to edit employee')
            }
            throw error
        }
    }

    const addEmployee = async (name: string) => {
        try {
            const response = await fetch(
                'http://127.0.0.1:3000/employee', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name })
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to add employee')
            }

            const json = await response.json()
            const newEmployee = {
                id: json.employee.id,
                name: json.employee.name
            }

            setEmployees(prev => [...prev, newEmployee])
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message)
            } else {
                alert('Failed to add employee')
            }
        } 
    }

    const deleteEmployee = async (id: number) => {
        try {
            const response = await fetch(
                `http://127.0.0.1:3000/employee/${id}`, {
                    method: 'DELETE'
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to delete employee')
            }

            setEmployees(prev => prev.filter(e => e.id !== id))
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message)
            } else {
                alert('Failed to delete employee')
            }
        }
    }

    return {
        employees,
        showList,
        fetchEmployees,
        setShowList,
        updateEmployee,
        addEmployee,
        deleteEmployee
    }
}