import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, parseISO, isToday as isTodayDate } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  CalendarEvent, 
  eventTypes, 
  priorities, 
  statuses, 
  getEventTypeColor, 
  getPriorityColor, 
  getStatusColor, 
  getEventsForDay, 
  formatEventTime, 
  formatMonthYear, 
  getCalendarDays, 
  isToday, 
  isCurrentMonth,
  getWeekDays
} from '@/lib/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  location: string;
  event_type: string;
  priority: string;
  status: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    end_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    all_day: false,
    location: '',
    event_type: 'appointment',
    priority: 'medium',
    status: 'scheduled'
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const startOfCurrentMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0), "yyyy-MM-dd'T'HH:mm");
      const endOfCurrentMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59), "yyyy-MM-dd'T'HH:mm");
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', startOfCurrentMonth)
        .lte('start_date', endOfCurrentMonth)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const eventData = {
        ...formData,
        created_by: user.id,
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast.success('Événement mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData);
        
        if (error) throw error;
        toast.success('Événement créé avec succès');
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      toast.success('Événement supprimé avec succès');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_date: format(parseISO(event.start_date), 'yyyy-MM-dd\'T\'HH:mm'),
      end_date: format(parseISO(event.end_date), 'yyyy-MM-dd\'T\'HH:mm'),
      all_day: event.all_day || false,
      location: event.location || '',
      event_type: event.event_type || 'appointment',
      priority: event.priority || 'medium',
      status: event.status || 'scheduled'
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      end_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      all_day: false,
      location: '',
      event_type: 'appointment',
      priority: 'medium',
      status: 'scheduled'
    });
  };

  const openNewEventDialog = (date?: Date) => {
    setEditingEvent(null);
    resetForm();
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      setFormData(prev => ({
        ...prev,
        start_date: `${dateStr}T09:00`,
        end_date: `${dateStr}T10:00`
      }));
    }
    setIsDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    openNewEventDialog(date);
  };

  const calendarDays = getCalendarDays(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Calendrier | UFSBD Admin</title>
        <meta name="description" content="Gestion du calendrier et des événements pour UFSBD." />
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              Calendrier
            </h1>
            <p className="text-muted-foreground">Gérez vos rendez-vous et événements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openNewEventDialog()} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Titre de l'événement"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Description de l'événement"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="start_date">Début *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="end_date">Fin *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all_day"
                    checked={formData.all_day}
                    onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked as boolean })}
                  />
                  <Label htmlFor="all_day">Toute la journée</Label>
                </div>

                <div>
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Lieu de l'événement"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="event_type">Type</Label>
                    <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", type.color)}></div>
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingEvent ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar Navigation */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <h2 className="text-xl font-semibold text-center">
                {formatMonthYear(currentDate)}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-border">
              {/* Calendar Header */}
              {getWeekDays().map(day => (
                <div key={day} className="bg-muted/50 p-3 text-center text-sm font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map(day => {
                const dayEvents = getEventsForDay(events, day);
                const isCurrentMonthDay = isCurrentMonth(day, currentDate);
                const isTodayDay = isToday(day);
                const isSelected = selectedDate && isTodayDate(day) && isTodayDate(selectedDate);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[140px] p-2 bg-background transition-colors cursor-pointer hover:bg-muted/30",
                      !isCurrentMonthDay && "text-muted-foreground bg-muted/20",
                      isTodayDay && "bg-blue-50 border-2 border-blue-200",
                      isSelected && "bg-blue-100 border-2 border-blue-300"
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-2 text-right",
                      isTodayDay && "text-blue-600 font-bold"
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs p-1.5 rounded cursor-pointer transition-all hover:scale-105",
                            getEventTypeColor(event.event_type || 'other'),
                            "text-white shadow-sm"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(event);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {!event.all_day && (
                            <div className="text-xs opacity-90">
                              {format(new Date(event.start_date.replace(' ', 'T')), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Événements du mois</h3>
            <Badge variant="outline" className="text-sm">
              {events.length} événement{events.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {events.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Aucun événement ce mois-ci</p>
                <Button onClick={() => openNewEventDialog()} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <Card key={event.id} className="hover:shadow-md transition-all duration-200 border-l-4" style={{
                  borderLeftColor: getEventTypeColor(event.event_type || 'other').replace('bg-', '').includes('blue') ? '#3b82f6' :
                                  getEventTypeColor(event.event_type || 'other').replace('bg-', '').includes('green') ? '#10b981' :
                                  getEventTypeColor(event.event_type || 'other').replace('bg-', '').includes('purple') ? '#8b5cf6' : '#6b7280'
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-lg">{event.title}</h4>
                          <Badge className={getEventTypeColor(event.event_type || 'other')}>
                            {eventTypes.find(t => t.value === event.event_type)?.label}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(event.priority || 'medium')}>
                            {priorities.find(p => p.value === event.priority)?.label}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(event.status || 'scheduled')}>
                            {statuses.find(s => s.value === event.status)?.label}
                          </Badge>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{event.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatEventTime(event)}
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(event)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 