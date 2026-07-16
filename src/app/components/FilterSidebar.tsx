import { MapPin, Package, Filter } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    city: string;
    state: string;
    service: string;
  };
  onFilterChange: (filters: any) => void;
}

const SERVICES = [
  'Package Pickup & Delivery',
  'Groceries & Foodstuff Shopping',
  'Back-to-School Runs',
  'Market Runs & Other Errands',
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const handleReset = () => {
    onFilterChange({ city: '', state: '', service: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset
        </button>
      </div>

      {/* State Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          State
        </label>
        <select
          value={filters.state}
          onChange={(e) => onFilterChange({ state: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All States</option>
          {NIGERIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          City
        </label>
        <input
          type="text"
          value={filters.city}
          onChange={(e) => onFilterChange({ city: e.target.value })}
          placeholder="Enter city..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Service Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Service Type
        </label>
        <select
          value={filters.service}
          onChange={(e) => onFilterChange({ service: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Services</option>
          {SERVICES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters Summary */}
      {(filters.city || filters.state || filters.service) && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">Active Filters:</p>
          <div className="space-y-1">
            {filters.state && (
              <div className="text-sm text-gray-600">State: {filters.state}</div>
            )}
            {filters.city && (
              <div className="text-sm text-gray-600">City: {filters.city}</div>
            )}
            {filters.service && (
              <div className="text-sm text-gray-600">Service: {filters.service}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
