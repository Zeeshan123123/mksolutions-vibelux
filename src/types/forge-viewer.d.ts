/**
 * Autodesk Forge Viewer Type Definitions
 * For VibeLux Greenhouse Design Platform
 */

declare namespace Autodesk {
  namespace Viewing {
    class GuiViewer3D {
      constructor(container: HTMLElement, config?: any);
      start(): Promise<void>;
      load(urn: string, onSuccess?: () => void, onError?: (error: any) => void): void;
      loadModel(url: string, options?: any, onSuccess?: () => void, onError?: (error: any) => void): void;
      unload(): void;
      tearDown(): void;
      container: HTMLElement;
      model: Model;
      impl: ViewerImpl;
      toolbar: UI.ToolBar;
      navigation: Navigation;
      utilities: Utilities;
      canvas: HTMLCanvasElement;
      
      // Methods
      resize(): void;
      setTheme(theme: string): void;
      getState(filter?: any): any;
      restoreState(state: any, filter?: any): void;
      setBackgroundColor(red: number, green: number, blue: number, alpha?: number): void;
      setQualityLevel(useSAO: boolean, useFXAA: boolean): void;
      setProgressiveRendering(progressive: boolean): void;
      setGhosting(ghost: boolean): void;
      setGroundShadow(shadow: boolean): void;
      setGroundReflection(reflection: boolean): void;
      setEnvMapBackground(env: boolean): void;
      
      // Camera methods
      setViewCube(display: boolean): void;
      showViewCubeTriad(show: boolean): void;
      fitToView(objectIds?: number[], model?: Model): void;
      
      // Selection methods
      select(dbIds: number | number[], model?: Model): void;
      clearSelection(): void;
      isolate(dbIds: number | number[], model?: Model): void;
      isolateById(dbIds: number | number[]): void;
      show(dbIds: number | number[], model?: Model): void;
      hide(dbIds: number | number[], model?: Model): void;
      toggleVisibility(dbIds: number | number[], model?: Model): void;
      
      // Extension methods
      loadExtension(extensionId: string, options?: any): Promise<Extension>;
      unloadExtension(extensionId: string): boolean;
      getExtension(extensionId: string): Extension;
      
      // Events
      addEventListener(event: string, callback: Function, options?: any): void;
      removeEventListener(event: string, callback: Function): void;
      dispatchEvent(event: any): void;
      
      // Properties
      getProperties(dbId: number, onSuccess: (props: any) => void, onError?: (error: any) => void): void;
      getObjectTree(onSuccess: (tree: any) => void, onError?: (error: any) => void): void;
      search(text: string, onSuccess: (dbIds: number[]) => void, onError?: (error: any) => void): void;
      
      // Scene
      scene: THREE.Scene;
      camera: THREE.Camera;
      renderer: THREE.WebGLRenderer;
    }

    interface ViewerImpl {
      visibilityManager: any;
      selector: any;
      renderer(): THREE.WebGLRenderer;
      camera: THREE.Camera;
      scene: THREE.Scene;
      materials: any;
      modelQueue(): any;
      sceneUpdated(immediate: boolean): void;
      invalidate(immediate: boolean): void;
      hitTest(x: number, y: number, ignoreTransparent: boolean): any;
      disableHighlight(disable: boolean): void;
    }

    interface Model {
      getBoundingBox(): THREE.Box3;
      getInstanceTree(): any;
      getData(): any;
      getFragmentList(): any;
      getRoot(): any;
    }

    namespace UI {
      class ToolBar {
        addControl(control: Control): void;
        removeControl(control: Control): boolean;
        getControl(controlId: string): Control;
        getDimension(): { width: number; height: number };
      }

      class Control {
        getId(): string;
        setVisible(visible: boolean): void;
        isVisible(): boolean;
        setToolTip(tooltip: string): void;
      }

      class ControlGroup extends Control {
        constructor(id: string);
        addControl(control: Control): void;
        removeControl(control: Control): boolean;
        getControl(controlId: string): Control;
      }

