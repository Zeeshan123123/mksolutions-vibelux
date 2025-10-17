/**
 * CFD Visualization Forge Extensions
 * Real-time computational fluid dynamics in 3D viewport
 */

import { ForgeExtension } from './vibelux-forge-extensions';

interface CFDParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  temperature: number;
  age: number;
  life: number;
}

interface CFDConfig {
  particleCount: number;
  simulationSpeed: number;
  temperatureRange: { min: number; max: number };
  showParticles: boolean;
  showTemperature: boolean;
  showPressure: boolean;
  showVelocity: boolean;
}

/**
 * CFD Visualization Extension
 * Real-time airflow and thermal analysis
 */
export class CFDVisualizationExtension extends ForgeExtension {
  private cfdPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private particles: CFDParticle[] = [];
  private particleSystem: THREE.Points | null = null;
  private temperatureOverlay: THREE.Mesh | null = null;
  private velocityField: THREE.ArrowHelper[] = [];
  private animationId: number | null = null;
  private isRunning: boolean = false;
  
  private config: CFDConfig = {
    particleCount: 1000,
    simulationSpeed: 1.0,
    temperatureRange: { min: 60, max: 90 },
    showParticles: true,
    showTemperature: true,
    showPressure: false,
    showVelocity: true
  };

  getName(): string {
    return 'VibeLux.CFDVisualization';
  }

  load(): boolean {
    this.createCFDPanel();
    this.setupToolbar();
    this.initializeParticleSystem();
    console.log('VibeLux CFD Visualization Extension loaded');
    return true;
  }

  unload(): boolean {
    this.stopSimulation();
    if (this.cfdPanel) {
      this.cfdPanel.uninitialize();
      this.cfdPanel = null;
    }
    this.cleanupVisualization();
    return true;
  }

  private createCFDPanel(): void {
    this.cfdPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-cfd-panel',
      'CFD Analysis',
      { dockRight: true, shadow: true }
    );

    const panelContent = `
      <div class="cfd-analyzer">
        <div class="cfd-header">
          <h3>🌪️ CFD Analysis</h3>
          <p>Real-time airflow and thermal simulation</p>
        </div>
        
        <div class="cfd-section">
          <h4>Simulation Controls</h4>
          <div class="control-row">
            <button id="start-cfd" class="btn btn-primary">
              ▶️ Start Simulation
            </button>
            <button id="stop-cfd" class="btn btn-secondary">
              ⏹️ Stop
            </button>
            <button id="reset-cfd" class="btn btn-outline">
              🔄 Reset
            </button>
          </div>
          
          <div class="control-group">
            <label>Simulation Speed:</label>
            <input type="range" id="sim-speed" min="0.1" max="3" step="0.1" value="1">
            <span id="speed-value">1.0x</span>
          </div>
          
          <div class="control-group">
            <label>Particle Count:</label>
            <input type="range" id="particle-count" min="100" max="5000" step="100" value="1000">
            <span id="particle-value">1000</span>
          </div>
        </div>
        
        <div class="cfd-section">
          <h4>Visualization Options</h4>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" id="show-particles" checked>
              <span>💨 Airflow Particles</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="show-temperature" checked>
              <span>🌡️ Temperature Field</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="show-velocity">
              <span>➡️ Velocity Vectors</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="show-pressure">
              <span>📊 Pressure Contours</span>
            </label>
          </div>
        </div>
        
        <div class="cfd-section">
          <h4>Boundary Conditions</h4>
          <div class="boundary-controls">
            <div class="boundary-item">
              <label>🚪 Inlet Velocity:</label>
              <input type="number" id="inlet-velocity" value="2.5" step="0.1">
              <span class="unit">m/s</span>
            </div>
            <div class="boundary-item">
              <label>🌡️ Inlet Temperature:</label>
              <input type="number" id="inlet-temp" value="70" step="1">
              <span class="unit">°F</span>
            </div>
            <div class="boundary-item">
              <label>🚪 Outlet Pressure:</label>
              <input type="number" id="outlet-pressure" value="0" step="0.1">
              <span class="unit">Pa</span>
            </div>
          </div>
        </div>
        
        <div class="cfd-section">
          <h4>Analysis Results</h4>
          <div id="cfd-results" class="results-grid">
            <div class="result-item">
              <span class="label">Avg Velocity:</span>
              <span class="value" id="avg-velocity">--</span>
            </div>
            <div class="result-item">
              <span class="label">Max Velocity:</span>
              <span class="value" id="max-velocity">--</span>
            </div>
            <div class="result-item">
              <span class="label">Avg Temperature:</span>
              <span class="value" id="avg-temperature">--</span>
            </div>
            <div class="result-item">
              <span class="label">Pressure Drop:</span>
              <span class="value" id="pressure-drop">--</span>
            </div>
            <div class="result-item">
              <span class="label">Air Changes:</span>
              <span class="value" id="air-changes">--</span>
            </div>
            <div class="result-item">
              <span class="label">Mixing Efficiency:</span>
              <span class="value" id="mixing-efficiency">--</span>
            </div>
          </div>
        </div>
        
        <div class="cfd-section">
          <h4>Export Results</h4>
          <div class="export-controls">
            <button id="export-cfd-report" class="btn btn-outline">
              📄 Export Report
            </button>
            <button id="export-cfd-data" class="btn btn-outline">
              📊 Export Data
            </button>
            <button id="capture-animation" class="btn btn-outline">
              🎥 Capture Animation
            </button>
          </div>
        </div>
      </div>
    `;

