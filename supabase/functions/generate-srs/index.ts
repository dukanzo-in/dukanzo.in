import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return new Response(JSON.stringify({ error: 'Missing requestId' }), { status: 400, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Retrieve project request & canonical data
    const { data: projectRequest, error: prError } = await supabaseAdmin
      .from('project_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (prError || !projectRequest) {
      return new Response(JSON.stringify({ error: 'Project Request not found' }), { status: 404, headers: corsHeaders })
    }

    // Verify ownership
    if (projectRequest.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
    }

    const srsData = projectRequest.canonical_srs_data;
    if (!srsData) {
      return new Response(JSON.stringify({ error: 'Canonical SRS data not found' }), { status: 400, headers: corsHeaders })
    }

    // Generate HTML Document
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SRS Document - ${srsData.requestReference}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { border-bottom: 2px solid #fbbf24; padding-bottom: 10px; }
    h2 { margin-top: 30px; color: #111; }
    .meta { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .meta p { margin: 5px 0; }
    .section { margin-bottom: 30px; }
    dl { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; }
    dt { font-weight: bold; }
    dd { margin: 0; }
    .disclaimer { font-size: 0.85em; color: #666; margin-top: 50px; border-top: 1px solid #eaeaea; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>Software Requirements Specification</h1>
  
  <div class="meta">
    <p><strong>Request ID:</strong> ${srsData.requestReference}</p>
    <p><strong>Customer Email:</strong> ${srsData.customer.email}</p>
    <p><strong>Selected Tier:</strong> ${srsData.tier}</p>
    <p><strong>Submitted At:</strong> ${new Date(srsData.submittedAt).toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>Requirements Overview</h2>
    <dl>
      ${Object.entries(srsData.answers).map(([key, value]) => `
        <dt>${key}</dt>
        <dd>${typeof value === 'object' ? JSON.stringify(value) : value}</dd>
      `).join('')}
    </dl>
  </div>

  <div class="section">
    <h2>Special Requirements</h2>
    <p>${srsData.specialRequirements || 'None provided.'}</p>
  </div>

  <div class="disclaimer">
    <p><strong>Disclaimer:</strong> This document represents CUSTOMER-PROVIDED REQUIREMENTS. It is not a final approved scope, quotation, contract, or guarantee of functionality.</p>
  </div>
</body>
</html>
    `;

    // Store in Supabase Storage
    const fileName = `${user.id}/v1/${srsData.requestReference}.html`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('srs')
      .upload(fileName, htmlContent, {
        contentType: 'text/html',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Record in srs_documents
    const { data: srsDoc, error: srsDocError } = await supabaseAdmin
      .from('srs_documents')
      .insert({
        request_id: requestId,
        document_url: fileName,
        version: 1,
        status: 'generated'
      })
      .select('*')
      .single();

    if (srsDocError) {
      throw srsDocError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      documentId: srsDoc.id,
      documentUrl: fileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("SRS Generation Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
