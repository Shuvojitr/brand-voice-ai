import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to log admin activity
async function logAdminActivity(
  supabaseAdmin: any,
  adminUserId: string,
  action: string,
  targetUserId?: string,
  targetOrganizationId?: string,
  details?: Record<string, any>,
  ipAddress?: string
) {
  try {
    await supabaseAdmin.from("admin_activity_logs").insert({
      admin_user_id: adminUserId,
      action,
      target_user_id: targetUserId || null,
      target_organization_id: targetOrganizationId || null,
      details: details || {},
      ip_address: ipAddress || null,
    });
    console.log(`Activity logged: ${action} by admin ${adminUserId}`);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create client with service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "stats";
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || undefined;

    // Handle POST requests for mutations
    if (req.method === "POST") {
      const body = await req.json();

      if (action === "toggle-ban") {
        const { userId, isBanned } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get target user email for logging
        const { data: targetProfile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .maybeSingle();

        // Update profile ban status
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ is_banned: isBanned })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating ban status:", updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Also ban/unban at auth level
        try {
          if (isBanned) {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              ban_duration: "876000h" // ~100 years
            });
          } else {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              ban_duration: "none"
            });
          }
        } catch (authErr) {
          console.error("Auth ban update failed (non-critical):", authErr);
        }

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          isBanned ? "user_banned" : "user_unbanned",
          userId,
          undefined,
          { target_email: targetProfile?.email },
          clientIp
        );

        return new Response(JSON.stringify({ success: true, is_banned: isBanned }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "update-credits") {
        const { organizationId, amount, mode } = body;
        if (!organizationId || amount === undefined) {
          return new Response(JSON.stringify({ error: "organizationId and amount are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get current credits
        const { data: org, error: fetchError } = await supabaseAdmin
          .from("organizations")
          .select("monthly_credits, credits_used, name")
          .eq("id", organizationId)
          .single();

        if (fetchError || !org) {
          return new Response(JSON.stringify({ error: "Organization not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const previousCredits = org.monthly_credits || 0;
        let newCredits = previousCredits;
        const parsedAmount = parseInt(amount);

        if (mode === "add") {
          newCredits = newCredits + parsedAmount;
        } else if (mode === "deduct") {
          newCredits = Math.max(0, newCredits - parsedAmount);
        } else if (mode === "set") {
          newCredits = Math.max(0, parsedAmount);
        } else {
          // Default: if positive add, if negative subtract
          newCredits = Math.max(0, newCredits + parsedAmount);
        }

        const { error: updateError } = await supabaseAdmin
          .from("organizations")
          .update({ monthly_credits: newCredits })
          .eq("id", organizationId);

        if (updateError) {
          console.error("Error updating credits:", updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "credits_updated",
          undefined,
          organizationId,
          { 
            mode, 
            amount: parsedAmount, 
            previous_credits: previousCredits, 
            new_credits: newCredits,
            organization_name: org.name
          },
          clientIp
        );

        return new Response(JSON.stringify({ 
          success: true, 
          monthly_credits: newCredits,
          credits_remaining: newCredits - (org.credits_used || 0)
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "update-plan") {
        const { organizationId, plan } = body;
        const validPlans = ["free", "starter", "pro", "enterprise"];
        
        if (!organizationId || !plan) {
          return new Response(JSON.stringify({ error: "organizationId and plan are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (!validPlans.includes(plan)) {
          return new Response(JSON.stringify({ error: "Invalid plan. Must be one of: free, starter, pro, enterprise" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get plan credits from database
        const { data: planData, error: planError } = await supabaseAdmin
          .from("plans")
          .select("credits")
          .eq("slug", plan)
          .maybeSingle();

        // Fallback credits if plan not found in DB
        const defaultPlanCredits: Record<string, number> = {
          free: 1000,
          starter: 5000,
          pro: 20000,
          enterprise: 100000,
        };

        const newPlanCredits = planData?.credits ?? defaultPlanCredits[plan];

        // Get current organization credits
        const { data: org, error: orgError } = await supabaseAdmin
          .from("organizations")
          .select("monthly_credits, credits_used, subscription_tier, subscription_ends_at, name")
          .eq("id", organizationId)
          .single();

        if (orgError || !org) {
          return new Response(JSON.stringify({ error: "Organization not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const previousPlan = org.subscription_tier;

        // Calculate remaining credits and add new plan credits
        const remainingCredits = Math.max(0, (org.monthly_credits || 0) - (org.credits_used || 0));
        const newMonthlyCredits = remainingCredits + newPlanCredits;

        // Calculate new subscription end date (1 month from now, or extend if already active)
        const now = new Date();
        const oneMonthMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        let newSubscriptionEndsAt: Date;
        
        // If subscription is currently active and not expired, extend from current end date
        if (org.subscription_ends_at && new Date(org.subscription_ends_at) > now) {
          newSubscriptionEndsAt = new Date(new Date(org.subscription_ends_at).getTime() + oneMonthMs);
        } else {
          // Otherwise, start fresh from now
          newSubscriptionEndsAt = new Date(now.getTime() + oneMonthMs);
        }

        const { error: updateError } = await supabaseAdmin
          .from("organizations")
          .update({ 
            subscription_tier: plan,
            subscription_status: "active",
            monthly_credits: newMonthlyCredits,
            credits_used: 0, // Reset credits used since remaining are now in monthly_credits
            subscription_ends_at: newSubscriptionEndsAt.toISOString(),
          })
          .eq("id", organizationId);

        if (updateError) {
          console.error("Error updating plan:", updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Plan updated for org ${organizationId}: ${plan} with ${newPlanCredits} new credits (total: ${newMonthlyCredits})`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "plan_updated",
          undefined,
          organizationId,
          { 
            previous_plan: previousPlan, 
            new_plan: plan, 
            added_credits: newPlanCredits,
            organization_name: org.name
          },
          clientIp
        );

        return new Response(JSON.stringify({ 
          success: true, 
          subscription_tier: plan,
          monthly_credits: newMonthlyCredits,
          added_credits: newPlanCredits,
          subscription_ends_at: newSubscriptionEndsAt.toISOString(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "verify-user") {
        const { userId } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get target user email for logging
        const { data: targetProfile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .maybeSingle();

        // Manually verify user's email using admin API
        const { error: verifyError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });

        if (verifyError) {
          console.error("Error verifying user:", verifyError);
          return new Response(JSON.stringify({ error: verifyError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`User ${userId} email manually verified by admin ${user.id}`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "user_verified",
          userId,
          undefined,
          { target_email: targetProfile?.email },
          clientIp
        );

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "update-role") {
        const { userId, role } = body;
        const validRoles = ["user", "admin", "manager"];
        
        if (!userId || !role) {
          return new Response(JSON.stringify({ error: "userId and role are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (!validRoles.includes(role)) {
          return new Response(JSON.stringify({ error: "Invalid role. Must be 'user', 'manager', or 'admin'" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get target user info for logging
        const { data: targetProfile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .maybeSingle();

        // Check if user already has a role entry
        const { data: existingRole } = await supabaseAdmin
          .from("user_roles")
          .select("id, role")
          .eq("user_id", userId)
          .maybeSingle();

        const previousRole = existingRole?.role || "user";

        if (existingRole) {
          // Update existing role
          const { error: updateError } = await supabaseAdmin
            .from("user_roles")
            .update({ role })
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating role:", updateError);
            return new Response(JSON.stringify({ error: updateError.message }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          // Insert new role
          const { error: insertError } = await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: userId, role });

          if (insertError) {
            console.error("Error inserting role:", insertError);
            return new Response(JSON.stringify({ error: insertError.message }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        console.log(`User ${userId} role updated to ${role} by admin ${user.id}`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "role_updated",
          userId,
          undefined,
          { 
            previous_role: previousRole, 
            new_role: role,
            target_email: targetProfile?.email
          },
          clientIp
        );

        return new Response(JSON.stringify({ success: true, role }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "update-subscription-period") {
        const { organizationId, days, mode } = body;
        
        if (!organizationId || days === undefined) {
          return new Response(JSON.stringify({ error: "organizationId and days are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const parsedDays = parseInt(days);
        if (isNaN(parsedDays) || parsedDays < 0) {
          return new Response(JSON.stringify({ error: "days must be a valid non-negative number" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get current organization data
        const { data: org, error: orgError } = await supabaseAdmin
          .from("organizations")
          .select("subscription_ends_at, subscription_tier, subscription_status, name")
          .eq("id", organizationId)
          .single();

        if (orgError || !org) {
          return new Response(JSON.stringify({ error: "Organization not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const previousEndDate = org.subscription_ends_at;
        let newEndDate: Date;
        
        if (mode === "extend") {
          // If no current end date, start from now
          const baseDate = org.subscription_ends_at ? new Date(org.subscription_ends_at) : new Date();
          newEndDate = new Date(baseDate.getTime() + parsedDays * 24 * 60 * 60 * 1000);
        } else if (mode === "reduce") {
          if (!org.subscription_ends_at) {
            return new Response(JSON.stringify({ error: "Cannot reduce period: No subscription end date set" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          const baseDate = new Date(org.subscription_ends_at);
          newEndDate = new Date(baseDate.getTime() - parsedDays * 24 * 60 * 60 * 1000);
          // Don't allow setting date in the past
          if (newEndDate < new Date()) {
            newEndDate = new Date(); // Set to now, will trigger expiration
          }
        } else if (mode === "set") {
          // Set to a specific number of days from now
          newEndDate = new Date(Date.now() + parsedDays * 24 * 60 * 60 * 1000);
        } else {
          return new Response(JSON.stringify({ error: "Invalid mode. Must be 'extend', 'reduce', or 'set'" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update the subscription end date and ensure status is active
        const { error: updateError } = await supabaseAdmin
          .from("organizations")
          .update({ 
            subscription_ends_at: newEndDate.toISOString(),
            subscription_status: "active",
            updated_at: new Date().toISOString()
          })
          .eq("id", organizationId);

        if (updateError) {
          console.error("Error updating subscription period:", updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Subscription period updated for org ${organizationId}: ${mode} ${parsedDays} days`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "subscription_period_updated",
          undefined,
          organizationId,
          { 
            mode,
            days: parsedDays,
            previous_end_date: previousEndDate,
            new_end_date: newEndDate.toISOString(),
            organization_name: org.name
          },
          clientIp
        );

        return new Response(JSON.stringify({ 
          success: true, 
          subscription_ends_at: newEndDate.toISOString(),
          mode,
          days_changed: parsedDays
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "impersonate-user") {
        const { userId } = body;
        
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get target user info for logging
        const { data: targetProfile } = await supabaseAdmin
          .from("profiles")
          .select("email, is_banned")
          .eq("id", userId)
          .maybeSingle();

        if (!targetProfile) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (targetProfile.is_banned) {
          return new Response(JSON.stringify({ error: "Cannot impersonate a banned user" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate a magic link for the target user
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: targetProfile.email,
          options: {
            redirectTo: `${req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:5173"}/dashboard`,
          },
        });

        if (linkError || !linkData) {
          console.error("Error generating impersonation link:", linkError);
          return new Response(JSON.stringify({ error: linkError?.message || "Failed to generate login link" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Admin ${user.id} generated impersonation link for user ${userId}`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "user_impersonated",
          userId,
          undefined,
          { target_email: targetProfile.email },
          clientIp
        );

        // Return the hashed token from the link so client can use verifyOtp
        const tokenHash = linkData.properties?.hashed_token;
        
        return new Response(JSON.stringify({ 
          success: true, 
          token_hash: tokenHash,
          email: targetProfile.email,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Invite user - sends invite email
      if (action === "invite-user") {
        const { email, fullName } = body;
        
        if (!email) {
          return new Response(JSON.stringify({ error: "email is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: "Invalid email format" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          return new Response(JSON.stringify({ error: "A user with this email already exists" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const redirectUrl = `${req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:5173"}/auth`;

        // Use inviteUserByEmail which actually sends the invitation email
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          email,
          {
            redirectTo: redirectUrl,
            data: {
              full_name: fullName || null,
            },
          }
        );

        if (inviteError) {
          console.error("Error sending invite email:", inviteError);
          return new Response(JSON.stringify({ error: inviteError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Admin ${user.id} invited user ${email} - invitation email sent`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "user_invited",
          inviteData.user?.id,
          undefined,
          { invited_email: email, full_name: fullName },
          clientIp
        );

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Invitation email sent to ${email}`,
          userId: inviteData.user?.id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Resend invitation email to a user who hasn't completed registration
      if (action === "resend-invite") {
        const { userId, email } = body;
        
        if (!userId && !email) {
          return new Response(JSON.stringify({ error: "userId or email is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Find the user
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
        const targetUser = authData?.users?.find(u => 
          userId ? u.id === userId : u.email?.toLowerCase() === email?.toLowerCase()
        );

        if (!targetUser) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user has already confirmed their email
        if (targetUser.email_confirmed_at) {
          return new Response(JSON.stringify({ error: "User has already confirmed their email" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const redirectUrl = `${req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:5173"}/auth`;

        // Resend the invitation using inviteUserByEmail
        // This will resend the invite email to an existing unconfirmed user
        const { data: resendData, error: resendError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          targetUser.email!,
          {
            redirectTo: redirectUrl,
            data: targetUser.user_metadata,
          }
        );

        if (resendError) {
          console.error("Error resending invite email:", resendError);
          return new Response(JSON.stringify({ error: resendError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Admin ${user.id} resent invitation to ${targetUser.email}`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "invite_resent",
          targetUser.id,
          undefined,
          { target_email: targetUser.email },
          clientIp
        );

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Invitation email resent to ${targetUser.email}`,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create user directly with password
      if (action === "create-user") {
        const { email, password, fullName } = body;
        
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "email and password are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: "Invalid email format" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate password strength
        if (password.length < 6) {
          return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          return new Response(JSON.stringify({ error: "A user with this email already exists" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create the user with admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm the email
          user_metadata: {
            full_name: fullName || null,
          },
        });

        if (createError) {
          console.error("Error creating user:", createError);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Admin ${user.id} created user ${email}`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "user_created",
          newUser.user?.id,
          undefined,
          { created_email: email, full_name: fullName },
          clientIp
        );

        return new Response(JSON.stringify({ 
          success: true, 
          message: `User ${email} created successfully`,
          userId: newUser.user?.id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete user permanently
      if (action === "delete-user") {
        const { userId } = body;
        
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Prevent self-deletion
        if (userId === user.id) {
          return new Response(JSON.stringify({ error: "You cannot delete your own account" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get target user info before deletion for logging
        const { data: targetProfile } = await supabaseAdmin
          .from("profiles")
          .select("email, full_name")
          .eq("id", userId)
          .maybeSingle();

        // Check if target user is also an admin
        const { data: targetRole } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (targetRole) {
          return new Response(JSON.stringify({ error: "Cannot delete another admin. Please remove their admin role first." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete from auth (this will cascade to profiles if set up correctly)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error("Error deleting user:", deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`Admin ${user.id} permanently deleted user ${userId} (${targetProfile?.email})`);

        // Log the activity
        await logAdminActivity(
          supabaseAdmin,
          user.id,
          "user_deleted",
          userId,
          undefined,
          { deleted_email: targetProfile?.email, deleted_name: targetProfile?.full_name },
          clientIp
        );

        return new Response(JSON.stringify({ 
          success: true, 
          message: `User ${targetProfile?.email || userId} has been permanently deleted`,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // GET requests for fetching data
    if (action === "stats") {
      // Get total users count
      const { count: usersCount } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get users from last month for growth calculation
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const { count: lastMonthUsers } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .lt("created_at", lastMonthDate.toISOString());

      // Get total words generated
      const { data: wordsData } = await supabaseAdmin
        .from("documents")
        .select("initial_word_count");

      const totalWords = wordsData?.reduce((sum, doc) => sum + (doc.initial_word_count || 0), 0) || 0;

      // Get total documents count
      const { count: docsCount } = await supabaseAdmin
        .from("documents")
        .select("*", { count: "exact", head: true });

      // Get total organizations
      const { count: orgsCount } = await supabaseAdmin
        .from("organizations")
        .select("*", { count: "exact", head: true });

      // Get active subscriptions breakdown
      const { data: orgsData } = await supabaseAdmin
        .from("organizations")
        .select("subscription_tier, subscription_status");

      const activeSubscriptions = orgsData?.filter(o => o.subscription_status === "active") || [];
      const proCount = activeSubscriptions.filter(o => o.subscription_tier === "pro" || o.subscription_tier === "enterprise").length;
      const starterCount = activeSubscriptions.filter(o => o.subscription_tier === "starter").length;
      const freeCount = activeSubscriptions.filter(o => o.subscription_tier === "free" || !o.subscription_tier).length;

      // Calculate MRR from active subscriptions with plan prices
      const { data: plansData } = await supabaseAdmin
        .from("plans")
        .select("slug, price");

      const planPrices: Record<string, number> = {};
      plansData?.forEach(p => { planPrices[p.slug] = Number(p.price) || 0; });

      let totalMRR = 0;
      activeSubscriptions.forEach(org => {
        if (org.subscription_tier && planPrices[org.subscription_tier]) {
          totalMRR += planPrices[org.subscription_tier];
        }
      });

      // Calculate user growth percentage
      const currentUsers = usersCount || 0;
      const previousUsers = lastMonthUsers || 0;
      const userGrowth = previousUsers > 0 
        ? Math.round(((currentUsers - previousUsers) / previousUsers) * 100) 
        : currentUsers > 0 ? 100 : 0;

      return new Response(JSON.stringify({
        totalUsers: usersCount || 0,
        totalWords: totalWords,
        totalDocuments: docsCount || 0,
        totalOrganizations: orgsCount || 0,
        totalMRR: totalMRR,
        userGrowth: userGrowth,
        activeSubscriptions: activeSubscriptions.length,
        proSubscriptions: proCount,
        starterSubscriptions: starterCount,
        freeSubscriptions: freeCount,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Revenue chart data - last 6 months
    if (action === "revenue-chart") {
      const { data: orgsData } = await supabaseAdmin
        .from("organizations")
        .select("subscription_tier, subscription_status, created_at, updated_at");

      const { data: plansData } = await supabaseAdmin
        .from("plans")
        .select("slug, price");

      const planPrices: Record<string, number> = {};
      plansData?.forEach(p => { planPrices[p.slug] = Number(p.price) || 0; });

      // Generate last 6 months data
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        
        // Calculate MRR for this month (simplified: count active orgs at that time)
        // For demo, we'll show increasing trend based on org creation dates
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const activeOrgsInMonth = orgsData?.filter(org => {
          const createdAt = new Date(org.created_at);
          return createdAt <= monthEnd && org.subscription_status === "active";
        }) || [];

        let monthlyMRR = 0;
        activeOrgsInMonth.forEach(org => {
          if (org.subscription_tier && planPrices[org.subscription_tier]) {
            monthlyMRR += planPrices[org.subscription_tier];
          }
        });

        months.push({
          month: monthKey,
          revenue: monthlyMRR,
        });
      }

      return new Response(JSON.stringify(months), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Usage chart data - last 7 days words generated
    if (action === "usage-chart") {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const { data: docsData } = await supabaseAdmin
          .from("documents")
          .select("initial_word_count")
          .gte("created_at", dayStart.toISOString())
          .lt("created_at", dayEnd.toISOString());

        const wordsGenerated = docsData?.reduce((sum, doc) => sum + (doc.initial_word_count || 0), 0) || 0;

        days.push({
          day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          words: wordsGenerated,
        });
      }

      return new Response(JSON.stringify(days), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Live activity feed - recent content generations and signups
    if (action === "live-activity") {
      const limit = parseInt(url.searchParams.get("limit") || "15");

      // Get recent documents with user info
      const { data: recentDocs } = await supabaseAdmin
        .from("documents")
        .select("id, title, template_type, initial_word_count, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Get recent signups
      const { data: recentSignups } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Get user emails for documents
      const userIds = [...new Set(recentDocs?.map(d => d.user_id) || [])];
      const { data: userProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

      // Combine and sort by time
      const activities: any[] = [];

      recentDocs?.forEach(doc => {
        const userEmail = userProfiles?.find(p => p.id === doc.user_id)?.email || "Unknown";
        activities.push({
          id: doc.id,
          type: "content_generated",
          description: `${userEmail} generated ${doc.template_type || "content"} (${doc.initial_word_count || 0} words)`,
          email: userEmail,
          templateType: doc.template_type,
          wordCount: doc.initial_word_count || 0,
          timestamp: doc.created_at,
        });
      });

      recentSignups?.forEach(signup => {
        activities.push({
          id: signup.id,
          type: "new_signup",
          description: `${signup.email} signed up`,
          email: signup.email,
          name: signup.full_name,
          timestamp: signup.created_at,
        });
      });

      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return new Response(JSON.stringify(activities.slice(0, limit)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "recent-signups") {
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "all-users") {
      // Get all profiles
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, created_at, is_banned")
        .order("created_at", { ascending: false });

      // Get user roles
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role");

      // Get organization memberships with credits and subscription tier
      const { data: memberships } = await supabaseAdmin
        .from("organization_members")
        .select(`
          user_id,
          organizations (
            id,
            monthly_credits,
            credits_used,
            subscription_tier,
            subscription_ends_at
          )
        `);

      // Get auth users to check email_confirmed_at
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      const authUsers = authData?.users || [];

      // Combine data
      const users = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const membership = memberships?.find(m => m.user_id === profile.id);
        const org = membership?.organizations as any;
        const authUser = authUsers.find(u => u.id === profile.id);
        
        return {
          ...profile,
          role: userRole?.role || "user",
          credits_remaining: org ? (org.monthly_credits - org.credits_used) : 0,
          organization_id: org?.id,
          subscription_tier: org?.subscription_tier || "free",
          subscription_ends_at: org?.subscription_ends_at || null,
          email_confirmed_at: authUser?.email_confirmed_at || null,
        };
      }) || [];

      return new Response(JSON.stringify(users), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "activity-logs") {
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const actionFilter = url.searchParams.get("actionType") || "";
      const adminId = url.searchParams.get("adminId") || "";
      const dateFrom = url.searchParams.get("dateFrom") || "";
      const dateTo = url.searchParams.get("dateTo") || "";

      // Build query with filters
      let query = supabaseAdmin
        .from("admin_activity_logs")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (actionFilter) {
        query = query.eq("action", actionFilter);
      }
      if (adminId) {
        query = query.eq("admin_user_id", adminId);
      }
      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }
      if (dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("created_at", endDate.toISOString());
      }

      // Get paginated logs
      const { data: logs, error: logsError } = await query.range(offset, offset + limit - 1);

      if (logsError) {
        console.error("Error fetching activity logs:", logsError);
        return new Response(JSON.stringify({ error: logsError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get admin profiles for the logs
      const adminIds = [...new Set(logs?.map(l => l.admin_user_id) || [])];
      const { data: adminProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", adminIds.length > 0 ? adminIds : ["00000000-0000-0000-0000-000000000000"]);

      // Enrich logs with admin info
      const enrichedLogs = logs?.map(log => ({
        ...log,
        admin_email: adminProfiles?.find(p => p.id === log.admin_user_id)?.email,
        admin_name: adminProfiles?.find(p => p.id === log.admin_user_id)?.full_name,
      })) || [];

      // Build count query with same filters
      let countQuery = supabaseAdmin
        .from("admin_activity_logs")
        .select("*", { count: "exact", head: true });

      if (actionFilter) {
        countQuery = countQuery.eq("action", actionFilter);
      }
      if (adminId) {
        countQuery = countQuery.eq("admin_user_id", adminId);
      }
      if (dateFrom) {
        countQuery = countQuery.gte("created_at", dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        countQuery = countQuery.lt("created_at", endDate.toISOString());
      }

      const { count } = await countQuery;

      // Get list of all admins for filter dropdown
      const { data: allAdminRoles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const allAdminIds = allAdminRoles?.map(r => r.user_id) || [];
      const { data: allAdmins } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", allAdminIds.length > 0 ? allAdminIds : ["00000000-0000-0000-0000-000000000000"]);

      return new Response(JSON.stringify({ 
        logs: enrichedLogs, 
        total: count || 0,
        admins: allAdmins || []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
