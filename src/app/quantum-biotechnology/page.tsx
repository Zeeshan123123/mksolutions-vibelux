"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Dna, FlaskConical, Brain } from 'lucide-react';

export default function QuantumBiotechnologyPage() {
  const router = useRouter();

  // Redirect to Research Suite after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/research');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <FlaskConical className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold">Advanced Biotechnology Research</h1>
          <Dna className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced research tools and statistical analysis for precision agriculture 
          and crop optimization research.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            Research Enhanced
          </Badge>
        </div>
      </div>

      {/* Redirect Notice */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Redirecting to Research Suite
          </CardTitle>
          <CardDescription>
            Our advanced research tools have been consolidated into the Research Suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You'll be automatically redirected to our comprehensive Research Suite, which includes:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Statistical analysis (ANOVA, regression)</li>
            <li>• Experimental design tools</li>
            <li>• Research paper integration</li>
            <li>• Mobile data collection</li>
            <li>• AI-assisted research insights</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}