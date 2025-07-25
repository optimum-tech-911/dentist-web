-- Create events table for calendar functionality
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  event_type TEXT DEFAULT 'appointment' CHECK (event_type IN ('appointment', 'task', 'meeting', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events table RLS policies
CREATE POLICY "Admins and authors can view all events" ON public.events
  FOR SELECT USING (
    public.get_current_user_role() IN ('admin', 'author')
  );

CREATE POLICY "Admins and authors can insert events" ON public.events
  FOR INSERT WITH CHECK (
    public.get_current_user_role() IN ('admin', 'author') AND
    auth.uid() = created_by
  );

CREATE POLICY "Admins and authors can update events" ON public.events
  FOR UPDATE USING (
    public.get_current_user_role() IN ('admin', 'author')
  );

CREATE POLICY "Admins and authors can delete events" ON public.events
  FOR DELETE USING (
    public.get_current_user_role() IN ('admin', 'author')
  );

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 