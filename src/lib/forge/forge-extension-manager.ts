/**
 * Forge Extension Manager
 * Handles registration and lifecycle of all VibeLux Forge extensions
 */

import { VibeLuxForgeExtensions } from './vibelux-forge-extensions';
import { VibeLuxLayerManager } from './layer-manager';
import KeyboardShortcutsExtension from './keyboard-shortcuts-forge';
import HVACSystemSelectorExtension from './hvac-system-selector-forge';
import HVACDesignExtension from './hvac-design-forge-extension';
import CFDVisualizationExtension from './cfd-forge-extensions';
import ProfessionalReportExtension from './reports-forge-extensions';
import ThermalManagementExtension from './thermal-management-forge-extension';
import GeometryToolsExtension from './geometry-tools-forge-extension';
import CADExportExtension from './cad-export-forge-extension';
import StructuralAnalysisExtension from './structural-analysis-forge-extension';
import MaterialDatabaseExtension from './material-database-forge-extension';
import EnvironmentalControlsExtension from './environmental-controls-forge-extension';
import IrrigationSystemExtension from './irrigation-system-forge-extension';
import ShadeSystemExtension from './shade-system-forge-extension';
import SpotifyExtension from './spotify-forge-extension';

export class ForgeExtensionManager {
  private viewer: Autodesk.Viewing.GuiViewer3D;
  private loadedExtensions: Map<string, any> = new Map();
  private extensionConfig: any;
  private layerManager: VibeLuxLayerManager;

  constructor(viewer: Autodesk.Viewing.GuiViewer3D, config: any = {}) {
    this.viewer = viewer;
    this.extensionConfig = {
      enableAI: true,
      enableHeatmap: true,
      enableSpectral: true,
      enableCAD: true,
      enableHVAC: true,
      enableReports: true,
      enableKeyboardShortcuts: true,
      enableSpotify: true,
      ...config
    };
    
    // Initialize layer manager
    this.layerManager = new VibeLuxLayerManager(viewer);
  }

  /**
   * Initialize all VibeLux extensions
   */
  async initializeExtensions(): Promise<void> {
    try {
      // Load CSS styles first
      await this.loadExtensionStyles();
      
      // Register and load extensions
      await this.registerExtensions();
      await this.loadExtensions();
      
      console.log('VibeLux Forge Extensions initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Forge extensions:', error);
      throw error;
    }
  }

  /**
   * Register all extensions with Forge
   */
  private async registerExtensions(): Promise<void> {
    const extensions = [
      {
        name: 'VibeLux.ConversationalDesign',
        class: VibeLuxForgeExtensions.ConversationalDesignExtension,
        enabled: this.extensionConfig.enableAI
      },
      {
        name: 'VibeLux.PPFDHeatmap', 
        class: VibeLuxForgeExtensions.PPFDHeatmapExtension,
        enabled: this.extensionConfig.enableHeatmap
      },
      {
        name: 'VibeLux.SpectralAnalysis',
        class: VibeLuxForgeExtensions.SpectralAnalysisExtension,
        enabled: this.extensionConfig.enableSpectral
      },
      {
        name: 'VibeLux.KeyboardShortcuts',
        class: KeyboardShortcutsExtension,
        enabled: this.extensionConfig.enableKeyboardShortcuts
      },
      {
        name: 'VibeLux.HVACSystemSelector',
        class: HVACSystemSelectorExtension,
        enabled: this.extensionConfig.enableHVAC
      },
      {
        name: 'VibeLux.HVACDesign',
        class: HVACDesignExtension,
        enabled: this.extensionConfig.enableHVAC
      },
      {
        name: 'VibeLux.CFDVisualization',
        class: CFDVisualizationExtension,
        enabled: this.extensionConfig.enableHVAC
      },
      {
        name: 'VibeLux.ProfessionalReports',
        class: ProfessionalReportExtension,
        enabled: this.extensionConfig.enableReports
      },
      {
        name: 'VibeLux.ThermalManagement',
        class: ThermalManagementExtension,
        enabled: this.extensionConfig.enableHVAC
      },
      {
        name: 'VibeLux.GeometryTools',
        class: GeometryToolsExtension,
        enabled: this.extensionConfig.enableCAD
      },
      {
        name: 'VibeLux.CADExport',
        class: CADExportExtension,
        enabled: this.extensionConfig.enableCAD
      },
      {
        name: 'VibeLux.StructuralAnalysis',
        class: StructuralAnalysisExtension,
        enabled: this.extensionConfig.enableCAD
      },
      {
        name: 'VibeLux.MaterialDatabase',
        class: MaterialDatabaseExtension,
        enabled: this.extensionConfig.enableCAD
      },
      {
        name: 'VibeLux.EnvironmentalControls',
        class: EnvironmentalControlsExtension,
        enabled: this.extensionConfig.enableHVAC
      },
      {
        name: 'VibeLux.IrrigationSystem',
        class: IrrigationSystemExtension,
        enabled: this.extensionConfig.enableHVAC
      },
      {
        name: 'VibeLux.ShadeSystem',
        class: ShadeSystemExtension,
        enabled: this.extensionConfig.enableHVAC
      },
      {
        name: 'VibeLux.Spotify',
        class: SpotifyExtension,
        enabled: this.extensionConfig.enableSpotify
      }
    ];

    for (const ext of extensions) {
      if (ext.enabled) {
        Autodesk.Viewing.theExtensionManager.registerExtension(ext.name, ext.class);
        console.log(`Registered extension: ${ext.name}`);
      }
    }
  }

