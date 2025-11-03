import { useState } from 'react';
import '@zach.codes/react-calendar/dist/calendar-tailwind-no-reset.css';
import { useEmployees } from './hooks/useEmployees';
import { useSchedule } from './hooks/useSchedule';
import { EmployeeList } from './components/EmployeeList';
import { ScheduleCalendar } from './components/ScheduleCalendar';

function App() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const {
    employees,
    showList,
    fetchEmployees,
    setShowList,
    updateEmployee,
    addEmployee,
    deleteEmployee
  } = useEmployees()
  const { schedules, summary, createSchedule } = useSchedule()

  return (
    <div className='mx-auto max-w-5xl py-4'>
      <button
        onClick={fetchEmployees}
        className='p-2 bg-amber-600 text-white text-md rounded-md hover:bg-amber-700'
      >
        Load Employees
      </button>

      <EmployeeList
        employees={employees}
        show={showList}
        onHide={() => setShowList(false)}
        onUpdate={updateEmployee}
        onAdd={addEmployee}
        onDelete={deleteEmployee}
      />

      <ScheduleCalendar
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        schedules={schedules}
        onGenerate={createSchedule}
        summary={summary}
      />
    </div>
  );
}

export default App