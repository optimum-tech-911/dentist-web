import { format, parseISO, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isToday as isTodayDate } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  all_day: boolean | null;
  location: string | null;
  event_type: string | null;
  priority: string | null;
  status: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const eventTypes = [
  { value: 'appointment', label: 'Rendez-vous', color: 'bg-blue-500', icon: '🏥' },
  { value: 'task', label: 'Tâche', color: 'bg-green-500', icon: '✅' },
  { value: 'meeting', label: 'Réunion', color: 'bg-purple-500', icon: '👥' },
  { value: 'other', label: 'Autre', color: 'bg-gray-500', icon: '📅' }
];

export const priorities = [
  { value: 'low', label: 'Faible', color: 'bg-green-100 text-green-800', icon: '🟢' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  { value: 'high', label: 'Élevée', color: 'bg-red-100 text-red-800', icon: '🔴' }
];

export const statuses = [
  { value: 'scheduled', label: 'Programmé', color: 'bg-blue-100 text-blue-800', icon: '⏰' },
  { value: 'completed', label: 'Terminé', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-800', icon: '❌' }
];

export const getEventTypeColor = (eventType: string) => {
  const type = eventTypes.find(t => t.value === eventType);
  return type?.color || 'bg-gray-500';
};

export const getEventTypeIcon = (eventType: string) => {
  const type = eventTypes.find(t => t.value === eventType);
  return type?.icon || '📅';
};

export const getPriorityColor = (priority: string) => {
  const pri = priorities.find(p => p.value === priority);
  return pri?.color || 'bg-gray-100 text-gray-800';
};

export const getPriorityIcon = (priority: string) => {
  const pri = priorities.find(p => p.value === priority);
  return pri?.icon || '⚪';
};

export const getStatusColor = (status: string) => {
  const stat = statuses.find(s => s.value === status);
  return stat?.color || 'bg-gray-100 text-gray-800';
};

export const getStatusIcon = (status: string) => {
  const stat = statuses.find(s => s.value === status);
  return stat?.icon || '⏰';
};

export const getEventsForDay = (events: CalendarEvent[], date: Date) => {
  return events.filter(event => isSameDay(new Date(event.start_date.replace(' ', 'T')), date));
};

export const formatEventTime = (event: CalendarEvent) => {
  if (event.all_day) {
    return 'Toute la journée';
  }
  const startTime = format(new Date(event.start_date.replace(' ', 'T')), 'HH:mm');
  const endTime = format(new Date(event.end_date.replace(' ', 'T')), 'HH:mm');
  const startDate = format(new Date(event.start_date.replace(' ', 'T')), 'dd/MM/yyyy');
  return `${startDate} ${startTime} - ${endTime}`;
};

export const formatEventTimeShort = (event: CalendarEvent) => {
  if (event.all_day) {
    return 'Toute la journée';
  }
  const startTime = format(new Date(event.start_date.replace(' ', 'T')), 'HH:mm');
  const endTime = format(new Date(event.end_date.replace(' ', 'T')), 'HH:mm');
  return `${startTime} - ${endTime}`;
};

export const formatMonthYear = (date: Date) => {
  return format(date, 'MMMM yyyy', { locale: fr });
};

export const formatDayName = (date: Date) => {
  return format(date, 'EEEE', { locale: fr });
};

export const getCalendarDays = (date: Date) => {
  // Start of the month
  const start = startOfMonth(date);
  // End of the month
  const end = endOfMonth(date);

  // Find the Monday before or on the first day of the month
  const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1; // 0 (Sunday) -> 6, 1 (Monday) -> 0, etc.
  const calendarStart = addDays(start, -startDay);

  // Find the Sunday after or on the last day of the month
  const endDay = end.getDay() === 0 ? 6 : end.getDay() - 1;
  const calendarEnd = addDays(end, 6 - endDay);

  return eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });
};

export const isToday = (date: Date) => {
  return isTodayDate(date);
};

export const isCurrentMonth = (date: Date, currentDate: Date) => {
  return isSameMonth(date, currentDate);
};

export const getWeekDays = () => {
  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
};

export const getEventDuration = (event: CalendarEvent) => {
  if (event.all_day) {
    return 'Toute la journée';
  }
  const start = new Date(event.start_date.replace(' ', 'T'));
  const end = new Date(event.end_date.replace(' ', 'T'));
  const diffInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
};

export const getUpcomingEvents = (events: CalendarEvent[], days: number = 7) => {
  const now = new Date();
  const futureDate = addDays(now, days);
  return events
    .filter(event => {
      const eventDate = new Date(event.start_date.replace(' ', 'T'));
      return eventDate >= now && eventDate <= futureDate;
    })
    .sort((a, b) => new Date(a.start_date.replace(' ', 'T')).getTime() - new Date(b.start_date.replace(' ', 'T')).getTime());
};

export const getEventsByType = (events: CalendarEvent[]) => {
  const grouped = events.reduce((acc, event) => {
    const type = event.event_type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  return grouped;
}; 