  /**
   * Load enabled extensions
   */
  private async loadExtensions(): Promise<void> {
    const extensionsToLoad = [];
    
    // Core extensions
    if (this.extensionConfig.enableKeyboardShortcuts) {
      extensionsToLoad.push('VibeLux.KeyboardShortcuts');
    }
    
    if (this.extensionConfig.enableAI) {
      extensionsToLoad.push('VibeLux.ConversationalDesign');
    }
    
    if (this.extensionConfig.enableHeatmap) {
      extensionsToLoad.push('VibeLux.PPFDHeatmap');
    }
    
    if (this.extensionConfig.enableSpectral) {
      extensionsToLoad.push('VibeLux.SpectralAnalysis');
    }

    // HVAC extensions
    if (this.extensionConfig.enableHVAC) {
      extensionsToLoad.push('VibeLux.HVACSystemSelector');
      extensionsToLoad.push('VibeLux.HVACDesign');
      extensionsToLoad.push('VibeLux.CFDVisualization');
      extensionsToLoad.push('VibeLux.ThermalManagement');
      extensionsToLoad.push('VibeLux.EnvironmentalControls');
      extensionsToLoad.push('VibeLux.IrrigationSystem');
      extensionsToLoad.push('VibeLux.ShadeSystem');
    }

    // CAD extensions
    if (this.extensionConfig.enableCAD) {
      extensionsToLoad.push('VibeLux.GeometryTools');
      extensionsToLoad.push('VibeLux.CADExport');
      extensionsToLoad.push('VibeLux.StructuralAnalysis');
      extensionsToLoad.push('VibeLux.MaterialDatabase');
    }

    // Reports extension
    if (this.extensionConfig.enableReports) {
      extensionsToLoad.push('VibeLux.ProfessionalReports');
    }

    // Spotify extension
    if (this.extensionConfig.enableSpotify) {
      extensionsToLoad.push('VibeLux.Spotify');
    }

    // Load extensions sequentially to avoid conflicts
    for (const extensionName of extensionsToLoad) {
      try {
        const extension = await this.viewer.loadExtension(extensionName);
        this.loadedExtensions.set(extensionName, extension);
        
        // Pass layer manager to extensions that need it
        if (extension && typeof extension.setLayerManager === 'function') {
          extension.setLayerManager(this.layerManager);
        }
        
        console.log(`Loaded extension: ${extensionName}`);
      } catch (error) {
        console.error(`Failed to load extension ${extensionName}:`, error);
      }
    }

    // Create layer manager panel after all extensions are loaded
    this.layerManager.createLayerPanel();
  }

