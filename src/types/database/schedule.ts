export interface TimeSlot {
  /** HH:MM format (24-hour) */
  startTime: string;
  /** HH:MM format (24-hour) */
  endTime: string;
}

export interface DaySchedule {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  timeSlots: TimeSlot[];
}

export interface GuildScheduleConfig {
  guildId: string;
  utcOffset: number;
  schedule: DaySchedule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
