'use client';

import { useState } from 'react';
import { 
  Wifi, 
  Database, 
  Shield, 
  Cloud,
  Server,
  Cpu,
  Copy,
  Check,
  AlertCircle,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export function IntegrationGuides() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'bash', id }: { code: string; language?: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Integration Guides</h1>
        <p className="text-gray-300 text-lg">
          Connect VibeLux with your existing equipment, sensors, and systems. 
          We support industry-standard protocols and provide easy integration paths.
        </p>
      </div>

      {/* Sensor Integration */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Sensor Integration</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">MQTT Integration</h3>
            <p className="text-gray-400 mb-4">
              Connect any MQTT-enabled sensor to VibeLux for real-time monitoring:
            </p>
            
            <CodeBlock 
              id="mqtt-config"
              code={`# MQTT Configuration Example
{
  "broker": "mqtt.vibelux.ai",
  "port": 8883,
  "use_tls": true,
  "client_id": "facility_001",
  "username": "your_username",
  "password": "your_password",
  "topics": {
    "temperature": "facility/zone1/temperature",
    "humidity": "facility/zone1/humidity",
    "co2": "facility/zone1/co2",
    "ppfd": "facility/zone1/ppfd"
  }
}`}
            />

            <div className="mt-4 bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>VibeLux automatically discovers MQTT topics. Publish sensor data in JSON format:</p>
                  <code className="block mt-2 text-xs bg-gray-900 p-2 rounded">
                    {"{"}"temperature": 24.5, "humidity": 65, "timestamp": "2024-01-17T10:30:00Z"{"}"}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Modbus TCP/RTU</h3>
            <p className="text-gray-400 mb-4">
              Configure Modbus devices for industrial-grade reliability:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-3">Modbus TCP Configuration</h4>
                <CodeBlock 
                  id="modbus-tcp"
                  code={`{
  "type": "modbus_tcp",
  "host": "192.168.1.100",
  "port": 502,
  "unit_id": 1,
  "registers": {
    "temperature": {
      "address": 30001,
      "type": "float32",
      "scale": 0.1
    },
    "humidity": {
      "address": 30003,
      "type": "uint16",
      "scale": 0.1
    }
  }
}`}
                />
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-3">Modbus RTU Configuration</h4>
                <CodeBlock 
                  id="modbus-rtu"
                  code={`{
  "type": "modbus_rtu",
  "port": "/dev/ttyUSB0",
  "baudrate": 9600,
  "databits": 8,
  "stopbits": 1,
  "parity": "N",
  "unit_id": 1,
  "registers": {
    // Same as TCP
  }
}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Popular Sensor Brands</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { brand: 'Aranet', protocols: ['HTTP API', 'MQTT'], setup: '5 min' },
                { brand: 'HOBO', protocols: ['CSV Export', 'API'], setup: '10 min' },
                { brand: 'Trolmaster', protocols: ['Modbus', 'API'], setup: '15 min' },
                { brand: 'Argus', protocols: ['BACnet', 'Modbus'], setup: '20 min' },
                { brand: 'Priva', protocols: ['OPC UA', 'API'], setup: '30 min' },
                { brand: 'Custom/DIY', protocols: ['Any'], setup: 'Varies' }
              ].map((sensor) => (
                <div key={sensor.brand} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">{sensor.brand}</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    Protocols: {sensor.protocols.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Setup time: ~{sensor.setup}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Climate Control Integration */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Climate Control Systems</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">BACnet Integration</h3>
            <p className="text-gray-400 mb-4">
              Connect to building automation systems using BACnet IP or MS/TP:
            </p>
            
            <CodeBlock 
              id="bacnet-config"
              code={`# BACnet Configuration
{
  "device_id": 12345,
  "network": {
    "type": "IP",
    "port": 47808,
    "broadcast": "192.168.1.255"
  },
  "objects": [
    {
      "name": "Zone_1_Temperature",
      "type": "analog-input",
      "instance": 1,
      "units": "degrees-celsius"
    },
    {
      "name": "Zone_1_Cooling_Valve",
      "type": "analog-output",
      "instance": 1,
      "units": "percent"
    }
  ]
}`}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Automation Scripts</h3>
            <p className="text-gray-400 mb-4">
              Create custom automation rules using our scripting engine:
            </p>
            
            <CodeBlock 
              id="automation-script"
              language="javascript"
              code={`// Example: VPD-based climate control
const automation = {
  name: "VPD Optimization",
  trigger: "sensor_update",
  conditions: {
    time: "lights_on",
    sensor: "environmental"
  },
  
  execute: async (data) => {
    const { temperature, humidity } = data;
    const vpd = calculateVPD(temperature, humidity);
    
    if (vpd < 0.8) {
      // Too humid - increase temperature or decrease humidity
      await control.hvac.setpoint(temperature + 1);
      await control.dehumidifier.on();
    } else if (vpd > 1.2) {
      // Too dry - decrease temperature or increase humidity
      await control.hvac.setpoint(temperature - 1);
      await control.humidifier.on();
    }
    
    // Log adjustment
    await log.info(\`VPD adjusted to \${vpd.toFixed(2)} kPa\`);
  }
};`}
            />
          </div>
        </div>
      </section>

      {/* Lighting Control */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Lighting Control Integration</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">0-10V Dimming Control</h3>
            <p className="text-gray-400 mb-4">
              Control any 0-10V dimmable fixture through our hardware partners:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h4 className="font-medium text-white mb-3">Supported Controllers</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Trolmaster Hydro-X Pro</li>
                  <li>• TrolMaster Lighting Control Adapters</li>
                  <li>• GrowFlux Controllers</li>
                  <li>• Custom Arduino/Raspberry Pi</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h4 className="font-medium text-white mb-3">Features</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Sunrise/sunset simulation</li>
                  <li>• Multi-zone control</li>
                  <li>• DLI tracking and adjustment</li>
                  <li>• Power monitoring per circuit</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Smart Fixture Integration</h3>
            <p className="text-gray-400 mb-4">
              Direct integration with intelligent LED fixtures:
            </p>
            
            <CodeBlock 
              id="smart-fixture"
              code={`# Smart Fixture API Example
POST /api/fixtures/{fixtureId}/control
{
  "dimming": 85,           // 0-100%
  "spectrum": {
    "red": 100,           // 660nm
    "far_red": 20,        // 730nm
    "blue": 80,           // 450nm
    "white": 60           // 4000K
  },
  "schedule": {
    "sunrise": "06:00",
    "sunset": "22:00",
    "ramp_minutes": 30
  }
}`}
            />
          </div>
        </div>
      </section>

      {/* Data Export & Compliance */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Data Export & Compliance</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">METRC/BioTrack Integration</h3>
            <p className="text-gray-400 mb-4">
              Automated compliance reporting for cannabis facilities:
            </p>
            
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>Enable METRC integration in Settings → Compliance. 
                  VibeLux automatically syncs harvest weights, waste, and transfers.</p>
                </div>
              </div>
            </div>
            
            <CodeBlock 
              id="metrc-config"
              code={`{
  "metrc": {
    "vendor_key": "your_vendor_key",
    "user_key": "your_user_key",
    "license_number": "your_license",
    "sync_interval": "hourly",
    "auto_submit": true
  }
}`}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Data Export Formats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { format: 'CSV', use: 'Excel analysis' },
                { format: 'JSON', use: 'API integration' },
                { format: 'PDF', use: 'Reports' },
                { format: 'SQL', use: 'Database import' }
              ].map((format) => (
                <div key={format.format} className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-lg font-medium text-white mb-1">{format.format}</div>
                  <div className="text-sm text-gray-400">{format.use}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Webhooks & Notifications</h2>
        
        <div className="space-y-6">
          <p className="text-gray-400">
            Receive real-time notifications when important events occur:
          </p>
          
          <CodeBlock 
            id="webhook-example"
            code={`// Webhook Configuration
{
  "url": "https://your-server.com/webhooks/vibelux",
  "secret": "your_webhook_secret",
  "events": [
    "alert.triggered",
    "sensor.offline", 
    "harvest.completed",
    "energy.peak_demand",
    "maintenance.due"
  ],
  "retry": {
    "attempts": 3,
    "backoff": "exponential"
  }
}

// Example Webhook Payload
{
  "event": "alert.triggered",
  "timestamp": "2024-01-17T10:30:00Z",
  "facility_id": "fac_123",
  "data": {
    "alert_type": "temperature_high",
    "zone": "Flower Room 1",
    "value": 32.5,
    "threshold": 30,
    "duration_minutes": 15
  }
}`}
          />
          
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h4 className="font-medium text-white mb-3">Available Webhook Events</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-400">
              <div>• Alert triggered/cleared</div>
              <div>• Sensor online/offline</div>
              <div>• Harvest completed</div>
              <div>• Maintenance due/completed</div>
              <div>• Energy peak detected</div>
              <div>• Schedule executed</div>
              <div>• Device control changed</div>
              <div>• Report generated</div>
              <div>• User action audit</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}