  /**
   * Load CSS styles for extensions
   */
  private async loadExtensionStyles(): Promise<void> {
    // Load professional CAD UI CSS
    const cadUILink = document.createElement('link');
    cadUILink.rel = 'stylesheet';
    cadUILink.href = '/vibelux-cad-ui.css';
    cadUILink.onload = () => {
      console.log('VibeLux CAD UI styles loaded successfully');
      document.body.classList.add('vibelux-dark-theme'); // Default to dark theme
    };
    cadUILink.onerror = () => {
      console.warn('Failed to load CAD UI CSS');
    };
    document.head.appendChild(cadUILink);

    // Try to load extension-specific CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '/forge-extensions.css';
    cssLink.onload = () => {
      console.log('VibeLux extension styles loaded successfully');
    };
    cssLink.onerror = () => {
      console.warn('Failed to load external CSS, falling back to inline styles');
      // Fallback to inline styles
      const styleSheet = document.createElement('style');
      styleSheet.textContent = this.getExtensionCSS();
      document.head.appendChild(styleSheet);
    };
    document.head.appendChild(cssLink);

    // Also inject critical WebGL styles immediately
    const criticalStyles = document.createElement('style');
    criticalStyles.textContent = `
      /* Critical WebGL and performance styles */
      .forge-viewer canvas {
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
      }
      
      .vibelux-extension-panel {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      
      .system-label {
        pointer-events: none;
        user-select: none;
        will-change: transform;
      }
    `;
    document.head.appendChild(criticalStyles);
  }

