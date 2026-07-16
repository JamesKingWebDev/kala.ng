import { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Clock,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { adminApi } from '../../utils/api';

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [updatingAgent, setUpdatingAgent] = useState<string | null>(null);
  const [activatingAgent, setActivatingAgent] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredAgents(agents);
    } else if (filter === 'active') {
      setFilteredAgents(agents.filter((a) => a.isActive));
    } else {
      setFilteredAgents(agents.filter((a) => !a.isActive));
    }
  }, [filter, agents]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { agents: fetchedAgents } = await adminApi.getAllAgents();
      setAgents(fetchedAgents);
      setFilteredAgents(fetchedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAgent = async (agentId: string, isVerified: boolean) => {
    try {
      setUpdatingAgent(agentId);
      await adminApi.verifyAgent(agentId, isVerified);

      // Update local state
      setAgents(
        agents.map((agent) =>
          agent.id === agentId ? { ...agent, is_verified: isVerified } : agent
        )
      );
    } catch (error: any) {
      alert(`Error updating agent: ${error.message}`);
      console.error('Error updating agent:', error);
    } finally {
      setUpdatingAgent(null);
    }
  };

  const handleActivateAgent = async (agentId: string) => {
    try {
      setActivatingAgent(agentId);
      await adminApi.activateAgent(agentId, 24);
      await fetchAgents();
    } catch (error: any) {
      alert(`Error activating agent: ${error.message}`);
    } finally {
      setActivatingAgent(null);
    }
  };

  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.isActive).length,
    verified: agents.filter((a) => a.is_verified).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Verified Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.verified}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive ({stats.total - stats.active})
            </button>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Business Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Services
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {agent.business_name}
                          </span>
                          {agent.is_verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {agent.location_city}, {agent.location_state}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <Phone className="w-4 h-4" />
                          <span>{agent.whatsapp_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {agent.services?.slice(0, 2).map((service: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                            >
                              {service}
                            </span>
                          ))}
                          {agent.services?.length > 2 && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              +{agent.services.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              agent.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {agent.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </>
                            )}
                          </span>
                          {agent.activePayment && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                Expires:{' '}
                                {new Date(agent.activePayment.expires_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleActivateAgent(agent.id)}
                            disabled={activatingAgent === agent.id}
                            className="px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-50 bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1"
                            title="Grant 24-hour free visibility"
                          >
                            {activatingAgent === agent.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                            ) : (
                              <>
                                <Zap className="w-3 h-3" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleVerifyAgent(agent.id, !agent.is_verified)}
                            disabled={updatingAgent === agent.id}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                              agent.is_verified
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {updatingAgent === agent.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                            ) : agent.is_verified ? (
                              'Unverify'
                            ) : (
                              'Verify'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
