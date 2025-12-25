-- Allow admins to view all API keys
CREATE POLICY "Admins can view all API keys"
ON public.api_keys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update API keys (for revoking)
CREATE POLICY "Admins can update all API keys"
ON public.api_keys
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));