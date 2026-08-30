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
    const resendApiKey = Deno.env.get('EMAIL_PROVIDER_API_KEY') ?? '';
    const emailFrom = Deno.env.get('EMAIL_FROM') ?? 'Dukanzo <hello@dukanzo.in>';
    const dukanzoEmail = Deno.env.get('DUKANZO_NOTIFICATION_EMAIL') ?? 'hello@dukanzo.in';

    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const { requestId, documentId } = await req.json();
    if (!requestId || !documentId) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Retrieve Project Request & canonical data
    const { data: projectRequest, error: prError } = await supabaseAdmin
      .from('project_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (prError || !projectRequest) throw prError;
    const srsData = projectRequest.canonical_srs_data;

    // Retrieve Document Record
    const { data: srsDoc, error: srsDocError } = await supabaseAdmin
      .from('srs_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (srsDocError || !srsDoc) throw srsDocError;

    // Create a signed URL for the Dukanzo team to access the SRS document
    // Alternatively, they can just access it via the Supabase Dashboard. 
    // We'll generate a short-lived signed URL for convenience in the email.
    const { data: signedUrlData } = await supabaseAdmin
      .storage
      .from('srs')
      .createSignedUrl(srsDoc.document_url, 60 * 60 * 24 * 7); // 7 days

    const documentLink = signedUrlData?.signedUrl || 'Available in Supabase Dashboard';

    // Prepare Email
    const htmlEmail = `
      <h2>New Dukanzo Project Request — ${srsData.requestReference}</h2>
      <p><strong>Customer:</strong> ${srsData.customer.email}</p>
      <p><strong>Phone:</strong> ${srsData.customer.phone || 'N/A'}</p>
      <p><strong>Tier:</strong> ${srsData.tier}</p>
      <p><strong>Submission Date:</strong> ${new Date(srsData.submittedAt).toLocaleString()}</p>
      <br />
      <p><strong>Brief Summary:</strong></p>
      <p>${srsData.specialRequirements || 'No special requirements.'}</p>
      <br />
      <p><a href="${documentLink}" target="_blank">View Generated SRS Document</a></p>
    `;

    // Call Resend API
    let emailStatus = 'sent';
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [dukanzoEmail],
          subject: `New Dukanzo Project Request — ${srsData.requestReference}`,
          html: htmlEmail
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Resend API Error:", errorText);
        throw new Error("Failed to send email");
      }
    } catch (e) {
      console.error("Email delivery failed:", e);
      emailStatus = 'email_failed';
    }

    // Record Status
    await supabaseAdmin
      .from('srs_documents')
      .update({ status: emailStatus })
      .eq('id', documentId);

    // If email failed, we still return a 200 to the caller, because the request was saved and SRS generated.
    // The internal status reflects the failure.
    return new Response(JSON.stringify({ 
      success: true, 
      emailStatus 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Email Edge Function Error:", error);
    // Don't leak secrets or throw 500s that break the frontend flow for non-critical email issues
    // But if we couldn't even prepare the email, we return 500
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
