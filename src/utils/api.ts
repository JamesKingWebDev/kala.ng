import { projectId, publicAnonKey } from "./supabase/info";

// Replace with your Paystack public key (starts with pk_live_ or pk_test_)
export const PAYSTACK_PUBLIC_KEY =
  "pk_test_3df6edf139c3c60025804de211b5b24e9e045617";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-73b64ebc`;

// Helper to make API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const hasBody =
    options.method &&
    ["POST", "PUT", "PATCH"].includes(options.method);
  const headers: Record<string, string> = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${publicAnonKey}`,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
};

// Agent APIs
export const agentApi = {
  getActiveAgents: async (filters?: {
    city?: string;
    state?: string;
    service?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append("city", filters.city);
    if (filters?.state) params.append("state", filters.state);
    if (filters?.service)
      params.append("service", filters.service);

    const query = params.toString();
    return apiCall(`/agents${query ? `?${query}` : ""}`);
  },

  getProfileByEmail: async (email: string) => {
    const params = new URLSearchParams({ email });
    return apiCall(`/agents/by-email?${params.toString()}`);
  },

  saveProfile: async (profileData: any) => {
    return apiCall("/agents/profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  },
};

// Payment APIs
export const paymentApi = {
  getStatus: async (email: string) => {
    const params = new URLSearchParams({ email });
    return apiCall(`/payments/status?${params.toString()}`);
  },

  verifyPaystack: async (
    reference: string,
    email: string,
    plan: string,
  ) => {
    return apiCall("/payments/paystack/verify", {
      method: "POST",
      body: JSON.stringify({ reference, email, plan }),
    });
  },
};

// Admin APIs
export const adminApi = {
  getAllAgents: async () => {
    return apiCall("/admin/agents");
  },

  getAdminWhatsApp: async () => {
    return apiCall("/admin/whatsapp");
  },

  activateAgent: async (
    agentId: string,
    hours: number = 24,
  ) => {
    return apiCall(`/admin/agents/${agentId}/activate`, {
      method: "POST",
      body: JSON.stringify({ hours }),
    });
  },

  verifyAgent: async (agentId: string, isVerified: boolean) => {
    return apiCall(`/admin/agents/${agentId}/verify`, {
      method: "POST",
      body: JSON.stringify({ isVerified }),
    });
  },
};