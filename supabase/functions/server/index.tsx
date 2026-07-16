import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Helper to create Supabase client
const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceRole
      ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      : Deno.env.get("SUPABASE_ANON_KEY")!
  );
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-73b64ebc/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ CONFIGURATION ============
const ADMIN_WHATSAPP = "+2348012345678"; // Update this with actual admin WhatsApp number

// ============ AGENT ROUTES ============

// Get active agents (with optional filters)
app.get("/make-server-73b64ebc/agents", async (c) => {
  try {
    const city = c.req.query("city");
    const state = c.req.query("state");
    const service = c.req.query("service");

    const supabase = getSupabaseClient(true);

    // Get all active agents (those with valid payments)
    const now = new Date().toISOString();
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("agent_id")
      .eq("status", "completed")
      .gt("expires_at", now);

    if (paymentsError) {
      console.log(`Error fetching active payments: ${paymentsError.message}`);
      return c.json({ error: paymentsError.message }, 500);
    }

    const activeAgentIds = payments.map(p => p.agent_id);

    if (activeAgentIds.length === 0) {
      return c.json({ agents: [] });
    }

    // Build query for agents
    let query = supabase
      .from("agents")
      .select("*")
      .in("id", activeAgentIds);

    if (city) {
      query = query.ilike("location_city", city);
    }
    if (state) {
      query = query.ilike("location_state", state);
    }
    if (service) {
      query = query.contains("services", [service]);
    }

    const { data: agents, error: agentsError } = await query;

    if (agentsError) {
      console.log(`Error fetching agents: ${agentsError.message}`);
      return c.json({ error: agentsError.message }, 500);
    }

    // Get payment expiry for each agent
    const agentsWithExpiry = await Promise.all(
      agents.map(async (agent) => {
        const { data: payment } = await supabase
          .from("payments")
          .select("expires_at")
          .eq("agent_id", agent.id)
          .eq("status", "completed")
          .gt("expires_at", now)
          .order("expires_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...agent,
          expiresAt: payment?.expires_at
        };
      })
    );

    return c.json({ agents: agentsWithExpiry });
  } catch (error) {
    console.log(`Unexpected error fetching agents: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get agent profile by email
app.get("/make-server-73b64ebc/agents/by-email", async (c) => {
  try {
    const email = c.req.query("email");

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const supabase = getSupabaseClient(true);

    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.log(`Error fetching agent profile: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    // Get latest payment status
    if (agent) {
      const now = new Date().toISOString();
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("agent_id", agent.id)
        .eq("status", "completed")
        .gt("expires_at", now)
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return c.json({
        agent: {
          ...agent,
          activePayment: payment
        }
      });
    }

    return c.json({ agent: null });
  } catch (error) {
    console.log(`Unexpected error fetching agent profile: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get admin WhatsApp
app.get("/make-server-73b64ebc/admin/whatsapp", (c) => {
  return c.json({ whatsapp: ADMIN_WHATSAPP });
});

// Create/Update agent profile (no auth required)
app.post("/make-server-73b64ebc/agents/profile", async (c) => {
  try {
    const profileData = await c.req.json();

    if (!profileData.email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const supabase = getSupabaseClient(true);

    // Check if profile exists
    const { data: existingAgent } = await supabase
      .from("agents")
      .select("id")
      .eq("email", profileData.email)
      .maybeSingle();

    let result;
    if (existingAgent) {
      // Update existing profile
      const { data, error } = await supabase
        .from("agents")
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq("email", profileData.email)
        .select()
        .single();

      if (error) {
        console.log(`Error updating agent profile: ${error.message}`);
        return c.json({ error: error.message }, 500);
      }
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("agents")
        .insert({
          ...profileData,
          user_id: null // No user auth
        })
        .select()
        .single();

      if (error) {
        console.log(`Error creating agent profile: ${error.message}`);
        return c.json({ error: error.message }, 500);
      }
      result = data;
    }

    return c.json({ agent: result });
  } catch (error) {
    console.log(`Unexpected error saving agent profile: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// ============ PAYMENT ROUTES ============

// Verify Paystack transaction and activate agent
app.post("/make-server-73b64ebc/payments/paystack/verify", async (c) => {
  try {
    const { reference, email, plan } = await c.req.json();

    if (!reference || !email || !plan) {
      return c.json({ error: "reference, email, and plan are required" }, 400);
    }

    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecret) {
      return c.json({ error: "Payment verification not configured" }, 500);
    }

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return c.json({ error: "Payment verification failed" }, 400);
    }

    // Determine hours based on plan
    const planHours: Record<string, number> = {
      daily: 24,
      weekly: 168,
      monthly: 720,
    };
    const hours = planHours[plan] ?? 24;

    const supabase = getSupabaseClient(true);

    // Get or create agent
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!agent) {
      return c.json({ error: "Agent not found" }, 404);
    }

    // Record payment
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const { error: paymentError } = await supabase.from("payments").insert({
      agent_id: agent.id,
      amount: verifyData.data.amount,
      currency: "NGN",
      payment_provider: "paystack",
      payment_id: reference,
      status: "completed",
      activated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (paymentError) {
      return c.json({ error: paymentError.message }, 500);
    }

    return c.json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get payment status for agent by email
app.get("/make-server-73b64ebc/payments/status", async (c) => {
  try {
    const email = c.req.query("email");

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const supabase = getSupabaseClient(true);

    // Get agent profile
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!agent) {
      return c.json({ activePayment: null, paymentHistory: [] });
    }

    // Get active payment
    const now = new Date().toISOString();
    const { data: activePayment } = await supabase
      .from("payments")
      .select("*")
      .eq("agent_id", agent.id)
      .eq("status", "completed")
      .gt("expires_at", now)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get payment history
    const { data: paymentHistory } = await supabase
      .from("payments")
      .select("*")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return c.json({
      activePayment,
      paymentHistory: paymentHistory || [],
    });
  } catch (error) {
    console.log(`Unexpected error fetching payment status: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// ============ ADMIN ROUTES (Public Access) ============

// Get all agents
app.get("/make-server-73b64ebc/admin/agents", async (c) => {
  try {
    const supabase = getSupabaseClient(true);

    const { data: agents, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(`Error fetching all agents: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    // Get payment status for each agent
    const now = new Date().toISOString();
    const agentsWithStatus = await Promise.all(
      agents.map(async (agent) => {
        const { data: activePayment } = await supabase
          .from("payments")
          .select("*")
          .eq("agent_id", agent.id)
          .eq("status", "completed")
          .gt("expires_at", now)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...agent,
          isActive: !!activePayment,
          activePayment,
        };
      })
    );

    return c.json({ agents: agentsWithStatus });
  } catch (error) {
    console.log(`Unexpected error fetching admin agents: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Manually activate agent (after payment confirmation)
app.post("/make-server-73b64ebc/admin/agents/:id/activate", async (c) => {
  try {
    const supabase = getSupabaseClient(true);
    const agentId = c.req.param("id");
    const { hours = 24 } = await c.req.json();

    // Create payment record
    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        agent_id: agentId,
        amount: 0, // Manual activation
        currency: "NGN",
        payment_provider: "manual",
        payment_id: `manual_${Date.now()}`,
        status: "completed",
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

    if (paymentError) {
      console.log(`Error creating payment record: ${paymentError.message}`);
      return c.json({ error: paymentError.message }, 500);
    }

    return c.json({
      message: "Agent activated successfully",
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.log(`Unexpected error activating agent: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

// Update agent verification status
app.post("/make-server-73b64ebc/admin/agents/:id/verify", async (c) => {
  try {
    const supabase = getSupabaseClient(true);
    const agentId = c.req.param("id");
    const { isVerified } = await c.req.json();

    const { data, error } = await supabase
      .from("agents")
      .update({ is_verified: isVerified })
      .eq("id", agentId)
      .select()
      .single();

    if (error) {
      console.log(`Error updating agent verification: ${error.message}`);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ agent: data });
  } catch (error) {
    console.log(`Unexpected error updating verification: ${error.message}`);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);