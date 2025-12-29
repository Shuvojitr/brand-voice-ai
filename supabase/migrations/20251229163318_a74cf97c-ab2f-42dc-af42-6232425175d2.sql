-- Update RLS policies for support_tickets to allow managers
CREATE POLICY "Managers can view all tickets" 
ON public.support_tickets 
FOR SELECT 
USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can update all tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (has_role(auth.uid(), 'manager'::app_role));

-- Update RLS policies for live_chats to allow managers
CREATE POLICY "Managers can view all chats" 
ON public.live_chats 
FOR SELECT 
USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can update all chats" 
ON public.live_chats 
FOR UPDATE 
USING (has_role(auth.uid(), 'manager'::app_role));

-- Update RLS policies for live_chat_messages to allow managers
CREATE POLICY "Managers can view all messages" 
ON public.live_chat_messages 
FOR SELECT 
USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can create messages" 
ON public.live_chat_messages 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

-- Update RLS policies for ticket_replies to allow managers
CREATE POLICY "Managers can view all replies" 
ON public.ticket_replies 
FOR SELECT 
USING (has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can create replies" 
ON public.ticket_replies 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

-- Update RLS policies for live_chat_settings to allow managers to manage
CREATE POLICY "Managers can manage live chat settings" 
ON public.live_chat_settings 
FOR ALL 
USING (has_role(auth.uid(), 'manager'::app_role));