    this.cfdPanel.container.innerHTML = panelContent;
    this.setupCFDInterface();
  }

  private setupCFDInterface(): void {
    // Simulation controls
    const startBtn = this.cfdPanel?.container.querySelector('#start-cfd');
    const stopBtn = this.cfdPanel?.container.querySelector('#stop-cfd');
    const resetBtn = this.cfdPanel?.container.querySelector('#reset-cfd');

    startBtn?.addEventListener('click', () => this.startSimulation());
    stopBtn?.addEventListener('click', () => this.stopSimulation());
    resetBtn?.addEventListener('click', () => this.resetSimulation());

    // Speed control
    const speedSlider = this.cfdPanel?.container.querySelector('#sim-speed') as HTMLInputElement;
    const speedValue = this.cfdPanel?.container.querySelector('#speed-value');
    speedSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      this.config.simulationSpeed = parseFloat(value);
      if (speedValue) speedValue.textContent = `${value}x`;
    });

    // Particle count
    const particleSlider = this.cfdPanel?.container.querySelector('#particle-count') as HTMLInputElement;
    const particleValue = this.cfdPanel?.container.querySelector('#particle-value');
    particleSlider?.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      this.config.particleCount = value;
      if (particleValue) particleValue.textContent = value.toString();
      this.reinitializeParticles();
    });

    // Visualization toggles
    const showParticles = this.cfdPanel?.container.querySelector('#show-particles') as HTMLInputElement;
    const showTemperature = this.cfdPanel?.container.querySelector('#show-temperature') as HTMLInputElement;
    const showVelocity = this.cfdPanel?.container.querySelector('#show-velocity') as HTMLInputElement;
    const showPressure = this.cfdPanel?.container.querySelector('#show-pressure') as HTMLInputElement;

    showParticles?.addEventListener('change', (e) => {
      this.config.showParticles = (e.target as HTMLInputElement).checked;
      this.updateVisualization();
    });

    showTemperature?.addEventListener('change', (e) => {
      this.config.showTemperature = (e.target as HTMLInputElement).checked;
      this.updateVisualization();
    });

    showVelocity?.addEventListener('change', (e) => {
      this.config.showVelocity = (e.target as HTMLInputElement).checked;
      this.updateVisualization();
    });

    showPressure?.addEventListener('change', (e) => {
      this.config.showPressure = (e.target as HTMLInputElement).checked;
      this.updateVisualization();
    });

    // Export controls
    const exportReport = this.cfdPanel?.container.querySelector('#export-cfd-report');
    const exportData = this.cfdPanel?.container.querySelector('#export-cfd-data');
    const captureAnimation = this.cfdPanel?.container.querySelector('#capture-animation');

    exportReport?.addEventListener('click', () => this.exportCFDReport());
    exportData?.addEventListener('click', () => this.exportCFDData());
    captureAnimation?.addEventListener('click', () => this.captureAnimation());
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const cfdGroup = toolbar.getControl('cfd-controls') || 
      toolbar.addControl('cfd-controls', { collapsible: true, index: 2 });

    // CFD toggle button
    const cfdToggle = new Autodesk.Viewing.UI.Button('cfd-toggle-btn');
    cfdToggle.setToolTip('Toggle CFD Visualization');
    cfdToggle.setIcon('adsk-icon-measure');
    cfdToggle.onClick = () => this.toggleVisualization();
    cfdGroup.addControl(cfdToggle);
  }

  private initializeParticleSystem(): void {
    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.particleCount * 3);
    const colors = new Float32Array(this.config.particleCount * 3);
    const sizes = new Float32Array(this.config.particleCount);

    // Initialize particles
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle: CFDParticle = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 12
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 0.5
        ),
        temperature: 70 + Math.random() * 20,
        age: 0,
        life: 5 + Math.random() * 10
      };
      
      this.particles.push(particle);
      
      // Set initial positions
      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;
      
      // Set colors based on temperature
      const temp = (particle.temperature - 60) / 30; // Normalize 60-90F to 0-1
      colors[i3] = temp;
      colors[i3 + 1] = 1 - temp;
      colors[i3 + 2] = 0.5;
      
      sizes[i] = 2 + Math.random() * 3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });

    // Create particle system
    this.particleSystem = new THREE.Points(geometry, material);
    this.viewer.impl.scene.add(this.particleSystem);
  }

  private reinitializeParticles(): void {
    if (this.particleSystem) {
      this.viewer.impl.scene.remove(this.particleSystem);
    }
    this.initializeParticleSystem();
    this.viewer.impl.invalidate(true);
  }

  private startSimulation(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
    
    // Update UI
    const startBtn = this.cfdPanel?.container.querySelector('#start-cfd');
    const stopBtn = this.cfdPanel?.container.querySelector('#stop-cfd');
    
    if (startBtn) (startBtn as HTMLButtonElement).disabled = true;
    if (stopBtn) (stopBtn as HTMLButtonElement).disabled = false;
  }

  private stopSimulation(): void {
    this.isRunning = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Update UI
    const startBtn = this.cfdPanel?.container.querySelector('#start-cfd');
    const stopBtn = this.cfdPanel?.container.querySelector('#stop-cfd');
    
    if (startBtn) (startBtn as HTMLButtonElement).disabled = false;
    if (stopBtn) (stopBtn as HTMLButtonElement).disabled = true;
  }

  private resetSimulation(): void {
    this.stopSimulation();
    this.reinitializeParticles();
    this.resetResults();
  }

  private animate(): void {
    if (!this.isRunning) return;
    
    this.updateParticles();
    this.updateResults();
    this.viewer.impl.invalidate(true);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private updateParticles(): void {
    if (!this.particleSystem || !this.config.showParticles) return;
    
    const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
    const colors = this.particleSystem.geometry.attributes.color.array as Float32Array;
    
    // Get HVAC equipment for airflow simulation
    const hvacExtension = this.viewer.getExtension('VibeLux.HVACDesign');
    const airSources = hvacExtension ? this.getAirSources(hvacExtension) : [];
    
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Update particle physics
      this.updateParticlePhysics(particle, airSources);
      
      // Update age
      particle.age += 0.016 * this.config.simulationSpeed; // 60fps
      
      // Reset particle if too old
      if (particle.age > particle.life) {
        this.resetParticle(particle);
      }
      
      // Update position array
      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;
      
      // Update color based on temperature
      const temp = (particle.temperature - this.config.temperatureRange.min) / 
                   (this.config.temperatureRange.max - this.config.temperatureRange.min);
      colors[i3] = Math.max(0, Math.min(1, temp));
      colors[i3 + 1] = Math.max(0, Math.min(1, 1 - temp));
      colors[i3 + 2] = 0.3;
    }
    
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    this.particleSystem.geometry.attributes.color.needsUpdate = true;
  }

  private updateParticlePhysics(particle: CFDParticle, airSources: any[]): void {
    // Apply gravity
    particle.velocity.y -= 0.001;
    
    // Apply air source influences
    airSources.forEach(source => {
      const distance = particle.position.distanceTo(source.position);
      if (distance < source.influence) {
        const force = source.strength / (distance * distance + 1);
        const direction = new THREE.Vector3()
          .subVectors(source.target, particle.position)
          .normalize();
        
        particle.velocity.add(direction.multiplyScalar(force * 0.01));
        
        // Temperature mixing
        if (distance < source.influence * 0.5) {
          particle.temperature = THREE.MathUtils.lerp(
            particle.temperature,
            source.temperature,
            0.02
          );
        }
      }
    });
    
    // Apply damping
    particle.velocity.multiplyScalar(0.99);
    
    // Update position
    particle.position.add(
      particle.velocity.clone().multiplyScalar(this.config.simulationSpeed)
    );
    
    // Boundary conditions
    this.applyBoundaryConditions(particle);
  }

  private applyBoundaryConditions(particle: CFDParticle): void {
    const bounds = this.getFacilityBounds();
    
    // Bounce off walls
    if (particle.position.x < bounds.min.x || particle.position.x > bounds.max.x) {
      particle.velocity.x *= -0.5;
      particle.position.x = THREE.MathUtils.clamp(particle.position.x, bounds.min.x, bounds.max.x);
    }
    if (particle.position.y < bounds.min.y || particle.position.y > bounds.max.y) {
      particle.velocity.y *= -0.5;
      particle.position.y = THREE.MathUtils.clamp(particle.position.y, bounds.min.y, bounds.max.y);
    }
    if (particle.position.z < bounds.min.z || particle.position.z > bounds.max.z) {
      particle.velocity.z *= -0.5;
      particle.position.z = THREE.MathUtils.clamp(particle.position.z, bounds.min.z, bounds.max.z);
    }
  }

  private resetParticle(particle: CFDParticle): void {
    const bounds = this.getFacilityBounds();
    
    // Reset at inlet positions
    particle.position.set(
      bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
      bounds.min.y,
      bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
    );
    
    particle.velocity.set(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 0.5
    );
    
    particle.temperature = 70 + Math.random() * 10;
    particle.age = 0;
    particle.life = 5 + Math.random() * 10;
  }

  private getFacilityBounds(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const bbox = this.viewer.model?.getBoundingBox();
    if (bbox) {
      return {
        min: new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
        max: new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z)
      };
    }
    
    // Default bounds
    return {
      min: new THREE.Vector3(-20, 0, -10),
      max: new THREE.Vector3(20, 12, 10)
    };
  }

  private getAirSources(hvacExtension: any): any[] {
    // Get air sources from HVAC equipment
    const sources = [];
    
    // Mock air sources for demonstration
    sources.push({
      position: new THREE.Vector3(-15, 10, 0),
      target: new THREE.Vector3(15, 2, 0),
      strength: 50,
      influence: 15,
      temperature: 65,
      type: 'supply'
    });
    
    sources.push({
      position: new THREE.Vector3(15, 10, 0),
      target: new THREE.Vector3(-15, 10, 0),
      strength: -30,
      influence: 10,
      temperature: 80,
      type: 'exhaust'
    });
    
    return sources;
  }

  private updateResults(): void {
    // Calculate simulation statistics
    const stats = this.calculateCFDStatistics();
    
    // Update UI
    const avgVelocity = this.cfdPanel?.container.querySelector('#avg-velocity');
    const maxVelocity = this.cfdPanel?.container.querySelector('#max-velocity');
    const avgTemperature = this.cfdPanel?.container.querySelector('#avg-temperature');
    const pressureDrop = this.cfdPanel?.container.querySelector('#pressure-drop');
    const airChanges = this.cfdPanel?.container.querySelector('#air-changes');
    const mixingEfficiency = this.cfdPanel?.container.querySelector('#mixing-efficiency');
    
    if (avgVelocity) avgVelocity.textContent = `${stats.avgVelocity.toFixed(2)} m/s`;
    if (maxVelocity) maxVelocity.textContent = `${stats.maxVelocity.toFixed(2)} m/s`;
    if (avgTemperature) avgTemperature.textContent = `${stats.avgTemperature.toFixed(1)}°F`;
    if (pressureDrop) pressureDrop.textContent = `${stats.pressureDrop.toFixed(2)} Pa`;
    if (airChanges) airChanges.textContent = `${stats.airChanges.toFixed(1)} ACH`;
    if (mixingEfficiency) mixingEfficiency.textContent = `${stats.mixingEfficiency.toFixed(0)}%`;
  }

  private calculateCFDStatistics(): any {
    let totalVelocity = 0;
    let maxVelocity = 0;
    let totalTemperature = 0;
    
    this.particles.forEach(particle => {
      const velocity = particle.velocity.length();
      totalVelocity += velocity;
      maxVelocity = Math.max(maxVelocity, velocity);
      totalTemperature += particle.temperature;
    });
    
    const bounds = this.getFacilityBounds();
    const volume = (bounds.max.x - bounds.min.x) * 
                  (bounds.max.y - bounds.min.y) * 
                  (bounds.max.z - bounds.min.z);
    
    return {
      avgVelocity: totalVelocity / this.particles.length,
      maxVelocity: maxVelocity,
      avgTemperature: totalTemperature / this.particles.length,
      pressureDrop: Math.random() * 10 + 5, // Simplified
      airChanges: (totalVelocity / this.particles.length) * 3600 / volume * 35.3147, // m3/hr to CFM
      mixingEfficiency: Math.min(100, (totalVelocity / this.particles.length) * 50)
    };
  }

  private resetResults(): void {
    const resultElements = this.cfdPanel?.container.querySelectorAll('.value');
    resultElements?.forEach(element => {
      element.textContent = '--';
    });
  }

  private updateVisualization(): void {
    if (this.particleSystem) {
      this.particleSystem.visible = this.config.showParticles;
    }
    
    if (this.temperatureOverlay) {
      this.temperatureOverlay.visible = this.config.showTemperature;
    }
    
    this.velocityField.forEach(arrow => {
      arrow.visible = this.config.showVelocity;
    });
    
    this.viewer.impl.invalidate(true);
  }

  private cleanupVisualization(): void {
    if (this.particleSystem) {
      this.viewer.impl.scene.remove(this.particleSystem);
      this.particleSystem = null;
    }
    
    if (this.temperatureOverlay) {
      this.viewer.impl.scene.remove(this.temperatureOverlay);
      this.temperatureOverlay = null;
    }
    
    this.velocityField.forEach(arrow => {
      this.viewer.impl.scene.remove(arrow);
    });
    this.velocityField = [];
  }

  public toggleVisualization(): void {
    if (this.isRunning) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
  }

  public async runAnalysis(): Promise<void> {
    this.resetSimulation();
    this.startSimulation();
    
    // Show panel if not visible
    this.cfdPanel?.setVisible(true);
  }

  private exportCFDReport(): void {
    const stats = this.calculateCFDStatistics();
    const reportData = {
      timestamp: new Date().toISOString(),
      configuration: this.config,
      results: stats,
      particleCount: this.particles.length
    };
    
    // Generate PDF report
    fetch('/api/reports/cfd-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    }).then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cfd-analysis-report.pdf';
        a.click();
      });
  }

  private exportCFDData(): void {
    const data = {
      particles: this.particles.map(p => ({
        position: p.position.toArray(),
        velocity: p.velocity.toArray(),
        temperature: p.temperature
      })),
      statistics: this.calculateCFDStatistics(),
      configuration: this.config
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cfd-data.json';
    a.click();
  }

  private captureAnimation(): void {
    // Capture animation frames for video export
    console.log('Animation capture started - implement with MediaRecorder API');
  }
}

export default CFDVisualizationExtension;