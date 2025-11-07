import { useState } from 'react';
import '@zach.codes/react-calendar/dist/calendar-tailwind-no-reset.css';
import { useSchedule } from './hooks/useSchedule';
import { ScheduleCalendar } from './components/ScheduleCalendar';

function App() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  
  const { schedules, summary, createSchedule } = useSchedule()

  return (
    <div className='mx-auto max-w-5xl py-5'>
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