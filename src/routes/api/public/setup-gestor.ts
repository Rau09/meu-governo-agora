import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute('/api/public/setup-gestor')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email } = await request.json();

          if (!email) {
            return new Response('Email is required', { status: 400 });
          }

          // 1. Check if user exists in auth.users
          const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (userError) throw userError;

          let targetUser = users.users.find(u => u.email === email);

          if (!targetUser) {
            // Create user if not exists
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email,
              password: 'password123',
              email_confirm: true
            });
            if (createError) throw createError;
            targetUser = newUser.user;
          }

          // 2. Grant role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert({ 
              user_id: targetUser.id, 
              role: 'gestor' 
            }, { onConflict: 'user_id,role' });

          if (roleError) throw roleError;

          return new Response(JSON.stringify({ success: true, userId: targetUser.id }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500 });
        }
      }
    }
  }
});
