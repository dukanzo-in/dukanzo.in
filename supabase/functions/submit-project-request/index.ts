import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Create a Supabase client with the Auth context of the logged-in user.
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Get the user to verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const payload = await req.json();
    const { tierId, configuration, requirements, customNotes } = payload;

    if (!tierId) {
      return new Response(JSON.stringify({ error: 'Missing tierId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Create an admin client to perform inserts bypass RLS if needed, or to fetch validation data
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Validate tier exists
    const { data: tier, error: tierError } = await supabaseAdmin
      .from('service_tiers')
      .select('name')
      .eq('id', tierId)
      .single();

    if (tierError || !tier) {
      return new Response(JSON.stringify({ error: 'Invalid Tier' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Generate Request Reference (e.g., DUK-000001)
    // For safety and concurrency, in a real system we'd use a postgres sequence, 
    // but here we can generate a random short ID or fetch count
    const { count } = await supabaseAdmin
      .from('project_requests')
      .select('*', { count: 'exact', head: true });
    
    const requestNumber = (count || 0) + 1;
    const requestReference = `DUK-${requestNumber.toString().padStart(6, '0')}`;

    // 1. Create Project Request
    const { data: projectRequest, error: prError } = await supabaseAdmin
      .from('project_requests')
      .insert({
        user_id: user.id,
        tier_id: tierId,
        status: 'submitted',
        contact_phone: user.phone || null,
        contact_email: user.email || null,
        // We will store canonical structured data here or as a separate process.
      })
      .select('id')
      .single();

    if (prError) throw prError;
    const requestId = projectRequest.id;

    // 2. Save Requirement Answers
    // For simplicity, we store the full JSON payload into requirement_answers or a specific structured column.
    // Our schema has `question_id` (UUID) and `answer_text` (TEXT) in requirement_answers.
    // We will map the incoming `requirements` dictionary to the answers table.
    
    const answersToInsert = [];
    for (const [key, value] of Object.entries(requirements || {})) {
      if (value) {
        const answerText = typeof value === 'object' ? JSON.stringify(value) : String(value);
        answersToInsert.push({
          request_id: requestId,
          question_id: key, // Assuming keys are question UUIDs
          answer_text: answerText
        });
      }
    }

    // Add custom notes as a special answer if present, or just store it.
    // We will rely on canonical data for completeness.
    
    if (answersToInsert.length > 0) {
      // Validate that keys are valid UUIDs to avoid DB errors
      const validUUIDs = answersToInsert.filter(a => a.question_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
      if (validUUIDs.length > 0) {
        const { error: answersError } = await supabaseAdmin
          .from('requirement_answers')
          .insert(validUUIDs);
        
        if (answersError) console.error("Error inserting answers:", answersError);
      }
    }

    // 3. Create Canonical SRS Data (Stored in project_requests or a new table)
    // To satisfy the requirement: "Create the canonical structured SRS representation."
    // We'll update the project request with a JSON column containing this canonical representation.
    // First, let's create a quick migration to add `canonical_srs_data` to `project_requests` if it doesn't exist.
    // Assuming we do it, we'll update it here.
    
    const canonicalData = {
      requestId: requestId,
      requestReference: requestReference,
      customer: {
        id: user.id,
        phone: user.phone,
        email: user.email
      },
      tier: tier.name,
      configuration: configuration || {},
      answers: requirements || {},
      specialRequirements: customNotes || '',
      submittedAt: new Date().toISOString()
    };

    // Add a column `canonical_srs_data` JSONB to `project_requests` to store this!
    // For now we assume we added it in a migration.
    const { error: updateError } = await supabaseAdmin
      .from('project_requests')
      .update({
        request_reference: requestReference,
        canonical_srs_data: canonicalData
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Trigger SRS Generation and Email Notification safely
    // We do not want to fail the overall request if document generation or email fails.
    try {
      const { data: srsResponse, error: srsInvokeError } = await supabaseClient.functions.invoke('generate-srs', {
        body: { requestId }
      });
      
      if (srsInvokeError) {
        console.error("Failed to invoke generate-srs:", srsInvokeError);
      } else if (srsResponse?.documentId) {
        // Only attempt email if SRS generated successfully
        const { error: emailInvokeError } = await supabaseClient.functions.invoke('send-project-email', {
          body: { requestId, documentId: srsResponse.documentId }
        });
        if (emailInvokeError) {
          console.error("Failed to invoke send-project-email:", emailInvokeError);
        }
      }
    } catch (backgroundErr) {
      console.error("Background task error in submit-project-request:", backgroundErr);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      requestReference, 
      requestId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    console.error("Submit Project Request Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
