/**
 * TM-21 Lifetime Calculator for LED Lighting
 * Calculates LED lifetime projections based on TM-21 standard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Calculator, Lightbulb, AlertCircle } from 'lucide-react';

interface TM21Data {
  testHours: number;
  initialLumen: number;
  measuredLumen: number;
  testTemperature: number;
  operatingTemperature: number;
  driverCurrent: number;
}

interface TM21Results {
  L70: number; // Hours to 70% lumen maintenance
  L80: number; // Hours to 80% lumen maintenance
  L90: number; // Hours to 90% lumen maintenance
  projectedLifetime: number;
  annualDepreciation: number;
  chartData: Array<{ hours: number; lumenPercent: number }>;
}

export const TM21LifetimeCalculator: React.FC = () => {
  const [data, setData] = useState<TM21Data>({
    testHours: 6000,
    initialLumen: 10000,
    measuredLumen: 9500,
    testTemperature: 55,
    operatingTemperature: 45,
    driverCurrent: 700
  });

  const [results, setResults] = useState<TM21Results | null>(null);
  const [error, setError] = useState<string>('');

  const calculateTM21 = () => {
    try {
      setError('');
      
      // Validate inputs
      if (data.testHours < 6000) {
        setError('Test duration must be at least 6,000 hours per TM-21 standard');
        return;
      }

      // Calculate lumen maintenance factor
      const lumenMaintenance = data.measuredLumen / data.initialLumen;
      
      // Temperature acceleration factor (simplified Arrhenius equation)
      const activationEnergy = 0.7; // eV, typical for LEDs
      const boltzmannConstant = 8.617e-5; // eV/K
      const tempFactorTest = Math.exp(-activationEnergy / (boltzmannConstant * (data.testTemperature + 273.15)));
      const tempFactorOp = Math.exp(-activationEnergy / (boltzmannConstant * (data.operatingTemperature + 273.15)));
      const temperatureAcceleration = tempFactorTest / tempFactorOp;

      // Calculate decay rate
      const decayRate = -Math.log(lumenMaintenance) / data.testHours;
      const adjustedDecayRate = decayRate / temperatureAcceleration;

      // Project lifetimes
      const L90 = Math.log(0.9) / (-adjustedDecayRate);
      const L80 = Math.log(0.8) / (-adjustedDecayRate);
      const L70 = Math.log(0.7) / (-adjustedDecayRate);

      // TM-21 projection limit (6x test duration)
      const projectionLimit = data.testHours * 6;
      const projectedLifetime = Math.min(L70, projectionLimit);

      // Annual depreciation
      const annualHours = 8760; // 24/7 operation
      const annualDepreciation = (1 - Math.exp(-adjustedDecayRate * annualHours)) * 100;

      // Generate chart data
      const chartData = [];
      const maxHours = Math.min(L70 * 1.2, 100000);
      const step = maxHours / 50;
      
      for (let hours = 0; hours <= maxHours; hours += step) {
        const lumenPercent = Math.exp(-adjustedDecayRate * hours) * 100;
        chartData.push({ hours: Math.round(hours), lumenPercent: Math.round(lumenPercent * 10) / 10 });
      }

      setResults({
        L70: Math.round(L70),
        L80: Math.round(L80),
        L90: Math.round(L90),
        projectedLifetime: Math.round(projectedLifetime),
        annualDepreciation: Math.round(annualDepreciation * 10) / 10,
        chartData
      });
    } catch (err) {
      setError('Error calculating TM-21 projections');
      console.error(err);
    }
  };

  const updateField = (field: keyof TM21Data, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          TM-21 LED Lifetime Calculator
        </CardTitle>
        <CardDescription>
          Calculate LED lifetime projections based on IES TM-21-11 standard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testHours">Test Duration (hours)</Label>
            <Input
              id="testHours"
              type="number"
              value={data.testHours}
              onChange={(e) => updateField('testHours', e.target.value)}
              min="6000"
            />
            <p className="text-sm text-gray-500">Minimum 6,000 hours required</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initialLumen">Initial Lumen Output</Label>
            <Input
              id="initialLumen"
              type="number"
              value={data.initialLumen}
              onChange={(e) => updateField('initialLumen', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="measuredLumen">Measured Lumen at Test End</Label>
            <Input
              id="measuredLumen"
              type="number"
              value={data.measuredLumen}
              onChange={(e) => updateField('measuredLumen', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testTemperature">Test Temperature (°C)</Label>
            <Input
              id="testTemperature"
              type="number"
              value={data.testTemperature}
              onChange={(e) => updateField('testTemperature', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="operatingTemperature">Operating Temperature (°C)</Label>
            <Input
              id="operatingTemperature"
              type="number"
              value={data.operatingTemperature}
              onChange={(e) => updateField('operatingTemperature', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="driverCurrent">Driver Current (mA)</Label>
            <Input
              id="driverCurrent"
              type="number"
              value={data.driverCurrent}
              onChange={(e) => updateField('driverCurrent', e.target.value)}
            />
          </div>
        </div>

        <Button onClick={calculateTM21} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate TM-21 Projections
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">L90 Lifetime</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.L90.toLocaleString()} hrs</p>
                  <p className="text-sm text-gray-500">{(results.L90 / 8760).toFixed(1)} years</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">L80 Lifetime</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.L80.toLocaleString()} hrs</p>
                  <p className="text-sm text-gray-500">{(results.L80 / 8760).toFixed(1)} years</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">L70 Lifetime</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.L70.toLocaleString()} hrs</p>
                  <p className="text-sm text-gray-500">{(results.L70 / 8760).toFixed(1)} years</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Projected Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>TM-21 Projected Lifetime:</span>
                    <span className="font-semibold">{results.projectedLifetime.toLocaleString()} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Light Depreciation:</span>
                    <span className="font-semibold">{results.annualDepreciation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance Factor at EOL:</span>
                    <span className="font-semibold">70%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lumen Maintenance Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart width={700} height={300} data={results.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hours" 
                    label={{ value: 'Operating Hours', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Lumen Output (%)', angle: -90, position: 'insideLeft' }}
                    domain={[60, 100]}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="lumenPercent" 
                    stroke="#8884d8" 
                    name="Lumen Maintenance"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={() => 70} 
                    stroke="#ff0000" 
                    name="L70 Threshold"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </CardContent>
            </Card>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> TM-21 limits projections to 6x the test duration. 
                Actual lifetime may exceed projected values. Consider safety factors for 
                critical applications.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TM21LifetimeCalculator;