/**
 * Interactive Utility Connection Demo
 * Shows the 30-second utility connection process
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Zap, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UtilityConnectionDemo() {
  const [demoState, setDemoState] = useState<'idle' | 'connecting' | 'analyzing' | 'complete'>('idle');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [savingsFound, setSavingsFound] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (demoState === 'connecting') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      // Simulate connection process
      setTimeout(() => setDemoState('analyzing'), 3000);
    } else if (demoState === 'analyzing') {
      // Simulate analysis with incrementing savings
      const savingsInterval = setInterval(() => {
        setSavingsFound(prev => Math.min(prev + Math.random() * 5000, 47280));
      }, 100);
      
      setTimeout(() => {
        clearInterval(savingsInterval);
        setSavingsFound(47280);
        setDemoState('complete');
      }, 3000);
      
      return () => clearInterval(savingsInterval);
    }
    
    return () => clearInterval(interval);
  }, [demoState]);

  const resetDemo = () => {
    setDemoState('idle');
    setTimeElapsed(0);
    setSavingsFound(0);
  };

  const utilities = [
    { name: 'PG&E', logo: '🔌' },
    { name: 'ConEd', logo: '⚡' },
    { name: 'SCE', logo: '💡' },
    { name: 'ComEd', logo: '🔋' },
  ];

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          See The Magic in Action
        </h2>
        <p className="text-gray-600">
          Watch how fast businesses connect their utilities and find savings
        </p>
      </div>

      <AnimatePresence mode="wait">
        {demoState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {utilities.map((utility) => (
                <div
                  key={utility.name}
                  className="border rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="text-3xl mb-2">{utility.logo}</div>
                  <p className="font-medium">{utility.name}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setDemoState('connecting')}
                className="bg-gradient-to-r from-blue-600 to-green-600"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Demo Connection
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                No real account needed - this is just a demo
              </p>
            </div>
          </motion.div>
        )}

        {demoState === 'connecting' && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 rounded-full mx-auto">
                <div className="w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Connecting to PG&E...</h3>
              <p className="text-gray-600">Securely authorizing access to your utility data</p>
              <p className="text-2xl font-bold text-blue-600 mt-4">{timeElapsed}s</p>
            </div>
          </motion.div>
        )}

        {demoState === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <TrendingUp className="h-16 w-16 text-green-600 mx-auto animate-pulse" />
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Analyzing 12 Months of Data...</h3>
              <p className="text-gray-600">AI scanning for savings opportunities</p>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Demand charge optimization found</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Better rate schedule available</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Peak usage patterns identified</span>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-3xl font-bold text-green-600">
                  ${savingsFound.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Annual savings identified</p>
              </div>
            </div>
          </motion.div>
        )}

        {demoState === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto" />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Connection Complete!</h3>
              <p className="text-gray-600 mb-6">Total time: {timeElapsed} seconds</p>
              
              <Card className="p-6 bg-green-50 border-green-200 max-w-md mx-auto">
                <h4 className="font-semibold mb-4">Your Savings Breakdown:</h4>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span>Annual Savings Found:</span>
                    <span className="font-bold">${savingsFound.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Share (70%):</span>
                    <span className="font-bold text-green-600">
                      ${Math.round(savingsFound * 0.7).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>VibeLux Fee (30%):</span>
                    <span>${Math.round(savingsFound * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Your Investment:</span>
                    <span className="text-green-600">$0</span>
                  </div>
                </div>
              </Card>
              
              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Start Saving Today
                </Button>
                <Button
                  variant="outline"
                  onClick={resetDemo}
                >
                  Run Demo Again
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-8 border-t">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">30 seconds</p>
            <p className="text-sm text-gray-600">Average connection time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">28%</p>
            <p className="text-sm text-gray-600">Average cost reduction</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">$0</p>
            <p className="text-sm text-gray-600">Upfront investment</p>
          </div>
        </div>
      </div>
    </Card>
  );
}