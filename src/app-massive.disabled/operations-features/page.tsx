import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { OperationalFeaturesAnnouncement } from '@/components/marketing/OperationalFeaturesAnnouncement';
import { 
  Check, 
  ArrowRight, 
  Users, 
  Package, 
  DollarSign,
  Shield,
  Truck,
  BookOpen,
  Gauge,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OperationsFeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <MarketingNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-bold mb-4">
              <Gauge className="w-4 h-4" />
              NEW: COMPLETE OPERATIONS MANAGEMENT
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Run Your Entire Operation
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                {" "}Not Just Monitor It
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              VibeLux Operations Center brings everything you need for daily management into one platform. 
              From shift handoffs to customer deliveries, manage it all while reducing energy costs by 20-30%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/operations" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                Explore Operations Center
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/sign-up" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                The Problem: Too Many Tools, Not Enough Integration
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Scattered Information</h3>
                    <p className="text-gray-400">Shift notes in one place, inventory in another, orders somewhere else</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Manual Processes</h3>
                    <p className="text-gray-400">Handwritten logs, Excel sheets, and paper trails everywhere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Reactive Management</h3>
                    <p className="text-gray-400">Always putting out fires instead of preventing them</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">
                The Solution: One Platform, Total Control
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Unified Operations</h4>
                    <p className="text-gray-400">Everything in one place, accessible from anywhere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Automated Workflows</h4>
                    <p className="text-gray-400">From reorder points to compliance documentation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Predictive Intelligence</h4>
                    <p className="text-gray-400">Know what's coming before it becomes a problem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Details */}
      <OperationalFeaturesAnnouncement />

      {/* ROI Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Real Results from Real Growers
            </h2>
            <p className="text-xl text-gray-400">
              See how operations management transforms your bottom line
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">35%</div>
              <p className="text-gray-400">Labor Efficiency Gain</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">2.5 hrs</div>
              <p className="text-gray-400">Saved Daily per Manager</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <Package className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">18%</div>
              <p className="text-gray-400">Inventory Cost Reduction</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">$45K</div>
              <p className="text-gray-400">Annual Savings Average</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Seamlessly Integrated with Your Existing VibeLux Tools
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Operations Center works perfectly with all VibeLux features you already love
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <IntegrationCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Analytics"
              description="Performance data flows into unified dashboards"
            />
            <IntegrationCard 
              icon={<Gauge className="w-6 h-6" />}
              title="HMI Control"
              description="Equipment status updates task priorities"
            />
            <IntegrationCard 
              icon={<AlertCircle className="w-6 h-6" />}
              title="Alerts"
              description="Environmental alerts trigger operational tasks"
            />
            <IntegrationCard 
              icon={<Users className="w-6 h-6" />}
              title="Teams"
              description="Role-based access across all modules"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-12 border border-green-500/20">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join leading growers who've upgraded from monitoring to complete operational control
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/operations" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
                Explore Operations Center
              </Link>
              <Link href="/sign-up" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
                Start 30-Day Free Trial
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Full access to all features
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

interface IntegrationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function IntegrationCard({ icon, title, description }: IntegrationCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3 text-gray-400">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}