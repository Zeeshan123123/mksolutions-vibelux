/**
 * Contractor Estimation Dashboard
 * Comprehensive cost estimation and project management interface
 */

import React, { useState } from 'react';
import { Calculator, DollarSign, Clock, TrendingUp, AlertTriangle, FileText, Users, Settings } from 'lucide-react';
import { logger } from '@/lib/logging/production-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ContractorEstimationEngine, 
  ProjectEstimate,
  ProjectData
} from '@/lib/construction/contractor-estimation';

interface ContractorDashboardProps {
  projectData?: ProjectData;
  onEstimateComplete?: (estimate: ProjectEstimate) => void;
}

export function ContractorDashboard({ onEstimateComplete }: ContractorDashboardProps) {
  const [activeTab, setActiveTab] = useState('estimate');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<ProjectEstimate | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    location: '',
    area: '',
    complexity: 'medium',
    startDate: '',
    scope: [] as string[]
  });

  const estimationEngine = new ContractorEstimationEngine();

  const handleCreateEstimate = async () => {
    if (!projectForm.name || !projectForm.location) {
      alert('Please fill in project name and location');
      return;
    }

    setLoading(true);
    try {
      const formData = {
        ...projectForm,
        area: parseFloat(projectForm.area) || 1000,
        startDate: new Date(projectForm.startDate || Date.now())
      };

      const newEstimate = await estimationEngine.createProjectEstimate(
        formData,
        projectForm.location,
        projectForm.scope.length > 0 ? projectForm.scope : ['Electrical Rough-In', 'LED Fixture Installation']
      );

      setEstimate(newEstimate);
      onEstimateComplete?.(newEstimate);
      setActiveTab('summary');
    } catch (error) {
      logger.error('system', 'Estimation failed:', error );
      alert('Failed to create estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addScopeItem = () => {
    const newItem = prompt('Enter scope item:');
    if (newItem) {
      setProjectForm(prev => ({
        ...prev,
        scope: [...prev.scope, newItem]
      }));
    }
  };

  const removeScopeItem = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      scope: prev.scope.filter((_, i) => i !== index)
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRiskColor = (probability: number) => {
    if (probability > 0.7) return 'text-red-600';
    if (probability > 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contractor Estimation Dashboard</h1>
          <p className="text-gray-600">Comprehensive cost estimation and project management</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          💼 Professional Tools
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="estimate">New Estimate</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* New Estimate Tab */}
        <TabsContent value="estimate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <Input
                    placeholder="Enter project name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    placeholder="City, State"
                    value={projectForm.location}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Area (SF)</label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={projectForm.area}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, area: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Complexity Level</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={projectForm.complexity}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, complexity: e.target.value }))}
                >
                  <option value="low">Low - Standard construction</option>
                  <option value="medium">Medium - Some special requirements</option>
                  <option value="high">High - Complex systems and coordination</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Scope of Work</label>
                  <Button size="sm" onClick={addScopeItem}>Add Item</Button>
                </div>
                <div className="space-y-2">
                  {projectForm.scope.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="flex-1">{item}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeScopeItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {projectForm.scope.length === 0 && (
                    <div className="text-gray-500 text-sm p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                      No scope items added. Default electrical scope will be used.
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCreateEstimate}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Generating Estimate...' : 'Create Estimate'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {estimate ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Project Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(estimate.summary.finalCost)}
                    </div>
                    <p className="text-sm text-gray-600">Including all overhead</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {estimate.schedule.totalDuration} days
                    </div>
                    <p className="text-sm text-gray-600">
                      {estimate.schedule.startDate.toLocaleDateString()} - {estimate.schedule.endDate.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {estimate.tasks.length}
                    </div>
                    <p className="text-sm text-gray-600">Construction activities</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Risk Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {estimate.riskFactors.length > 2 ? 'High' : estimate.riskFactors.length > 0 ? 'Medium' : 'Low'}
                    </div>
                    <p className="text-sm text-gray-600">{estimate.riskFactors.length} identified risks</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold">{formatCurrency(estimate.summary.totalLabor)}</div>
                        <div className="text-sm text-gray-600">Labor</div>
                        <div className="text-xs text-gray-500">
                          {((estimate.summary.totalLabor / estimate.summary.subtotal) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold">{formatCurrency(estimate.summary.totalMaterials)}</div>
                        <div className="text-sm text-gray-600">Materials</div>
                        <div className="text-xs text-gray-500">
                          {((estimate.summary.totalMaterials / estimate.summary.subtotal) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold">{formatCurrency(estimate.summary.totalEquipment)}</div>
                        <div className="text-sm text-gray-600">Equipment</div>
                        <div className="text-xs text-gray-500">
                          {((estimate.summary.totalEquipment / estimate.summary.subtotal) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold">{formatCurrency(estimate.summary.overheadCosts)}</div>
                        <div className="text-sm text-gray-600">Overhead</div>
                        <div className="text-xs text-gray-500">
                          {((estimate.summary.overheadCosts / estimate.summary.finalCost) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatCurrency(estimate.summary.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overhead & General Conditions</span>
                        <span className="font-medium">{formatCurrency(estimate.summary.overheadCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contingency ({estimate.overhead.contingency}%)</span>
                        <span className="font-medium">{formatCurrency(estimate.summary.contingency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bond ({estimate.overhead.bond}%)</span>
                        <span className="font-medium">{formatCurrency(estimate.summary.bondCost)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg font-bold">
                        <span>Total Project Cost</span>
                        <span>{formatCurrency(estimate.summary.finalCost)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Estimate Created</h3>
                <p className="text-gray-600 mb-4">Create a new estimate to see the project summary</p>
                <Button onClick={() => setActiveTab('estimate')}>
                  Create New Estimate
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cost Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          {estimate ? (
            <div className="space-y-4">
              {estimate.tasks.map((task, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{task.taskName}</CardTitle>
                        <p className="text-sm text-gray-600">{task.category} • {task.duration} days</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{formatCurrency(task.totalCost)}</div>
                        <div className="text-sm text-gray-600">
                          {task.productivity.toFixed(1)} {task.unit}/day
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Labor */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Labor
                        </h4>
                        <div className="space-y-1 text-sm">
                          {task.labor.map((labor, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{labor.trade} ({labor.hours}h)</span>
                              <span>{formatCurrency(labor.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Materials */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Materials
                        </h4>
                        <div className="space-y-1 text-sm">
                          {task.materials.map((material, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{material.id} ({material.quantity.toFixed(1)})</span>
                              <span>{formatCurrency(material.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Equipment */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Equipment
                        </h4>
                        <div className="space-y-1 text-sm">
                          {task.equipment.map((equipment, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{equipment.id} ({equipment.duration}d)</span>
                              <span>{formatCurrency(equipment.total)}</span>
                            </div>
                          ))}
                          {task.equipment.length === 0 && (
                            <div className="text-gray-500">No equipment required</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Cost Breakdown Available</h3>
                <p className="text-gray-600">Create an estimate to see detailed cost breakdown</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {estimate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Project Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold">{estimate.schedule.startDate.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600">Start Date</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold">{estimate.schedule.endDate.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600">End Date</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-bold">{estimate.schedule.totalDuration} days</div>
                      <div className="text-sm text-gray-600">Total Duration</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Critical Path</h4>
                    <div className="space-y-2">
                      {estimate.schedule.criticalPath.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{activity}</div>
                            <div className="text-sm text-gray-600">
                              {estimate.tasks.find(t => t.taskName === activity)?.duration || 0} days
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Schedule Available</h3>
                <p className="text-gray-600">Create an estimate to see project schedule</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-6">
          {estimate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estimate.riskFactors.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {risk.category}
                          </Badge>
                          <span className="font-medium">{risk.description}</span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getRiskColor(risk.probability)}`}>
                            {(risk.probability * 100).toFixed(0)}% probability
                          </div>
                          <div className="text-sm text-gray-600">
                            {((risk.impact - 1) * 100).toFixed(0)}% cost impact
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${risk.probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {estimate.riskFactors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No significant risks identified for this project.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Risk Analysis Available</h3>
                <p className="text-gray-600">Create an estimate to see risk analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Export Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FileText className="w-6 h-6 mb-2" />
                  <span>Detailed Estimate Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <DollarSign className="w-6 h-6 mb-2" />
                  <span>Cost Summary</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Clock className="w-6 h-6 mb-2" />
                  <span>Schedule Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <AlertTriangle className="w-6 h-6 mb-2" />
                  <span>Risk Assessment</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}