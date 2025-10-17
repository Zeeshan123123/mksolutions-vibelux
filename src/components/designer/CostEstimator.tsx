import React, { useMemo } from 'react';
import { DollarSign, Package, Wrench, Zap, Receipt } from 'lucide-react';

interface CostEstimatorProps {
  fixtures: any[];
  room: any;
  powerMetrics: any;
  onClose: () => void;
}

export default function CostEstimator({ fixtures, room, powerMetrics, onClose }: CostEstimatorProps) {
  const costs = useMemo(() => {
    const fixtureUnitCost = 799; // Base price per fixture
    const installationPerFixture = 150;
    const electricalPerCircuit = 500;
    const controlSystemBase = 2500;
    
    const fixturesCost = fixtures.length * fixtureUnitCost;
    const installationCost = fixtures.length * installationPerFixture;
    
    // Calculate circuits needed (assume 20A circuits, 80% rule)
    const totalAmps = (powerMetrics?.totalPower || 0) / 120; // Assuming 120V
    const circuitsNeeded = Math.ceil(totalAmps / 16); // 80% of 20A
    const electricalCost = circuitsNeeded * electricalPerCircuit;
    
    const controlSystemCost = fixtures.length > 10 ? controlSystemBase : 0;
    
    const subtotal = fixturesCost + installationCost + electricalCost + controlSystemCost;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    return {
      fixturesCost,
      installationCost,
      electricalCost,
      controlSystemCost,
      circuitsNeeded,
      subtotal,
      tax,
      total,
      pricePerSqFt: total / (room.dimensions.length * room.dimensions.width)
    };
  }, [fixtures, room, powerMetrics]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Itemized Cost Breakdown
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              <span>Fixtures ({fixtures.length} units × ${799})</span>
            </div>
            <span className="font-semibold">${costs.fixturesCost.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>Installation Labor</span>
            </div>
            <span className="font-semibold">${costs.installationCost.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Electrical ({costs.circuitsNeeded} circuits)</span>
            </div>
            <span className="font-semibold">${costs.electricalCost.toLocaleString()}</span>
          </div>
          
          {costs.controlSystemCost > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>Control System</span>
              </div>
              <span className="font-semibold">${costs.controlSystemCost.toLocaleString()}</span>
            </div>
          )}
          
          <div className="border-t border-gray-600 pt-3">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-semibold">${costs.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax (8%)</span>
              <span className="font-semibold">${costs.tax.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-3">
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold">Total</span>
              <span className="font-bold text-green-400">${costs.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
              <span>Price per sq ft</span>
              <span>${costs.pricePerSqFt.toFixed(2)}/sq ft</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-4">
        <p className="text-sm text-yellow-300">
          <strong>Note:</strong> These are estimated costs. Actual prices may vary based on location, 
          vendor pricing, and specific installation requirements. Contact a Vibelux representative 
          for a detailed quote.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Optional Add-ons</h4>
          <ul className="space-y-1 text-sm">
            <li>• Environmental sensors: $1,200</li>
            <li>• CO2 supplementation: $3,500</li>
            <li>• Remote monitoring: $99/month</li>
            <li>• Extended warranty: $150/fixture</li>
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Financing Options</h4>
          <ul className="space-y-1 text-sm">
            <li>• 0% APR for 12 months</li>
            <li>• Equipment lease: $850/month</li>
            <li>• Energy savings financing</li>
            <li>• Government rebates available</li>
          </ul>
        </div>
      </div>
    </div>
  );
}