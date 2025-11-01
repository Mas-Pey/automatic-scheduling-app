import { useState } from "react"
import type { Employee } from "../types"

interface EmployeeListProps {
    employees: Employee[]
    show: boolean
    onHide: () => void
    onUpdate: (id: number, name: string) => Promise<void>
    onAdd: (name: string) => Promise<void>
    onDelete: (id: number) => Promise<void>
}

export const EmployeeList = ({
    employees,
    show,
    onHide,
    onUpdate,
    onAdd,
    onDelete
}: EmployeeListProps) => {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [nameInput, setNameInput] = useState("")
    const [adding, setAdding] = useState(false)
    const [newName, setNewName] = useState("")

    if (!show) return null

    return (
        <div className="mt-4">
            <h2 className="font-bold mb-2">Employee List:</h2>

            <div className="flex items-center space-x-3 mb-3 max-w-3xs">
                {adding ? (
                    <>
                        <input
                            onChange={(e) => setNewName(e.target.value)}
                            value={newName}
                            placeholder="New employee name"
                            className="border rounded p-1 flex-1"
                        />
                        <button
                            onClick={async () => {
                                const trimmed = newName.trim()
                                if (!trimmed) {
                                    alert("Name cannot be empty")
                                    return
                                }
                                try {
                                    await onAdd(trimmed)
                                    setNewName("")
                                    setAdding(false)
                                } catch (error) {
                                    console.error(error)
                                    alert("Failed to add employee")
                                }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => {
                                setNewName("")
                                setAdding(false)
                            }}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setAdding(true)}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Add Employee
                    </button>
                )}
            </div>

            <ul className="space-y-3">
                {employees.map(emp => (
                    <li key={emp.id} className="flex items-center space-x-3 max-w-2xs">
                        {editingId === emp.id ? (
                            <>
                                <input
                                    onChange={(e) => setNameInput(e.target.value)}
                                    value={nameInput}
                                    className="border rounded p-1">
                                </input>
                                <button
                                    onClick={async () => {
                                        const trimmed = nameInput.trim()
                                        if (!trimmed) {
                                            alert("Name cannot be empty")
                                            return
                                        }
                                        try {
                                            await onUpdate(emp.id, trimmed)
                                            setEditingId(null)
                                        } catch (error) {
                                            console.error(error)
                                            alert("Failed to edit employee")
                                        }
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 truncate">
                                    {emp.name}
                                </span>

                                <button
                                    onClick={() => {
                                        setEditingId(emp.id);
                                        setNameInput(emp.name);
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={async () => {
                                        const confirmation = confirm(`Are you sure you want to delete ${emp.name}?`)
                                        if (!confirmation) return
                                        
                                        try {
                                            await onDelete(emp.id)
                                        } catch (error) {
                                            console.error(error)
                                            alert('Failed to delete employee')
                                        }
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-blue-600"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <button
                onClick={onHide}
                className='mt-2 p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
            >
                Hide Employees
            </button>

        </div>
    )
}