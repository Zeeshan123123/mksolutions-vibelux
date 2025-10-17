'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Keyboard, 
  HelpCircle, 
  Sparkles, 
  Send, 
  Zap,
  Copy,
  Save,
  Undo,
  Redo,
  Grid,
  Move,
  Plus,
  Trash2,
  Download,
  Share2,
  Eye,
  Command,
  Bug
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { DebugGuide } from './DebugGuide';

interface HelpAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCredits: number;
  onUseCredits: (amount: number) => void;
  room: any;
  fixtures: any[];
}

const shortcuts = [
  { category: 'File Operations', items: [
    { keys: ['Ctrl', 'S'], mac: ['⌘', 'S'], description: 'Save project' },
    { keys: ['Ctrl', 'O'], mac: ['⌘', 'O'], description: 'Open project' },
    { keys: ['Ctrl', 'N'], mac: ['⌘', 'N'], description: 'New project' },
  ]},
  { category: 'Edit Operations', items: [
    { keys: ['Ctrl', 'Z'], mac: ['⌘', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], mac: ['⌘', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Delete'], mac: ['Delete'], description: 'Delete selected fixture' },
    { keys: ['Ctrl', 'D'], mac: ['⌘', 'D'], description: 'Duplicate fixture' },
    { keys: ['Ctrl', 'A'], mac: ['⌘', 'A'], description: 'Select all fixtures' },
  ]},
  { category: 'View Controls', items: [
    { keys: ['G'], mac: ['G'], description: 'Toggle grid' },
    { keys: ['M'], mac: ['M'], description: 'Toggle metrics' },
    { keys: ['Space'], mac: ['Space'], description: 'Pan view (hold)' },
    { keys: ['Scroll'], mac: ['Scroll'], description: 'Zoom in/out' },
  ]},
  { category: 'Design Tools', items: [
    { keys: ['A'], mac: ['A'], description: 'Auto layout' },
    { keys: ['R'], mac: ['R'], description: 'Rotate fixture' },
    { keys: ['Arrow Keys'], mac: ['Arrow Keys'], description: 'Move fixture' },
    { keys: ['Shift', 'Arrow'], mac: ['Shift', 'Arrow'], description: 'Move fixture precisely' },
  ]},
  { category: 'Help', items: [
    { keys: ['?'], mac: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['F1'], mac: ['F1'], description: 'Open help' },
  ]}
];

const aiPrompts = [
  { prompt: "Optimize my layout for maximum uniformity", credits: 10 },
  { prompt: "Suggest the best spectrum for flowering", credits: 5 },
  { prompt: "Calculate optimal fixture height", credits: 5 },
  { prompt: "Analyze my current design efficiency", credits: 10 },
  { prompt: "Recommend fixtures for my space", credits: 15 },
];

export default function HelpAssistanceModal({
  isOpen,
  onClose,
  userCredits,
  onUseCredits,
  room,
  fixtures
}: HelpAssistanceModalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'shortcuts' | 'help' | 'debug'>('ai');
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;
    
    if (userCredits < 10) {
      toast({
        title: 'Insufficient Credits',
        description: 'You need at least 10 credits to use AI assistance.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    onUseCredits(10);

    // Simulate AI processing
    setTimeout(() => {
      const mockResponses = [
        `Based on your ${room.dimensions.length}x${room.dimensions.width} ${room.unit} space with ${fixtures.length} fixtures, I recommend:
        
1. **Spacing**: Maintain 3-4 feet between fixtures for optimal coverage
2. **Height**: Set fixtures 18-24 inches above canopy
3. **Coverage**: Your current setup provides approximately ${Math.floor(700 + Math.random() * 200)} PPFD average
4. **Uniformity**: Current uniformity ratio is ${(0.7 + Math.random() * 0.2).toFixed(2)}

Would you like me to apply an optimized layout automatically?`,
        
        `For your grow space, here's my analysis:
        
• **Power Efficiency**: ${(fixtures.length * 480 / (room.dimensions.length * room.dimensions.width)).toFixed(1)} W/sq ft
• **DLI Target**: 35-45 mol/m²/day for flowering
• **Spectrum**: Add more 660nm red for flowering boost
• **Heat Load**: Approximately ${(fixtures.length * 480 * 3.41).toFixed(0)} BTU/hr

Consider adding ${Math.max(0, Math.floor((room.dimensions.length * room.dimensions.width) / 25) - fixtures.length)} more fixtures for optimal coverage.`
      ];

      setAiResponse(mockResponses[Math.floor(Math.random() * mockResponses.length)]);
      setIsProcessing(false);
    }, 2000);
  };

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-800 text-white border-gray-700 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Help & AI Assistant</DialogTitle>
          <DialogDescription className="text-gray-400">
            Get AI-powered suggestions, view shortcuts, or access help documentation
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-700">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Help
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-4">
            <div className="space-y-4">
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI Design Assistant
                    </CardTitle>
                    <Badge variant="secondary" className="bg-purple-900/30 text-purple-400">
                      {userCredits} credits
                    </Badge>
                  </div>
                  <CardDescription>
                    Ask questions about your lighting design or get optimization suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick prompts */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Quick prompts:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiPrompts.map((prompt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => setAiInput(prompt.prompt)}
                          className="text-xs"
                        >
                          {prompt.prompt}
                          <Badge variant="secondary" className="ml-2 bg-gray-700">
                            {prompt.credits} <Zap className="w-3 h-3 ml-1" />
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ask me anything about your lighting design..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      className="min-h-[100px] bg-gray-700 border-gray-600"
                    />
                    <Button
                      onClick={handleAiSubmit}
                      disabled={isProcessing || userCredits < 10}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Ask AI (10 credits)
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Response area */}
                  {aiResponse && (
                    <Card className="border-gray-600 bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-sm text-white">AI Response</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <div className="whitespace-pre-wrap text-sm text-gray-300">
                            {aiResponse}
                          </div>
                        </ScrollArea>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(aiResponse);
                            toast({ title: 'Copied to clipboard' });
                          }}
                          className="mt-2"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-6">
                {shortcuts.map((category) => (
                  <Card key={category.category} className="border-gray-700 bg-gray-900">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.items.map((shortcut, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-800"
                          >
                            <span className="text-gray-300">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {(isMac ? shortcut.mac : shortcut.keys).map((key, keyIdx) => (
                                <React.Fragment key={keyIdx}>
                                  {keyIdx > 0 && <span className="text-gray-500">+</span>}
                                  <kbd className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded">
                                    {key}
                                  </kbd>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="help" className="mt-4">
            <div className="space-y-4">
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-300">
                  <div>
                    <h4 className="font-semibold text-white mb-2">1. Add Fixtures</h4>
                    <p className="text-sm">
                      Select fixtures from the sidebar library and click to place them in your space.
                      Drag to move, scroll to adjust height.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">2. Optimize Layout</h4>
                    <p className="text-sm">
                      Use the Auto Layout button or manually adjust fixtures for optimal coverage.
                      Check the heat map view to visualize light distribution.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">3. Analyze Performance</h4>
                    <p className="text-sm">
                      Switch between analysis tabs to view spectrum, DLI, energy costs, and environmental impact.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">4. Export & Share</h4>
                    <p className="text-sm">
                      Save your design, export reports, or share with colleagues using the project management tools.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">Tips & Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-900/30 text-green-400 mt-0.5">TIP</Badge>
                    <p>Maintain 18-24" between fixtures and canopy for optimal light distribution</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-blue-900/30 text-blue-400 mt-0.5">TIP</Badge>
                    <p>Target 700-900 PPFD for flowering, 400-600 PPFD for vegetative growth</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-purple-900/30 text-purple-400 mt-0.5">TIP</Badge>
                    <p>Use the DLI optimizer to ensure plants receive adequate daily light integral</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-yellow-900/30 text-yellow-400 mt-0.5">TIP</Badge>
                    <p>Check electrical load balance to avoid overloading circuits</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => window.open('/docs/designer', '_blank')}>
                  View Documentation
                </Button>
                <Button variant="outline" onClick={() => window.open('/support', '_blank')}>
                  Contact Support
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="mt-4">
            <DebugGuide />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}