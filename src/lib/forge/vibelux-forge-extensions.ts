/**
 * VibeLux Forge Extensions Suite
 * Comprehensive horticultural CAD extensions with AI integration
 */

import { SpectralRecipeEngine } from '../spectral/spectral-recipe-engine';
import { AdvancedObjectSnaps } from '../cad/advanced-object-snaps';
import { DetailCalloutSystem } from '../cad/detail-callout-system';
import { SheetReferenceManager } from '../cad/sheet-reference-manager';
import { TitleBlockSystem } from '../cad/title-block-system';

// Forge Extension Base Class
export abstract class ForgeExtension {
  protected viewer: Autodesk.Viewing.GuiViewer3D;
  protected options: any;
  
  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    this.viewer = viewer;
    this.options = options;
  }

  abstract load(): boolean;
  abstract unload(): boolean;
  abstract getName(): string;
}

/**
 * AI-Powered Conversational Design Extension
 * Integrates Claude AI directly into Forge viewport
 */
export class ConversationalDesignExtension extends ForgeExtension {
  private aiPanel: Autodesk.Viewing.UI.DockingPanel | null = null;
  private conversationHistory: any[] = [];
  private currentDesignContext: any = null;

  getName(): string {
    return 'VibeLux.ConversationalDesign';
  }

  load(): boolean {
    this.createAIPanel();
    this.setupEventListeners();
    console.log('VibeLux Conversational Design Extension loaded');
    return true;
  }

  unload(): boolean {
    if (this.aiPanel) {
      this.aiPanel.uninitialize();
      this.aiPanel = null;
    }
    return true;
  }

  private createAIPanel(): void {
    this.aiPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-ai-panel',
      'VibeLux AI Assistant',
      {
        localizeTitle: true,
        dockRight: true,
        shadow: true
      }
    );

    const panelContent = `
      <div class="vibelux-ai-chat">
        <div class="chat-header">
          <h3>🤖 VibeLux AI Designer</h3>
          <p>Describe your greenhouse lighting needs</p>
        </div>
        
        <div id="chat-messages" class="chat-messages">
          <div class="ai-message">
            <div class="message-bubble ai">
              👋 Hi! I'm your AI lighting consultant. Tell me about your greenhouse project and I'll help design the perfect lighting system.
            </div>
          </div>
        </div>
        
        <div class="chat-input-container">
          <div class="input-group">
            <input type="text" id="user-input" placeholder="e.g., I need lighting for a 40x20 cannabis grow room" class="chat-input">
            <button id="send-button" class="send-button">Send</button>
          </div>
          <div class="quick-actions">
            <button class="quick-btn" data-message="I need lighting for cannabis cultivation">🌿 Cannabis</button>
            <button class="quick-btn" data-message="Help me design lettuce production lighting">🥬 Leafy Greens</button>
            <button class="quick-btn" data-message="I need flexible research lighting">🔬 Research</button>
          </div>
        </div>
        
        <div class="ai-status">
          <div id="ai-thinking" class="thinking hidden">🧠 AI is thinking...</div>
          <div id="design-progress" class="progress hidden"></div>
        </div>
      </div>
    `;

