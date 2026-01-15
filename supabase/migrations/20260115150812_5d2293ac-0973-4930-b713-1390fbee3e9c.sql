-- Add RLS policies for managers to manage template categories
CREATE POLICY "Managers can manage template categories" 
ON public.template_categories 
FOR ALL 
USING (has_role(auth.uid(), 'manager'::app_role));

-- Add RLS policies for managers to manage template icons
CREATE POLICY "Managers can manage template icons" 
ON public.template_icons 
FOR ALL 
USING (has_role(auth.uid(), 'manager'::app_role));