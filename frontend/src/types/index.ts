export interface Employee {
  id: number;
  name: string;
}

export interface Schedule {
  date: string;
  employees: string[];
  time_start: string;
  time_end: string;
}

export interface EventType {
  name: string;
  date: Date;
  timeStart: string;
  timeEnd: string;
}

export interface ScheduleParams {
  month: number;
  shift_per_day: number;
  open_hour: number;
  hour_shift: number;
  employee_per_shift: number;
  maximum_hour_per_week: number;
}