      class Button extends Control {
        constructor(id: string);
        setIcon(icon: string): void;
        setToolTip(tooltip: string): void;
        onClick: (event: Event) => void;
      }

      class DockingPanel {
        constructor(
          parentContainer: HTMLElement,
          id: string,
          title: string,
          options?: { addFooter?: boolean }
        );
        container: HTMLElement;
        setVisible(visible: boolean): void;
        isVisible(): boolean;
        initialize(): void;
        uninitialize(): void;
        setTitle(title: string): void;
      }
    }

    class Extension {
      constructor(viewer: GuiViewer3D, options?: any);
      viewer: GuiViewer3D;
      options: any;
      load(): boolean;
      unload(): boolean;
      onToolbarCreated?(toolbar: UI.ToolBar): void;
    }

    namespace Private {
      const HudMessage: any;
      const ErrorCodes: any;
      const analytics: any;
    }

    // Viewer3D Events
    const SELECTION_CHANGED_EVENT = "selection";
    const MODEL_ROOT_LOADED_EVENT = "modelRootLoaded";
    const GEOMETRY_LOADED_EVENT = "geometryLoaded";
    const OBJECT_TREE_CREATED_EVENT = "objectTreeCreated";
    const OBJECT_TREE_UNAVAILABLE_EVENT = "objectTreeUnavailable";
    const MODEL_UNLOADED_EVENT = "modelUnloaded";
    const TOOLBAR_CREATED_EVENT = "toolbarCreated";
    const EXTENSION_LOADED_EVENT = "extensionLoaded";
    const EXTENSION_UNLOADED_EVENT = "extensionUnloaded";
    const CAMERA_CHANGE_EVENT = "cameraChanged";
    const ESCAPE_EVENT = "escape";
    const PROGRESS_UPDATE_EVENT = "progressUpdate";
    const NAVIGATION_MODE_CHANGED_EVENT = "navigationModeChanged";
    const ANIMATION_READY_EVENT = "animationReady";

    // Extension Manager
    namespace theExtensionManager {
      function registerExtension(extensionId: string, extension: typeof Extension): boolean;
      function unregisterExtension(extensionId: string): boolean;
      function getExtension(extensionId: string): typeof Extension;
    }

    // Utilities
    interface Navigation {
      setPosition(position: THREE.Vector3): void;
      getPosition(): THREE.Vector3;
      setTarget(target: THREE.Vector3): void;
      getTarget(): THREE.Vector3;
      setCameraUpVector(up: THREE.Vector3): void;
      setView(position: THREE.Vector3, target: THREE.Vector3): void;
      setRequestTransition(animate: boolean, duration?: number): void;
    }

    interface Utilities {
      fitToView(immediate?: boolean): void;
      isolate(dbIds: number[], model?: Model): void;
      show(dbIds: number[], model?: Model): void;
      hide(dbIds: number[], model?: Model): void;
    }

    // Document and Bubble
    class Document {
      static load(documentId: string, onSuccess: (doc: Document) => void, onError: (error: any) => void, accessToken?: string): void;
      getRoot(): BubbleNode;
    }

    interface BubbleNode {
      findViewableByGuid(guid: string): BubbleNode;
      findAllViewables(): BubbleNode[];
      getDefaultGeometry(): BubbleNode;
      getModelNode(): BubbleNode;
      getDocument(): Document;
      data: any;
    }

    // Initialize
    function Initializer(options: any, onSuccess: () => void, onError?: (error: any) => void): void;
  }
}

// THREE.js extensions for Forge
declare namespace THREE {
  class CSS2DObject extends Object3D {
    constructor(element: HTMLElement);
    element: HTMLElement;
  }

  class CSS2DRenderer {
    constructor();
    domElement: HTMLElement;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
  }
}

// Global Autodesk
declare global {
  interface Window {
    Autodesk: typeof Autodesk;
    THREE: typeof THREE;
    CSS2DObject: typeof THREE.CSS2DObject;
    CSS2DRenderer: typeof THREE.CSS2DRenderer;
  }
}