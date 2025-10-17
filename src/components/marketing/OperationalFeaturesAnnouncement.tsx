'use client';

import { 
  Gauge, 
  Users, 
  Package, 
  DollarSign,
  Shield,
  Truck,
  BookOpen,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export function OperationalFeaturesAnnouncement() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-bold mb-4">
            <Sparkles className="w-4 h-4" />
            MAJOR UPDATE: OPERATIONAL MANAGEMENT
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            We Listened: Beyond Monitoring to Daily Operations
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            You told us monitoring was just the beginning. VibeLux now includes everything you need 
            to run your entire operation - from morning shift handoffs to customer deliveries.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Gauge className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Complete Operations Hub</h3>
            <p className="text-gray-400">One platform for everything from daily tasks to long-term planning</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Team Collaboration</h3>
            <p className="text-gray-400">Keep everyone aligned with shift notes and task management</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Revenue Management</h3>
            <p className="text-gray-400">Track orders, manage customers, and automate invoicing</p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Daily Operations"
            description="Shift management, harvest tracking, and workflow automation"
            features={[
              "Morning/evening shift handoffs",
              "Harvest planning & yield tracking",
              "Task assignment with priorities",
              "Team communication hub"
            ]}
            href="/operations/daily"
            color="green"
          />
          
          <FeatureCard
            icon={<Package className="w-6 h-6" />}
            title="Inventory Control"
            description="Smart inventory management with automated reordering"
            features={[
              "Batch & lot tracking",
              "Expiry date management",
              "Automated reorder points",
              "Consumption analytics"
            ]}
            href="/operations/inventory"
            color="blue"
          />
          
          <FeatureCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Order Management"
            description="Complete order-to-cash workflow automation"
            features={[
              "Customer relationship tracking",
              "Order fulfillment workflow",
              "Automated invoicing",
              "Payment status tracking"
            ]}
            href="/operations/orders"
            color="purple"
          />
          
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Compliance Engine"
            description="Step-by-step compliance with automated evidence"
            features={[
              "Workflow automation",
              "Evidence collection",
              "Audit trail generation",
              "Inspection readiness"
            ]}
            href="/operations/compliance"
            color="orange"
          />
          
          <FeatureCard
            icon={<Truck className="w-6 h-6" />}
            title="Vendor Management"
            description="Optimize your supply chain and vendor relationships"
            features={[
              "Performance scorecards",
              "Contract management",
              "Purchase order tracking",
              "Delivery analytics"
            ]}
            href="/operations/vendors"
            color="teal"
          />
          
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Knowledge Base"
            description="Centralized SOPs and training management"
            features={[
              "Version-controlled SOPs",
              "Training records",
              "Interactive content",
              "Certification tracking"
            ]}
            href="/operations/knowledge"
            color="yellow"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/operations">
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 mx-auto">
              <Gauge className="w-6 h-6" />
              Explore Operations Center
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            All features included in Professional and Enterprise plans
          </p>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  href: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'teal' | 'yellow';
}

function FeatureCard({ icon, title, description, features, href, color }: FeatureCardProps) {
  const colorClasses = {
    green: 'from-green-900/20 to-emerald-900/20 border-green-500/20 text-green-400',
    blue: 'from-blue-900/20 to-indigo-900/20 border-blue-500/20 text-blue-400',
    purple: 'from-purple-900/20 to-pink-900/20 border-purple-500/20 text-purple-400',
    orange: 'from-orange-900/20 to-red-900/20 border-orange-500/20 text-orange-400',
    teal: 'from-teal-900/20 to-cyan-900/20 border-teal-500/20 text-teal-400',
    yellow: 'from-yellow-900/20 to-amber-900/20 border-yellow-500/20 text-yellow-400'
  };

  const bgClasses = {
    green: 'bg-green-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
    orange: 'bg-orange-500/20',
    teal: 'bg-teal-500/20',
    yellow: 'bg-yellow-500/20'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 border`}>
      <div className={`w-12 h-12 ${bgClasses[color]} rounded-xl flex items-center justify-center mb-4`}>
        <span className={colorClasses[color]}>{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2 text-sm text-gray-300 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className={`w-4 h-4 mt-0.5 ${colorClasses[color]}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link 
        href={href} 
        className={`${colorClasses[color]} font-medium flex items-center gap-2 hover:opacity-80 transition-opacity`}
      >
        Learn More <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}