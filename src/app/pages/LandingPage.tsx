import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, MapPin, Package, Truck, Users, CheckCircle, ShoppingCart, GraduationCap, Star } from 'lucide-react';
import { agentApi } from '../../utils/api';
import Navbar from '../components/Navbar';
import AgentCard from '../components/AgentCard';
import FilterSidebar from '../components/FilterSidebar';

const SERVICES = [
  {
    name: 'Package Pickup & Delivery',
    icon: <Package className="w-8 h-8 text-blue-600" />,
    bg: 'bg-blue-100',
    desc: 'Reliable pickup and door-to-door delivery of packages across the city.',
  },
  {
    name: 'Groceries & Foodstuff Shopping',
    icon: <ShoppingCart className="w-8 h-8 text-green-600" />,
    bg: 'bg-green-100',
    desc: 'Fresh groceries and foodstuff sourced and delivered right to your door.',
  },
  {
    name: 'Back-to-School Runs',
    icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
    bg: 'bg-purple-100',
    desc: 'School supplies, uniforms, and materials picked up and delivered on time.',
  },
  {
    name: 'Market Runs & Other Errands',
    icon: <Star className="w-8 h-8 text-orange-600" />,
    bg: 'bg-orange-100',
    desc: 'Market runs, bill payments, and any other errands handled by trusted agents.',
  },
];

export default function LandingPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    service: '',
    searchQuery: '',
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async (appliedFilters?: any) => {
    try {
      setLoading(true);
      const filterParams = appliedFilters || filters;
      const { agents: fetchedAgents } = await agentApi.getActiveAgents({
        city: filterParams.city || undefined,
        state: filterParams.state || undefined,
        service: filterParams.service || undefined,
      });
      setAgents(fetchedAgents);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchAgents(filters);

  const handleFilterChange = (newFilters: any) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchAgents(merged);
  };

  const handleServiceFilter = (serviceName: string) => {
    const newFilters = { ...filters, service: filters.service === serviceName ? '' : serviceName };
    setFilters(newFilters);
    fetchAgents(newFilters);
  };

  const filteredAgents = agents.filter((agent) => {
    if (!filters.searchQuery) return true;
    const query = filters.searchQuery.toLowerCase();
    return (
      agent.business_name?.toLowerCase().includes(query) ||
      agent.location_city?.toLowerCase().includes(query) ||
      agent.location_state?.toLowerCase().includes(query) ||
      agent.services?.some((s: string) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Find Verified Logistics Agents Near You
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with professional agents for delivery, errands, shopping and more
            </p>

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, city, or service..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Find Agents
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{agents.length}+</div>
                <div className="text-blue-100 text-sm">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">24/7</div>
                <div className="text-blue-100 text-sm">Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">100%</div>
                <div className="text-blue-100 text-sm">Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">What Our Agents Do</h2>
            <p className="text-gray-500 mt-2">Click a service to filter agents by what they offer</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc) => (
              <button
                key={svc.name}
                onClick={() => handleServiceFilter(svc.name)}
                className={`text-left p-6 rounded-xl border-2 transition hover:shadow-md ${
                  filters.service === svc.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${svc.bg} rounded-xl mb-4`}>
                  {svc.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{svc.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{svc.desc}</p>
                {filters.service === svc.name && (
                  <span className="mt-3 inline-block text-xs font-semibold text-blue-600">
                    ✓ Filtering by this service
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                <CheckCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Verified Agents</h3>
              <p className="text-gray-500 text-sm">Only subscribed, vetted agents appear on the platform</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                <MapPin className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Location-Based</h3>
              <p className="text-gray-500 text-sm">Find agents operating in your specific city and state</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
                <Truck className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Direct WhatsApp</h3>
              <p className="text-gray-500 text-sm">Contact agents directly — no middleman, no delays</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64 flex-shrink-0">
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Agents ({filteredAgents.length})
                  </h2>
                  <p className="text-gray-500 text-sm">All agents are currently subscribed and active</p>
                </div>
                {filters.service && (
                  <button
                    onClick={() => handleFilterChange({ service: '' })}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear service filter ×
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
                  <p className="mt-4 text-gray-500">Loading agents...</p>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No agents found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search in a different area</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Are you a logistics agent?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Register your business, subscribe, and start getting discovered by clients in your area
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
          >
            <Users className="w-6 h-6" />
            Register as Agent
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">&copy; 2026 | KalaNg. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