  /**
   * Get all CSS styles for extensions
   */
  private getExtensionCSS(): string {
    return `
      /* VibeLux Forge Extensions Styles */
      
      /* AI Chat Panel */
      .vibelux-ai-chat {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      
      .chat-header h3 {
        margin: 0 0 5px 0;
        font-size: 18px;
      }
      
      .chat-header p {
        margin: 0;
        opacity: 0.9;
        font-size: 12px;
      }
      
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        background: #f8f9fa;
        max-height: 400px;
      }
      
      .user-message, .ai-message {
        margin-bottom: 15px;
        display: flex;
        align-items: flex-start;
      }
      
      .user-message {
        justify-content: flex-end;
      }
      
      .message-bubble {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        line-height: 1.4;
        font-size: 14px;
        word-wrap: break-word;
      }
      
      .message-bubble.user {
        background: #007bff;
        color: white;
        border-bottom-right-radius: 6px;
      }
      
      .message-bubble.ai {
        background: white;
        color: #333;
        border: 1px solid #e9ecef;
        border-bottom-left-radius: 6px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .chat-input-container {
        padding: 15px;
        background: white;
        border-top: 1px solid #e9ecef;
      }
      
      .input-group {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
      }
      
      .chat-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        resize: none;
      }
      
      .chat-input:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }
      
      .send-button {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 12px 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s;
      }
      
      .send-button:hover {
        background: #0056b3;
      }
      
      .quick-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .quick-btn {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 15px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .quick-btn:hover {
        background: #e9ecef;
        border-color: #adb5bd;
      }
      
      .ai-status {
        padding: 10px 15px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        font-size: 12px;
        color: #6c757d;
      }
      
      .thinking {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .progress {
        text-align: center;
      }
      
      .progress-bar {
        width: 100%;
        height: 4px;
        background: #e9ecef;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #28a745);
        transition: width 0.3s ease;
      }
      
      .progress-text {
        font-size: 11px;
        color: #495057;
      }
      
      .hidden {
        display: none !important;
      }
      
      /* Spectral Analysis Panel */
      .spectral-analysis {
        padding: 15px;
        background: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .panel-section {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e9ecef;
      }
      
      .panel-section:last-child {
        border-bottom: none;
      }
      
      .panel-section h4 {
        margin: 0 0 10px 0;
        color: #495057;
        font-size: 14px;
        font-weight: 600;
      }
      
      .fixture-details, .recipe-details {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 6px;
        font-size: 12px;
      }
      
      .fixture-details p, .recipe-details p {
        margin: 4px 0;
      }
      
      #recipe-selector {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        margin-bottom: 10px;
      }
      
      #spectral-chart {
        width: 100%;
        border: 1px solid #e9ecef;
        border-radius: 4px;
      }
      
      .btn {
        display: inline-block;
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-primary {
        background: #007bff;
        color: white;
      }
      
      .btn-primary:hover {
        background: #0056b3;
      }
      
      .optimization-loading {
        text-align: center;
        padding: 20px;
        color: #6c757d;
      }
      
      .optimization-complete {
        background: #d1edff;
        padding: 12px;
        border-radius: 6px;
        border-left: 4px solid #007bff;
      }
      
      .optimization-complete ul {
        margin: 8px 0;
        padding-left: 20px;
      }
      
      .optimization-complete li {
        margin: 4px 0;
        font-size: 12px;
      }
      
      /* Toolbar Customizations */
      .adsk-viewing-viewer .adsk-viewing-toolbar .adsk-button {
        position: relative;
      }
      
      .vibelux-toolbar-group {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .message-bubble {
          max-width: 95%;
        }
        
        .quick-actions {
          flex-direction: column;
        }
        
        .quick-btn {
          width: 100%;
          text-align: center;
        }
      }
      
      /* Animation Classes */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .user-message, .ai-message {
        animation: fadeIn 0.3s ease-out;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      
      .thinking {
        animation: pulse 1.5s infinite;
      }
      
      /* Scrollbar Styling */
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      
      .chat-messages::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      .chat-messages::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }
      
      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
  }

  /**
   * Get extension instance
   */
  getExtension(name: string): any {
    return this.loadedExtensions.get(name);
  }

  /**
   * Unload specific extension
   */
  async unloadExtension(name: string): Promise<boolean> {
    try {
      const success = await this.viewer.unloadExtension(name);
      if (success) {
        this.loadedExtensions.delete(name);
        console.log(`Unloaded extension: ${name}`);
      }
      return success;
    } catch (error) {
      console.error(`Failed to unload extension ${name}:`, error);
      return false;
    }
  }

  /**
   * Unload all extensions
   */
  async unloadAllExtensions(): Promise<void> {
    const promises = Array.from(this.loadedExtensions.keys()).map(
      name => this.unloadExtension(name)
    );
    
    await Promise.allSettled(promises);
    console.log('All VibeLux extensions unloaded');
  }

  /**
   * Reload extensions
   */
  async reloadExtensions(): Promise<void> {
    await this.unloadAllExtensions();
    await this.initializeExtensions();
  }

  /**
   * Update extension configuration
   */
  updateConfig(newConfig: any): void {
    this.extensionConfig = { ...this.extensionConfig, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): any {
    return { ...this.extensionConfig };
  }

  /**
   * Check if extension is loaded
   */
  isExtensionLoaded(name: string): boolean {
    return this.loadedExtensions.has(name);
  }

  /**
   * Get list of loaded extensions
   */
  getLoadedExtensions(): string[] {
    return Array.from(this.loadedExtensions.keys());
  }

  /**
   * Get layer manager instance
   */
  getLayerManager(): VibeLuxLayerManager {
    return this.layerManager;
  }

  /**
   * Enable WebGL performance optimizations
   */
  enablePerformanceOptimizations(): void {
    // Enable frustum culling for all layer objects
    this.layerManager.enableFrustumCulling();
    
    // Enable Level of Detail for complex objects
    this.layerManager.enableLevelOfDetail();
    
    // Optimize viewer settings for performance
    if (this.viewer.impl) {
      this.viewer.impl.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.viewer.impl.renderer().shadowMap.enabled = false; // Disable shadows for performance
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): any {
    const stats = this.layerManager.getStats();
    const viewerStats = this.viewer.impl ? {
      drawCalls: this.viewer.impl.renderer().info.render.calls,
      triangles: this.viewer.impl.renderer().info.render.triangles,
      geometries: this.viewer.impl.renderer().info.memory.geometries,
      textures: this.viewer.impl.renderer().info.memory.textures
    } : {};

    return {
      layers: stats,
      webgl: viewerStats,
      extensions: {
        loaded: this.getLoadedExtensions().length,
        total: Object.keys(this.extensionConfig).length
      }
    };
  }

  /**
   * Cleanup all resources
   */
  dispose(): void {
    this.layerManager.dispose();
    this.unloadAllExtensions();
  }
}

export default ForgeExtensionManager;