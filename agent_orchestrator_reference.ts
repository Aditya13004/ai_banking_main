import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { OpenAI } from "https://esm.sh/openai@4.14.0"; // Requires Deno/Edge Function env

// 1. Initialize Clients securely using Env Variables (Never expose these in React frontend)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. The Agentic Orchestration Webhook Handler
serve(async (req) => {
  try {
    // A database webhook hits this endpoint whenever a new document is uploaded by the customer
    const { record: newDocument } = await req.json();

    const userId = newDocument.user_id;
    const documentUrl = supabase.storage.from("kyc-docs").getPublicUrl(newDocument.file_name).data.publicUrl;

    console.log(`[Agent] Initiating AI Orchestration for User: ${userId}`);

    // Fetch the customer's self-reported form data from Supabase
    const { data: user } = await supabase.from("users").select("*").eq("id", userId).single();

    // ----------------------------------------------------------------------------------
    // 🧠 AI NODE 1: VISION EXTRACTION & CLARITY CHECK (GPT-4o Vision)
    // ----------------------------------------------------------------------------------
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Extract the Name, PAN, and Aadhaar numbers from this image. Also evaluate the image clarity on a scale of 0-100. Return JSON strictly formatted as: {"extractedName": "", "extractedPan": "", "extractedAadhaar": "", "clarityScore": 0}` },
            { type: "image_url", image_url: { url: documentUrl } },
          ],
        },
      ],
    });

    const extraction = JSON.parse(visionResponse.choices[0].message.content || "{}");

    // ----------------------------------------------------------------------------------
    // 🧠 AI NODE 2: ORCHESTRATION DECISION LOGIC
    // ----------------------------------------------------------------------------------
    let finalStatus = "approved";
    let riskLevel = "Low";
    let escalationReason = null;
    let confidence = extraction.clarityScore;

    // Agentic Evaluation Rule 1: Human-in-the-loop Image Escalation
    if (extraction.clarityScore < 60) {
      finalStatus = "rejected"; 
      riskLevel = "High";
      escalationReason = "Aadhaar clarity low";
    } 
    // Agentic Evaluation Rule 2: Fuzzy Logic Discrepancy (E.g. "J Doe" vs "John Doe")
    else if (extraction.extractedPan !== user.pan || !extraction.extractedName.includes(user.name)) {
      finalStatus = "rejected";
      riskLevel = "Medium";
      escalationReason = "Fuzzy Name Mismatch / Data Deficit";
      confidence = 55;
    }

    // ----------------------------------------------------------------------------------
    // 🧠 AI NODE 3: LOG THE AGENT'S ACTIVITY TO THE CRM DATABASE
    // ----------------------------------------------------------------------------------
    await supabase.from("orchestration_logs").insert([
      { user_id: userId, action_taken: "Executed Vision OCR", agent_node: "GPT-4o Vision", confidence_score: confidence },
      { user_id: userId, action_taken: `Evaluated Profile. Decision: ${finalStatus}`, agent_node: "Agent Rule Engine", confidence_score: confidence }
    ]);

    // ----------------------------------------------------------------------------------
    // 🧠 AI NODE 4: FINALIZE WORKFLOW (Updates React Frontend Instantly)
    // ----------------------------------------------------------------------------------
    await supabase.from("users").update({
      status: finalStatus,
      ai_confidence_score: confidence,
      kyc_risk_level: riskLevel,
      escalation_reason: escalationReason,
    }).eq("id", userId);

    return new Response(JSON.stringify({ success: true, ai_decision: finalStatus }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
