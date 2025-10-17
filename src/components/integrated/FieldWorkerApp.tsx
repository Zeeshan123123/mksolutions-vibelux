'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Camera, MapPin, Bug, Clock, CheckCircle, 
  AlertTriangle, Send, User, Calendar, Droplets as Spray, Target,
  FileText, Navigation, Shield, TrendingUp, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { pestManagement } from '@/lib/pest-management/pest-detection-service';

interface WorkerSession {
  workerId: string;
  workerName: string;
  startTime: Date;
  currentZone?: string;
  currentTask?: string;
  tasksCompleted: number;
  hoursWorked: number;
  scansToday: number;
}

interface PestReport {
  id: string;
  timestamp: Date;
  location: {
    zone: string;
    row?: number;
    plant?: string;
    gps: { lat: number; lng: number; accuracy: number };
  };
  pest: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  };
  photos: string[];
  notes: string;
  ipmProtocol?: {
    treatment: string;
    urgency: string;
    assigned: string;
  };
}

export function FieldWorkerApp() {
  const [session, setSession] = useState<WorkerSession | null>(null);
  const [currentMode, setCurrentMode] = useState<'clock' | 'scout' | 'task'>('clock');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<GeolocationCoordinates | null>(null);
  const [currentZone, setCurrentZone] = useState<string>('');
  const [pestReports, setPestReports] = useState<PestReport[]>([]);
  const [activeReport, setActiveReport] = useState<Partial<PestReport>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Initialize GPS tracking
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setGpsLocation(position.coords);
        },
        (error) => console.error('GPS error:', error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // QR Code Scanner Handler
  const handleQRScan = async (qrData: string) => {
    try {
      // Parse QR code data
      const parsed = JSON.parse(qrData);
      
      if (parsed.type === 'zone') {
        // Worker entering a zone - clock in/update location
        setCurrentZone(parsed.zoneId);
        
        if (!session) {
          // Clock in
          const newSession: WorkerSession = {
            workerId: 'worker_001', // In production, get from auth
            workerName: 'John Smith',
            startTime: new Date(),
            currentZone: parsed.zoneId,
            currentTask: parsed.task,
            tasksCompleted: 0,
            hoursWorked: 0,
            scansToday: 1
          };
          setSession(newSession);
          
          // Record clock-in
          await fetch('/api/labor/clock-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workerId: newSession.workerId,
              zoneId: parsed.zoneId,
              timestamp: new Date(),
              gps: gpsLocation ? {
                lat: gpsLocation.latitude,
                lng: gpsLocation.longitude
              } : null
            })
          });
          
          toast({
            title: "Clocked In",
            description: `Welcome! You're now working in ${parsed.zoneName}`,
          });
        } else {
          // Update location
          setSession(prev => prev ? {
            ...prev,
            currentZone: parsed.zoneId,
            scansToday: prev.scansToday + 1
          } : null);
          
          toast({
            title: "Location Updated",
            description: `Now in ${parsed.zoneName}`,
          });
        }
      } else if (parsed.type === 'plant') {
        // Scanning specific plant for inspection
        setActiveReport(prev => ({
          ...prev,
          location: {
            zone: currentZone,
            plant: parsed.plantId,
            row: parsed.row,
            gps: gpsLocation ? {
              lat: gpsLocation.latitude,
              lng: gpsLocation.longitude,
              accuracy: gpsLocation.accuracy
            } : { lat: 0, lng: 0, accuracy: 0 }
          }
        }));
        
        setCurrentMode('scout');
        toast({
          title: "Plant Scanned",
          description: `Inspecting ${parsed.plantId}. Report any issues found.`,
        });
      } else if (parsed.type === 'task') {
        // Task-specific QR code
        await completeTask(parsed.taskId);
      }
      
      setScannerActive(false);
    } catch (error) {
      console.error('QR scan error:', error);
      toast({
        title: "Scan Error",
        description: "Invalid QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Camera capture for pest photos
  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append('image', blob, `pest_${Date.now()}.jpg`);
          formData.append('location', JSON.stringify({
            zone: currentZone,
            gps: gpsLocation ? {
              lat: gpsLocation.latitude,
              lng: gpsLocation.longitude
            } : null
          }));
          
          // AI pest detection
          const response = await fetch('/api/pest-detection', {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          if (result.detected) {
            setActiveReport(prev => ({
              ...prev,
              pest: {
                type: result.pestType,
                severity: result.severity,
                confidence: result.confidence
              },
              photos: [...(prev.photos || []), result.imageUrl]
            }));
            
            toast({
              title: "Pest Detected!",
              description: `${result.pestType} identified with ${result.confidence}% confidence`,
              variant: result.severity === 'high' ? "destructive" : "default"
            });
            
            // Auto-generate IPM protocol if high severity
            if (result.severity === 'high' || result.severity === 'critical') {
              generateIPMProtocol(result);
            }
          }
        }
      }, 'image/jpeg', 0.8);
      
      setCameraActive(false);
    }
  };

  // Generate IPM treatment protocol
  const generateIPMProtocol = async (detection: any) => {
    const protocol = await pestManagement.getTreatmentProtocol(
      {
        id: `detect_${Date.now()}`,
        timestamp: new Date(),
        location: {
          facilityId: 'facility_001',
          zoneId: currentZone
        },
        detection: {
          type: 'pest',
          name: detection.pestType,
          confidence: detection.confidence,
          severity: detection.severity,
          stage: 'early'
        },
        affectedArea: {
          plantsAffected: 1,
          percentageOfZone: 0.1,
          spreadRate: 0
        }
      },
      'cannabis', // crop type
      { organic: true }
    );
    
    setActiveReport(prev => ({
      ...prev,
      ipmProtocol: {
        treatment: protocol.treatments[0]?.name || 'Manual inspection',
        urgency: detection.severity === 'critical' ? 'IMMEDIATE' : '24 hours',
        assigned: 'IPM Team'
      }
    }));
  };

  // Submit pest report
  const submitPestReport = async () => {
    if (!activeReport.pest || !activeReport.location) {
      toast({
        title: "Incomplete Report",
        description: "Please capture a photo and identify the pest",
        variant: "destructive"
      });
      return;
    }
    
    const report: PestReport = {
      id: `report_${Date.now()}`,
      timestamp: new Date(),
      location: activeReport.location as any,
      pest: activeReport.pest as any,
      photos: activeReport.photos || [],
      notes: activeReport.notes || '',
      ipmProtocol: activeReport.ipmProtocol
    };
    
    // Save report
    await fetch('/api/pest-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    
    setPestReports(prev => [...prev, report]);
    setActiveReport({});
    
    toast({
      title: "Report Submitted",
      description: "IPM team has been notified. Treatment will begin soon.",
    });
    
    // If critical, send immediate alert
    if (report.pest.severity === 'critical') {
      await fetch('/api/alerts/critical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pest_critical',
          location: report.location,
          message: `CRITICAL: ${report.pest.type} detected in ${currentZone}`,
          assignTo: ['ipm_manager', 'facility_manager']
        })
      });
    }
  };

  // Complete a task
  const completeTask = async (taskId: string) => {
    await fetch('/api/tasks/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId,
        workerId: session?.workerId,
        completedAt: new Date(),
        location: currentZone,
        gps: gpsLocation ? {
          lat: gpsLocation.latitude,
          lng: gpsLocation.longitude
        } : null
      })
    });
    
    setSession(prev => prev ? {
      ...prev,
      tasksCompleted: prev.tasksCompleted + 1
    } : null);
    
    toast({
      title: "Task Completed",
      description: "Great work! Task has been marked as complete.",
    });
  };

  // Clock out
  const clockOut = async () => {
    if (!session) return;
    
    await fetch('/api/labor/clock-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: session.workerId,
        timestamp: new Date(),
        tasksCompleted: session.tasksCompleted,
        hoursWorked: (new Date().getTime() - session.startTime.getTime()) / 3600000
      })
    });
    
    setSession(null);
    toast({
      title: "Clocked Out",
      description: `Great work today! You completed ${session.tasksCompleted} tasks.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">VibeLux Field Worker</h1>
            {session && (
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{session.workerName}</span>
                <Badge variant="outline">{currentZone || 'No Zone'}</Badge>
              </div>
            )}
          </div>
          {session && (
            <Button onClick={clockOut} variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Clock Out
            </Button>
          )}
        </div>

        {/* GPS Status */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className={`w-4 h-4 ${gpsLocation ? 'text-green-500' : 'text-gray-400'}`} />
          {gpsLocation ? (
            <span className="text-green-600 dark:text-green-400">
              GPS Active ({gpsLocation.accuracy.toFixed(0)}m accuracy)
            </span>
          ) : (
            <span className="text-gray-500">GPS Acquiring...</span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Button 
          onClick={() => setScannerActive(true)}
          className="h-24 flex-col gap-2"
          variant={currentMode === 'clock' ? 'default' : 'outline'}
        >
          <QrCode className="w-6 h-6" />
          <span className="text-xs">Scan QR</span>
        </Button>
        <Button 
          onClick={() => setCurrentMode('scout')}
          className="h-24 flex-col gap-2"
          variant={currentMode === 'scout' ? 'default' : 'outline'}
        >
          <Bug className="w-6 h-6" />
          <span className="text-xs">Report Pest</span>
        </Button>
        <Button 
          onClick={() => setCurrentMode('task')}
          className="h-24 flex-col gap-2"
          variant={currentMode === 'task' ? 'default' : 'outline'}
        >
          <CheckCircle className="w-6 h-6" />
          <span className="text-xs">Tasks</span>
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={currentMode} onValueChange={(v: any) => setCurrentMode(v)}>
        <TabsContent value="clock">
          <Card>
            <CardHeader>
              <CardTitle>Work Session</CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Time Worked</p>
                      <p className="text-2xl font-bold">
                        {Math.floor((new Date().getTime() - session.startTime.getTime()) / 3600000)}h 
                        {Math.floor(((new Date().getTime() - session.startTime.getTime()) % 3600000) / 60000)}m
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tasks Done</p>
                      <p className="text-2xl font-bold">{session.tasksCompleted}</p>
                    </div>
                  </div>
                  <Alert>
                    <AlertDescription>
                      Scan zone QR codes as you move through the facility to track your location.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Scan a zone QR code to clock in
                  </p>
                  <Button onClick={() => setScannerActive(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Start Scanner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scout">
          <Card>
            <CardHeader>
              <CardTitle>Pest Scouting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location Info */}
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Current Location</span>
                  </div>
                  <Badge>{currentZone || 'Unknown'}</Badge>
                </div>
                {activeReport.location?.plant && (
                  <p className="text-sm text-gray-600 mt-1">
                    Plant: {activeReport.location.plant}
                  </p>
                )}
              </div>

              {/* Camera Capture */}
              <div>
                <Button 
                  onClick={() => setCameraActive(true)} 
                  className="w-full"
                  variant="outline"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo of Pest/Disease
                </Button>
                {activeReport.photos && activeReport.photos.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {activeReport.photos.length} photo(s) captured
                  </p>
                )}
              </div>

              {/* Pest Detection Result */}
              {activeReport.pest && (
                <Alert className={
                  activeReport.pest.severity === 'critical' ? 'border-red-500' :
                  activeReport.pest.severity === 'high' ? 'border-orange-500' :
                  activeReport.pest.severity === 'medium' ? 'border-yellow-500' :
                  'border-green-500'
                }>
                  <Bug className="w-4 h-4" />
                  <AlertDescription>
                    <strong>{activeReport.pest.type}</strong> detected
                    <br />
                    Severity: <Badge variant={
                      activeReport.pest.severity === 'critical' ? 'destructive' : 'default'
                    }>{activeReport.pest.severity}</Badge>
                    <br />
                    Confidence: {activeReport.pest.confidence}%
                  </AlertDescription>
                </Alert>
              )}

              {/* IPM Protocol */}
              {activeReport.ipmProtocol && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      IPM Protocol Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Treatment:</span>
                      <strong>{activeReport.ipmProtocol.treatment}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Urgency:</span>
                      <Badge variant={
                        activeReport.ipmProtocol.urgency === 'IMMEDIATE' ? 'destructive' : 'default'
                      }>{activeReport.ipmProtocol.urgency}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned:</span>
                      <span>{activeReport.ipmProtocol.assigned}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                <Textarea
                  placeholder="Describe what you see..."
                  value={activeReport.notes || ''}
                  onChange={(e) => setActiveReport(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={submitPestReport}
                className="w-full"
                disabled={!activeReport.pest}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="task">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock tasks - in production, fetch from API */}
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">Check Zone A irrigation</p>
                    <p className="text-sm text-gray-500">Due by 10:00 AM</p>
                  </div>
                  <Button size="sm" onClick={() => completeTask('task_001')}>
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">Scout rows 15-20 for pests</p>
                    <p className="text-sm text-gray-500">Priority: High</p>
                  </div>
                  <Button size="sm" onClick={() => completeTask('task_002')}>
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Reports */}
      {pestReports.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Recent Pest Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pestReports.slice(-3).map(report => (
                <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-3">
                    <Bug className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{report.pest.type}</p>
                      <p className="text-xs text-gray-500">Zone {report.location.zone}</p>
                    </div>
                  </div>
                  <Badge variant={
                    report.pest.severity === 'critical' ? 'destructive' :
                    report.pest.severity === 'high' ? 'destructive' :
                    'default'
                  }>{report.pest.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {scannerActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                {/* QR scanner would go here */}
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <Button 
                onClick={() => {
                  // Simulate QR scan
                  handleQRScan(JSON.stringify({
                    type: 'zone',
                    zoneId: 'zone_a1',
                    zoneName: 'Zone A1 - Vegetative',
                    task: 'General Inspection'
                  }));
                }}
                className="w-full mt-4"
              >
                Simulate Scan
              </Button>
              <Button 
                onClick={() => setScannerActive(false)}
                variant="outline"
                className="w-full mt-2"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Camera Modal */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Capture Pest Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <video ref={videoRef} className="w-full rounded-lg" />
              <canvas ref={canvasRef} className="hidden" />
              <Button onClick={capturePhoto} className="w-full mt-4">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              <Button 
                onClick={() => setCameraActive(false)}
                variant="outline"
                className="w-full mt-2"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}