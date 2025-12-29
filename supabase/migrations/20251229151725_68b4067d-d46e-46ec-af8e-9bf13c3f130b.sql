-- Create table for live chat sessions
CREATE TABLE public.live_chats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name text NOT NULL,
    user_email text NOT NULL,
    status text NOT NULL DEFAULT 'waiting', -- waiting, active, ended
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    ended_at timestamp with time zone
);

-- Create table for live chat messages
CREATE TABLE public.live_chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id uuid NOT NULL REFERENCES public.live_chats(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    message text NOT NULL,
    is_admin_message boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_chats
CREATE POLICY "Users can create live chats" ON public.live_chats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chats" ON public.live_chats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chats" ON public.live_chats
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all chats" ON public.live_chats
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own chats" ON public.live_chats
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for live_chat_messages
CREATE POLICY "Users can create messages in own chats" ON public.live_chat_messages
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id) AND 
        EXISTS (SELECT 1 FROM public.live_chats WHERE id = chat_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can create messages" ON public.live_chat_messages
    FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view messages in own chats" ON public.live_chat_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.live_chats WHERE id = chat_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can view all messages" ON public.live_chat_messages
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;

-- Create index for performance
CREATE INDEX idx_live_chats_user_id ON public.live_chats(user_id);
CREATE INDEX idx_live_chats_status ON public.live_chats(status);
CREATE INDEX idx_live_chat_messages_chat_id ON public.live_chat_messages(chat_id);