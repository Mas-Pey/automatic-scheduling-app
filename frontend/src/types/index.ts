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