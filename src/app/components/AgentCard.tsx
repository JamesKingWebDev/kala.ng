import { MapPin, Package, Star, Clock, MessageCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AgentCardProps {
  agent: {
    id: string;
    business_name: string;
    description: string;
    profile_image_url?: string;
    whatsapp_number: string;
    location_city: string;
    location_state: string;
    services: string[];
    rating: number;
    total_reviews: number;
    is_verified: boolean;
    expiresAt?: string;
  };
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!agent.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(agent.expiresAt!).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`Expires in ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [agent.expiresAt]);

  const handleWhatsAppClick = () => {
    const phoneNumber = agent.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${agent.business_name}, I found you on Logistics Connect and I'd like to inquire about your services.`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
      {/* Header with Image */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-green-500">
        {agent.profile_image_url ? (
          <img
            src={agent.profile_image_url}
            alt={agent.business_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        {agent.is_verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Business Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.business_name}</h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span>
            {agent.location_city}, {agent.location_state}
          </span>
        </div>

        {/* Description */}
        {agent.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>
        )}

        {/* Services */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.services.slice(0, 3).map((service, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
            >
              {service}
            </span>
          ))}
          {agent.services.length > 3 && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              +{agent.services.length - 3} more
            </span>
          )}
        </div>

        {/* Rating */}
        {agent.total_reviews > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-900">{agent.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500 text-sm">({agent.total_reviews} reviews)</span>
          </div>
        )}

        {/* Timer */}
        {timeRemaining && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
        )}

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Chat on WhatsApp
        </button>
      </div>
    </div>
  );
}
