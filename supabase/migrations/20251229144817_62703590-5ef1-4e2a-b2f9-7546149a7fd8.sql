-- Create ticket replies table for threaded conversations
CREATE TABLE public.ticket_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Users can view replies on their own tickets
CREATE POLICY "Users can view replies on own tickets"
ON public.ticket_replies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = ticket_replies.ticket_id
    AND support_tickets.user_id = auth.uid()
  )
);

-- Users can create replies on their own tickets
CREATE POLICY "Users can create replies on own tickets"
ON public.ticket_replies
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = ticket_replies.ticket_id
    AND support_tickets.user_id = auth.uid()
  )
);

-- Admins can view all replies
CREATE POLICY "Admins can view all replies"
ON public.ticket_replies
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create replies on any ticket
CREATE POLICY "Admins can create replies"
ON public.ticket_replies
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete replies
CREATE POLICY "Admins can delete replies"
ON public.ticket_replies
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for ticket replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_replies;