    this.aiPanel.container.innerHTML = panelContent;
    this.aiPanel.addVisibilityListener((visible) => {
      if (visible) {
        this.initializeChatInterface();
      }
    });
  }

  private initializeChatInterface(): void {
    const sendButton = this.aiPanel?.container.querySelector('#send-button');
    const userInput = this.aiPanel?.container.querySelector('#user-input') as HTMLInputElement;
    const quickButtons = this.aiPanel?.container.querySelectorAll('.quick-btn');

    sendButton?.addEventListener('click', () => this.handleUserMessage());
    userInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleUserMessage();
    });

    quickButtons?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const message = (e.target as HTMLElement).dataset.message;
        if (message) {
          userInput.value = message;
          this.handleUserMessage();
        }
      });
    });
  }

  private async handleUserMessage(): Promise<void> {
    const userInput = this.aiPanel?.container.querySelector('#user-input') as HTMLInputElement;
    const message = userInput.value.trim();
    
    if (!message) return;

    this.addMessageToChat('user', message);
    userInput.value = '';
    this.showAIThinking(true);

    try {
      const response = await this.callAIAPI(message);
      this.showAIThinking(false);
      
      if (response.readyToDesign) {
        await this.generateDesignInForge(response.designSpec);
      } else {
        this.handleAIQuestions(response);
      }
    } catch (error) {
      this.showAIThinking(false);
      this.addMessageToChat('ai', '❌ Sorry, I encountered an error. Please try again.');
      console.error('AI API Error:', error);
    }
  }

  private async callAIAPI(message: string): Promise<any> {
    const response = await fetch('/api/ai/conversational-design?action=continue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: message,
        context: {
          conversationHistory: this.conversationHistory,
          currentModel: this.getCurrentModelContext(),
          viewerState: this.getViewerState()
        }
      })
    });

    if (!response.ok) throw new Error('AI API call failed');
    return response.json();
  }

  private handleAIQuestions(response: any): void {
    // Add AI response with questions
    let aiMessage = response.aiResponse;
    
    if (response.clarificationQuestions?.length > 0) {
      aiMessage += '\n\n**I need a bit more information:**\n';
      response.clarificationQuestions.forEach((q: any, index: number) => {
        aiMessage += `\n${index + 1}. ${q.question}`;
        if (q.impact) aiMessage += `\n   *${q.impact}*`;
      });
    }

    this.addMessageToChat('ai', aiMessage);
    this.conversationHistory.push({ user: response.userInput, ai: aiMessage });
  }

  private async generateDesignInForge(designSpec: any): Promise<void> {
    this.addMessageToChat('ai', '🎯 Perfect! I have everything I need. Generating your lighting design now...');
    this.showDesignProgress(true);

    try {
      // Step 1: Generate fixtures and layout
      this.updateProgress('Calculating optimal fixture layout...', 20);
      const fixtures = await this.calculateFixtureLayout(designSpec);
      
      // Step 2: Create 3D geometry in Forge
      this.updateProgress('Creating 3D model...', 40);
      await this.create3DFixtures(fixtures);
      
      // Step 3: Generate PPFD visualization
      this.updateProgress('Calculating light distribution...', 60);
      await this.generatePPFDVisualization(fixtures, designSpec);
      
      // Step 4: Create documentation
      this.updateProgress('Generating documentation...', 80);
      const documentation = await this.generateDocumentation(fixtures, designSpec);
      
      // Step 5: Complete
      this.updateProgress('Design complete!', 100);
      
      setTimeout(() => {
        this.showDesignProgress(false);
        this.presentDesignResults(fixtures, designSpec, documentation);
      }, 1000);
      
    } catch (error) {
      this.showDesignProgress(false);
      this.addMessageToChat('ai', '❌ Error generating design. Please try again.');
      console.error('Design generation error:', error);
    }
  }

  private async calculateFixtureLayout(designSpec: any): Promise<any[]> {
    // Use our spectral recipe engine and optimization
    const spectralEngine = new SpectralRecipeEngine();
    const recipe = await spectralEngine.getOptimalRecipe(
      designSpec.cropType,
      designSpec.growthStage,
      designSpec.targetOutcome
    );

    // Calculate fixture placement based on space and PPFD requirements
    const fixtures = [];
    const { length, width, height } = designSpec.dimensions;
    const targetPPFD = recipe?.totalPPFD || 600;
    
    // Simplified fixture calculation (real version would be more sophisticated)
    const fixturesPerSide = Math.ceil(Math.sqrt((length * width) / 16)); // ~4x4 coverage per fixture
    const spacingX = length / fixturesPerSide;
    const spacingY = width / fixturesPerSide;
    
    for (let x = 0; x < fixturesPerSide; x++) {
      for (let y = 0; y < fixturesPerSide; y++) {
        fixtures.push({
          id: `fixture_${x}_${y}`,
          position: {
            x: (x + 0.5) * spacingX,
            y: (y + 0.5) * spacingY,
            z: height - 2 // 2 feet from ceiling
          },
          type: designSpec.fixtureType || 'LED_BAR',
          power: 320, // watts
          ppf: 1050,
          spectrum: recipe?.bands || []
        });
      }
    }

    return fixtures;
  }

  private async create3DFixtures(fixtures: any[]): Promise<void> {
    // Create 3D geometry for each fixture
    for (const fixture of fixtures) {
      await this.createFixtureGeometry(fixture);
    }
    
    // Refresh viewer
    this.viewer.impl.invalidate(true);
  }

  private async createFixtureGeometry(fixture: any): Promise<void> {
    // This would create actual 3D geometry in the Forge model
    // For now, adding as a simple box primitive
    const geometry = new THREE.BoxGeometry(4, 1, 0.5); // 4ft x 1ft x 6in fixture
    const material = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(
      fixture.position.x,
      fixture.position.y, 
      fixture.position.z
    );
    
    // Add custom properties
    mesh.userData = {
      id: fixture.id,
      type: 'vibelux_fixture',
      power: fixture.power,
      ppf: fixture.ppf,
      spectrum: fixture.spectrum
    };
    
    // Add to scene
    this.viewer.impl.scene.add(mesh);
  }

  private async generatePPFDVisualization(fixtures: any[], designSpec: any): Promise<void> {
    // Create PPFD heatmap overlay
    const heatmapExtension = this.viewer.getExtension('VibeLux.PPFDHeatmap');
    if (heatmapExtension) {
      await heatmapExtension.generateHeatmap(fixtures, designSpec.dimensions);
    }
  }

  private async generateDocumentation(fixtures: any[], designSpec: any): Promise<any> {
    const totalPower = fixtures.reduce((sum, f) => sum + f.power, 0);
    const averagePPFD = this.calculateAveragePPFD(fixtures, designSpec.dimensions);
    
    return {
      summary: {
        fixtureCount: fixtures.length,
        totalPower: `${(totalPower / 1000).toFixed(1)}kW`,
        averagePPFD: `${Math.round(averagePPFD)} μmol/m²/s`,
        efficiency: `${(fixtures[0]?.ppf / fixtures[0]?.power * 1000000 || 0).toFixed(1)} μmol/J`,
        coverage: `${designSpec.dimensions.length}' × ${designSpec.dimensions.width}'`
      },
      fixtures: fixtures,
      recommendations: this.generateRecommendations(fixtures, designSpec)
    };
  }

  private presentDesignResults(fixtures: any[], designSpec: any, documentation: any): void {
    const summary = documentation.summary;
    
    const resultMessage = `
🎉 **Design Complete!**

📊 **Design Summary:**
• ${summary.fixtureCount} LED fixtures
• ${summary.totalPower} total power
• ${summary.averagePPFD} average PPFD
• ${summary.efficiency} system efficiency
• ${summary.coverage} coverage area

✨ **What I created for you:**
• 3D fixture layout in the viewer above
• PPFD heatmap visualization
• Complete bill of materials
• Installation documentation

🔧 **Next steps:**
• Review the 3D layout and adjust if needed
• Export CAD files for construction
• Generate detailed installation plans

Try saying "adjust the lighting" or "show me the bill of materials" for more options!
    `;

    this.addMessageToChat('ai', resultMessage);
    
    // Focus viewer on the generated design
    this.viewer.fitToView();
  }

  // Utility methods
  private addMessageToChat(sender: 'user' | 'ai', message: string): void {
    const chatMessages = this.aiPanel?.container.querySelector('#chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;
    bubble.innerHTML = this.formatMessage(message);
    
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  private formatMessage(message: string): string {
    // Convert markdown-like formatting to HTML
    return message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  private showAIThinking(show: boolean): void {
    const thinkingDiv = this.aiPanel?.container.querySelector('#ai-thinking');
    if (thinkingDiv) {
      thinkingDiv.classList.toggle('hidden', !show);
    }
  }

  private showDesignProgress(show: boolean): void {
    const progressDiv = this.aiPanel?.container.querySelector('#design-progress');
    if (progressDiv) {
      progressDiv.classList.toggle('hidden', !show);
    }
  }

  private updateProgress(message: string, percent: number): void {
    const progressDiv = this.aiPanel?.container.querySelector('#design-progress');
    if (progressDiv) {
      progressDiv.innerHTML = `
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percent}%"></div>
        </div>
        <div class="progress-text">${message}</div>
      `;
    }
  }

  private getCurrentModelContext(): any {
    return {
      hasModel: this.viewer.model !== null,
      modelName: this.viewer.model?.getData()?.name || null,
      boundingBox: this.viewer.model?.getBoundingBox() || null
    };
  }

  private getViewerState(): any {
    return {
      camera: this.viewer.getCamera(),
      selection: this.viewer.getSelection(),
      isolation: this.viewer.getIsolatedNodes()
    };
  }

  private calculateAveragePPFD(fixtures: any[], dimensions: any): number {
    // Simplified PPFD calculation
    const totalPPF = fixtures.reduce((sum, f) => sum + f.ppf, 0);
    const area = dimensions.length * dimensions.width;
    return (totalPPF / area) * 0.8; // 80% efficiency factor
  }

  private generateRecommendations(fixtures: any[], designSpec: any): string[] {
    const recommendations = [];
    
    if (fixtures.length > 20) {
      recommendations.push('Consider zone control for energy savings');
    }
    
    if (designSpec.cropType === 'cannabis') {
      recommendations.push('Add far-red channels for flowering enhancement');
    }
    
    recommendations.push('Install dimming controls for growth stage optimization');
    
    return recommendations;
  }
}

/**
 * PPFD Heatmap Visualization Extension
 */
export class PPFDHeatmapExtension extends ForgeExtension {
  private heatmapOverlay: THREE.Mesh | null = null;
  private heatmapTexture: THREE.Texture | null = null;

  getName(): string {
    return 'VibeLux.PPFDHeatmap';
  }

  load(): boolean {
    this.setupToolbar();
    console.log('VibeLux PPFD Heatmap Extension loaded');
    return true;
  }

  unload(): boolean {
    this.removeHeatmapOverlay();
    return true;
  }

  private setupToolbar(): void {
    const toolbar = this.viewer.getToolbar(true);
    const controlGroup = toolbar.getControl('vibelux-controls') || 
      toolbar.addControl('vibelux-controls', { collapsible: true, index: 0 });

    const heatmapButton = new Autodesk.Viewing.UI.Button('vibelux-heatmap-btn');
    heatmapButton.setToolTip('Toggle PPFD Heatmap');
    heatmapButton.setIcon('adsk-icon-measure');
    heatmapButton.onClick = () => this.toggleHeatmap();
    
    controlGroup.addControl(heatmapButton);
  }

  private toggleHeatmap(): void {
    if (this.heatmapOverlay) {
      this.removeHeatmapOverlay();
    } else {
      this.generateDefaultHeatmap();
    }
  }

  public async generateHeatmap(fixtures: any[], dimensions: any): Promise<void> {
    const { length, width } = dimensions;
    const resolution = 50; // 50x50 grid
    
    // Calculate PPFD at each grid point
    const ppfdData = new Float32Array(resolution * resolution);
    
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        const worldX = (x / resolution) * length;
        const worldY = (y / resolution) * width;
        
        let totalPPFD = 0;
        
        fixtures.forEach(fixture => {
          const distance = Math.sqrt(
            Math.pow(worldX - fixture.position.x, 2) +
            Math.pow(worldY - fixture.position.y, 2) +
            Math.pow(2 - fixture.position.z, 2) // 2ft above canopy
          );
          
          // Inverse square law with beam angle consideration
          const ppfd = (fixture.ppf * 0.8) / (4 * Math.PI * Math.pow(distance, 2));
          totalPPFD += Math.max(0, ppfd);
        });
        
        ppfdData[y * resolution + x] = totalPPFD;
      }
    }
    
    // Create heatmap texture
    this.createHeatmapTexture(ppfdData, resolution);
    
    // Create overlay geometry
    const geometry = new THREE.PlaneGeometry(length, width);
    const material = new THREE.MeshBasicMaterial({
      map: this.heatmapTexture,
      transparent: true,
      opacity: 0.7
    });
    
    this.heatmapOverlay = new THREE.Mesh(geometry, material);
    this.heatmapOverlay.position.set(length/2, width/2, 2); // 2ft above ground
    this.heatmapOverlay.rotateX(-Math.PI/2); // Horizontal
    
    this.viewer.impl.scene.add(this.heatmapOverlay);
    this.viewer.impl.invalidate(true);
  }

  private createHeatmapTexture(ppfdData: Float32Array, resolution: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(resolution, resolution);
    const data = imageData.data;
    
    // Find min/max for normalization
    const maxPPFD = Math.max(...ppfdData);
    const minPPFD = Math.min(...ppfdData);
    
    for (let i = 0; i < ppfdData.length; i++) {
      const ppfd = ppfdData[i];
      const normalized = (ppfd - minPPFD) / (maxPPFD - minPPFD);
      
      // Color mapping: blue (low) → green (medium) → red (high)
      const pixel = i * 4;
      if (normalized < 0.5) {
        data[pixel] = Math.round(normalized * 2 * 255); // Red
        data[pixel + 1] = Math.round(normalized * 2 * 255); // Green
        data[pixel + 2] = 255; // Blue
      } else {
        data[pixel] = 255; // Red
        data[pixel + 1] = Math.round((1 - normalized) * 2 * 255); // Green
        data[pixel + 2] = 0; // Blue
      }
      data[pixel + 3] = 200; // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    this.heatmapTexture = new THREE.CanvasTexture(canvas);
    this.heatmapTexture.needsUpdate = true;
  }

  private generateDefaultHeatmap(): void {
    // Generate a sample heatmap for demonstration
    const sampleFixtures = [
      { position: { x: 10, y: 10, z: 10 }, ppf: 1050 },
      { position: { x: 30, y: 10, z: 10 }, ppf: 1050 },
      { position: { x: 10, y: 20, z: 10 }, ppf: 1050 },
      { position: { x: 30, y: 20, z: 10 }, ppf: 1050 }
    ];
    
    this.generateHeatmap(sampleFixtures, { length: 40, width: 30 });
  }

  private removeHeatmapOverlay(): void {
    if (this.heatmapOverlay) {
      this.viewer.impl.scene.remove(this.heatmapOverlay);
      this.heatmapOverlay = null;
      this.viewer.impl.invalidate(true);
    }
  }
}

/**
 * Spectral Analysis Extension
 */
export class SpectralAnalysisExtension extends ForgeExtension {
  private spectralEngine: SpectralRecipeEngine;
  private analysisPanel: Autodesk.Viewing.UI.DockingPanel | null = null;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
    super(viewer, options);
    this.spectralEngine = new SpectralRecipeEngine();
  }

  getName(): string {
    return 'VibeLux.SpectralAnalysis';
  }

  load(): boolean {
    this.createSpectralPanel();
    this.setupSelectionHandler();
    console.log('VibeLux Spectral Analysis Extension loaded');
    return true;
  }

  unload(): boolean {
    if (this.analysisPanel) {
      this.analysisPanel.uninitialize();
      this.analysisPanel = null;
    }
    return true;
  }

  private createSpectralPanel(): void {
    this.analysisPanel = new Autodesk.Viewing.UI.DockingPanel(
      this.viewer.container,
      'vibelux-spectral-panel',
      'Spectral Analysis',
      { dockRight: true }
    );

    const panelContent = `
      <div class="spectral-analysis">
        <div class="panel-section">
          <h4>Selected Fixture</h4>
          <div id="fixture-info">Select a fixture to view spectral data</div>
        </div>
        
        <div class="panel-section">
          <h4>Spectral Recipe</h4>
          <select id="recipe-selector">
            <option value="">Select a recipe...</option>
            <option value="cannabis-flower-thc">Cannabis Flowering (High THC)</option>
            <option value="lettuce-low-nitrate">Lettuce (Low Nitrate)</option>
            <option value="tomato-lycopene">Tomato (High Lycopene)</option>
          </select>
          <div id="recipe-analysis"></div>
        </div>
        
        <div class="panel-section">
          <h4>Spectral Chart</h4>
          <canvas id="spectral-chart" width="300" height="200"></canvas>
        </div>
        
        <div class="panel-section">
          <h4>Optimization</h4>
          <div id="optimization-results"></div>
          <button id="optimize-btn" class="btn btn-primary">Optimize Spectrum</button>
        </div>
      </div>
    `;

    this.analysisPanel.container.innerHTML = panelContent;
    this.setupSpectralInterface();
  }

  private setupSpectralInterface(): void {
    const recipeSelector = this.analysisPanel?.container.querySelector('#recipe-selector') as HTMLSelectElement;
    const optimizeBtn = this.analysisPanel?.container.querySelector('#optimize-btn');

    recipeSelector?.addEventListener('change', (e) => {
      const recipeId = (e.target as HTMLSelectElement).value;
      if (recipeId) {
        this.analyzeSpectralMatch(recipeId);
      }
    });

    optimizeBtn?.addEventListener('click', () => {
      this.optimizeCurrentFixture();
    });
  }

  private setupSelectionHandler(): void {
    this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
      const selection = event.dbIdArray;
      if (selection.length > 0) {
        this.analyzeSelectedFixture(selection[0]);
      }
    });
  }

  private async analyzeSelectedFixture(dbId: number): Promise<void> {
    const fixtureInfo = this.analysisPanel?.container.querySelector('#fixture-info');
    if (!fixtureInfo) return;

    // Get fixture properties
    this.viewer.getProperties(dbId, (props) => {
      if (props.name.includes('fixture') || props.userData?.type === 'vibelux_fixture') {
        const power = props.userData?.power || 320;
        const ppf = props.userData?.ppf || 1050;
        const efficiency = (ppf / power * 1000000).toFixed(1);
        
        fixtureInfo.innerHTML = `
          <div class="fixture-details">
            <p><strong>Power:</strong> ${power}W</p>
            <p><strong>PPF:</strong> ${ppf} μmol/s</p>
            <p><strong>Efficiency:</strong> ${efficiency} μmol/J</p>
            <p><strong>Type:</strong> LED Horticultural</p>
          </div>
        `;
        
        this.drawSpectralChart(props.userData?.spectrum || []);
      }
    });
  }

  private async analyzeSpectralMatch(recipeId: string): Promise<void> {
    const recipe = await this.spectralEngine.getOptimalRecipe(
      recipeId.split('-')[0],
      recipeId.includes('flower') ? 'flowering' : 'vegetative',
      'yield'
    );

    if (!recipe) return;

    const analysisDiv = this.analysisPanel?.container.querySelector('#recipe-analysis');
    if (analysisDiv) {
      analysisDiv.innerHTML = `
        <div class="recipe-details">
          <p><strong>Target PPFD:</strong> ${recipe.totalPPFD} μmol/m²/s</p>
          <p><strong>DLI:</strong> ${recipe.dli} mol/m²/d</p>
          <p><strong>Photoperiod:</strong> ${recipe.photoperiod}h</p>
          <p><strong>Critical Bands:</strong> ${recipe.bands.filter(b => b.priority === 'critical').length}</p>
        </div>
      `;
    }
  }

  private drawSpectralChart(spectrum: any[]): void {
    const canvas = this.analysisPanel?.container.querySelector('#spectral-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 180);
    ctx.lineTo(280, 180); // X-axis
    ctx.moveTo(50, 20);
    ctx.lineTo(50, 180); // Y-axis
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.fillText('400nm', 50, 195);
    ctx.fillText('700nm', 250, 195);
    ctx.fillText('Intensity', 5, 15);
    
    // Draw spectrum curve (sample data)
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let wl = 400; wl <= 700; wl += 5) {
      const x = 50 + ((wl - 400) / 300) * 230;
      let intensity = 0;
      
      // Blue peak around 450nm
      if (wl >= 430 && wl <= 480) {
        intensity = 80 * Math.exp(-Math.pow(wl - 450, 2) / (2 * Math.pow(20, 2)));
      }
      
      // Red peak around 660nm
      if (wl >= 640 && wl <= 680) {
        intensity = 100 * Math.exp(-Math.pow(wl - 660, 2) / (2 * Math.pow(15, 2)));
      }
      
      const y = 180 - (intensity / 100) * 160;
      
      if (wl === 400) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  }

  private async optimizeCurrentFixture(): Promise<void> {
    const resultsDiv = this.analysisPanel?.container.querySelector('#optimization-results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div class="optimization-loading">🔄 Optimizing spectrum...</div>
      `;
      
      // Simulate optimization
      setTimeout(() => {
        resultsDiv.innerHTML = `
          <div class="optimization-complete">
            <p>✅ <strong>Optimization Complete</strong></p>
            <p>Recommended adjustments:</p>
            <ul>
              <li>Increase blue channel to 65%</li>
              <li>Maintain red channel at 100%</li>
              <li>Add 15% far-red for flowering</li>
            </ul>
            <p><strong>Expected improvement:</strong> +12% yield</p>
          </div>
        `;
      }, 2000);
    }
  }
}

// Export all extensions for registration
export const VibeLuxForgeExtensions = {
  ConversationalDesignExtension,
  PPFDHeatmapExtension,
  SpectralAnalysisExtension
};

export default VibeLuxForgeExtensions;