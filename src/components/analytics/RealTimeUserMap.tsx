'use client'

interface UserLocation {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  activeUsers: number;
  sessions: number;
  avgSessionDuration: number;
  conversionRate: number;
}

interface RealTimeUserMapProps {
  userLocations: UserLocation[];
}

export default function RealTimeUserMap({ userLocations }: RealTimeUserMapProps) {
  return (
    <div className="p-8 text-center text-gray-500">
      <p>Real-time user map is currently disabled for performance optimization.</p>
      <p className="text-sm mt-2">
        Tracking {userLocations.length} locations with {userLocations.reduce((sum, loc) => sum + loc.activeUsers, 0)} active users
      </p>
    </div>
  )
}