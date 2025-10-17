import { Metadata } from 'next';
import { DiagnosticReport } from '@/components/DiagnosticReport';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Diagnostic Report - VibeLux',
  description: 'Generate a diagnostic report to help us resolve technical issues',
};

export default function DiagnosticPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Diagnostic Report
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Generate a comprehensive diagnostic report to help our support team resolve any technical issues you're experiencing.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-600/20 rounded-lg p-4 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">Generate Report</h3>
                <p className="text-sm text-gray-400">Click to collect system and error information</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-600/20 rounded-lg p-4 mb-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">Download & Send</h3>
                <p className="text-sm text-gray-400">Download the report or email it directly to support</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-600/20 rounded-lg p-4 mb-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">Get Help</h3>
                <p className="text-sm text-gray-400">Our team will review and respond within 24 hours</p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-blue-400 mb-3">What's Included in the Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-300">
                <div>
                  <h4 className="font-medium mb-2">System Information</h4>
                  <ul className="space-y-1 text-blue-200/80">
                    <li>• Browser and operating system details</li>
                    <li>• Screen resolution and viewport size</li>
                    <li>• Network connection information</li>
                    <li>• Language and timezone settings</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Application Data</h4>
                  <ul className="space-y-1 text-blue-200/80">
                    <li>• Current page and user session info</li>
                    <li>• Recent user actions and navigation</li>
                    <li>• Console errors and warnings</li>
                    <li>• Network request history</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance Metrics</h4>
                  <ul className="space-y-1 text-blue-200/80">
                    <li>• Page load and render times</li>
                    <li>• Memory usage statistics</li>
                    <li>• Connection speed measurements</li>
                    <li>• Application responsiveness data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Privacy Protection</h4>
                  <ul className="space-y-1 text-blue-200/80">
                    <li>• No personal information collected</li>
                    <li>• No passwords or sensitive data</li>
                    <li>• Anonymous technical data only</li>
                    <li>• Secure transmission to support team</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DiagnosticReport />
        </div>
      </div>
      <Footer />
    </>
  );
}