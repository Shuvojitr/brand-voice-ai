import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if request is POST with body (for update-user)
    let bodyAction = null;
    let body: any = null;
    if (req.method === 'POST') {
      body = await req.json();
      bodyAction = body.action;
    }

    const url = new URL(req.url);
    const action = bodyAction || url.searchParams.get('action');

    // Handle different admin actions
    switch (action) {
      case 'stats': {
        // Get total users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total words generated (all time)
        const { data: wordsData } = await supabase
          .from('documents')
          .select('initial_word_count');

        const totalWords = wordsData?.reduce((sum, doc) => sum + (doc.initial_word_count || 0), 0) || 0;

        // Get total documents count
        const { count: docsCount } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true });

        // Get total organizations
        const { count: orgsCount } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true });

        return new Response(JSON.stringify({
          totalUsers: usersCount || 0,
          totalWords: totalWords,
          totalDocuments: docsCount || 0,
          totalOrganizations: orgsCount || 0,
          totalRevenue: 0, // Would come from Stripe integration
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'recent-signups': {
        const limit = parseInt(url.searchParams.get('limit') || '10');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'all-users': {
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at, is_banned')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Get user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role');

        // Get organization memberships with credits
        const { data: memberships } = await supabase
          .from('organization_members')
          .select(`
            user_id,
            organizations (
              id,
              monthly_credits,
              credits_used
            )
          `);

        // Combine data
        const users = profiles?.map(profile => {
          const userRole = roles?.find(r => r.user_id === profile.id);
          const membership = memberships?.find(m => m.user_id === profile.id);
          const org = membership?.organizations as any;
          
          return {
            ...profile,
            role: userRole?.role || 'user',
            credits_remaining: org ? (org.monthly_credits - org.credits_used) : 0,
            organization_id: org?.id,
          };
        }) || [];

        return new Response(JSON.stringify(users), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-user': {
        if (!body) {
          return new Response(JSON.stringify({ error: 'Request body required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { userId, fullName, email, role, creditsToAdd, isBanned, organizationId } = body;

        if (!userId) {
          return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update profile (full_name)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: fullName,
            is_banned: isBanned,
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw new Error(`Failed to update profile: ${profileError.message}`);
        }

        // Update email in auth (if changed)
        const { data: currentUser } = await supabase.auth.admin.getUserById(userId);
        if (currentUser?.user?.email !== email && email) {
          const { error: emailError } = await supabase.auth.admin.updateUserById(userId, {
            email: email,
          });
          if (emailError) {
            console.error('Email update error:', emailError);
            // Don't throw, just log - email updates can fail due to various reasons
          } else {
            // Also update email in profiles table
            await supabase.from('profiles').update({ email }).eq('id', userId);
          }
        }

        // Handle role change
        if (role === 'admin') {
          // Check if already admin
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .single();

          if (!existingRole) {
            // Add admin role
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({ user_id: userId, role: 'admin' });
            
            if (roleError && !roleError.message.includes('duplicate')) {
              console.error('Role insert error:', roleError);
            }
          }
        } else if (role === 'user') {
          // Remove admin role if exists
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', 'admin');
        }

        // Add credits if specified
        if (creditsToAdd && creditsToAdd > 0 && organizationId) {
          const { data: org, error: orgFetchError } = await supabase
            .from('organizations')
            .select('monthly_credits')
            .eq('id', organizationId)
            .single();

          if (!orgFetchError && org) {
            const { error: creditsError } = await supabase
              .from('organizations')
              .update({ 
                monthly_credits: (org.monthly_credits || 0) + creditsToAdd 
              })
              .eq('id', organizationId);

            if (creditsError) {
              console.error('Credits update error:', creditsError);
            }
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('[admin-stats] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
