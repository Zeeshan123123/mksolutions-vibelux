import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Fixture {
  id: string;
  model: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  power: number;
  selected?: boolean;
}

interface Room {
  width: number;
  height: number;
  length: number;
  reflectivity: number;
}

interface DesignState {
  // Current design data
  currentProject: {
    id: string | null;
    name: string;
    room: Room;
    fixtures: Fixture[];
    selectedFixtureIds: string[];
    isDirty: boolean;
  };
  
  // Design mode
  mode: 'select' | 'draw' | 'array' | 'measure' | 'pan';
  tool: string | null;
  
  // View settings
  view: {
    zoom: number;
    panX: number;
    panY: number;
    showGrid: boolean;
    showMeasurements: boolean;
    showHeatmap: boolean;
    show3D: boolean;
  };
  
  // History for undo/redo
  history: {
    past: any[];
    future: any[];
  };
  
  // Actions
  setProject: (id: string, name: string) => void;
  setRoom: (room: Partial<Room>) => void;
  addFixture: (fixture: Omit<Fixture, 'id'>) => void;
  updateFixture: (id: string, updates: Partial<Fixture>) => void;
  deleteFixture: (id: string) => void;
  selectFixture: (id: string, multiSelect?: boolean) => void;
  deselectAll: () => void;
  setMode: (mode: DesignState['mode']) => void;
  setTool: (tool: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleGrid: () => void;
  toggleMeasurements: () => void;
  toggleHeatmap: () => void;
  toggle3D: () => void;
  undo: () => void;
  redo: () => void;
  markDirty: () => void;
  markClean: () => void;
  reset: () => void;
}

export const useDesignStore = create<DesignState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      currentProject: {
        id: null,
        name: 'Untitled Design',
        room: {
          width: 10,
          height: 3,
          length: 10,
          reflectivity: 0.7,
        },
        fixtures: [],
        selectedFixtureIds: [],
        isDirty: false,
      },
      
      mode: 'select',
      tool: null,
      
      view: {
        zoom: 1,
        panX: 0,
        panY: 0,
        showGrid: true,
        showMeasurements: true,
        showHeatmap: false,
        show3D: false,
      },
      
      history: {
        past: [],
        future: [],
      },
      
      // Actions
      setProject: (id, name) =>
        set((state) => {
          state.currentProject.id = id;
          state.currentProject.name = name;
          state.currentProject.isDirty = false;
        }),
        
      setRoom: (room) =>
        set((state) => {
          Object.assign(state.currentProject.room, room);
          state.currentProject.isDirty = true;
        }),
        
      addFixture: (fixture) =>
        set((state) => {
          const id = `fixture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          state.currentProject.fixtures.push({ ...fixture, id });
          state.currentProject.isDirty = true;
        }),
        
      updateFixture: (id, updates) =>
        set((state) => {
          const fixture = state.currentProject.fixtures.find(f => f.id === id);
          if (fixture) {
            Object.assign(fixture, updates);
            state.currentProject.isDirty = true;
          }
        }),
        
      deleteFixture: (id) =>
        set((state) => {
          state.currentProject.fixtures = state.currentProject.fixtures.filter(f => f.id !== id);
          state.currentProject.selectedFixtureIds = state.currentProject.selectedFixtureIds.filter(fId => fId !== id);
          state.currentProject.isDirty = true;
        }),
        
      selectFixture: (id, multiSelect = false) =>
        set((state) => {
          if (multiSelect) {
            if (state.currentProject.selectedFixtureIds.includes(id)) {
              state.currentProject.selectedFixtureIds = state.currentProject.selectedFixtureIds.filter(fId => fId !== id);
            } else {
              state.currentProject.selectedFixtureIds.push(id);
            }
          } else {
            state.currentProject.selectedFixtureIds = [id];
          }
        }),
        
      deselectAll: () =>
        set((state) => {
          state.currentProject.selectedFixtureIds = [];
        }),
        
      setMode: (mode) =>
        set((state) => {
          state.mode = mode;
          if (mode !== 'draw') {
            state.tool = null;
          }
        }),
        
      setTool: (tool) =>
        set((state) => {
          state.tool = tool;
        }),
        
      setZoom: (zoom) =>
        set((state) => {
          state.view.zoom = Math.max(0.1, Math.min(5, zoom));
        }),
        
      setPan: (x, y) =>
        set((state) => {
          state.view.panX = x;
          state.view.panY = y;
        }),
        
      toggleGrid: () =>
        set((state) => {
          state.view.showGrid = !state.view.showGrid;
        }),
        
      toggleMeasurements: () =>
        set((state) => {
          state.view.showMeasurements = !state.view.showMeasurements;
        }),
        
      toggleHeatmap: () =>
        set((state) => {
          state.view.showHeatmap = !state.view.showHeatmap;
        }),
        
      toggle3D: () =>
        set((state) => {
          state.view.show3D = !state.view.show3D;
        }),
        
      undo: () => {
        // Implement undo logic
        logger.info('api', 'Undo not implemented yet');
      },
      
      redo: () => {
        // Implement redo logic
        logger.info('api', 'Redo not implemented yet');
      },
      
      markDirty: () =>
        set((state) => {
          state.currentProject.isDirty = true;
        }),
        
      markClean: () =>
        set((state) => {
          state.currentProject.isDirty = false;
        }),
        
      reset: () =>
        set((state) => {
          state.currentProject = {
            id: null,
            name: 'Untitled Design',
            room: {
              width: 10,
              height: 3,
              length: 10,
              reflectivity: 0.7,
            },
            fixtures: [],
            selectedFixtureIds: [],
            isDirty: false,
          };
          state.mode = 'select';
          state.tool = null;
          state.view = {
            zoom: 1,
            panX: 0,
            panY: 0,
            showGrid: true,
            showMeasurements: true,
            showHeatmap: false,
            show3D: false,
          };
          state.history = {
            past: [],
            future: [],
          };
        }),
    })),
    {
      name: 'Design Store',
    }
  )
);

// Selectors
export const useCurrentProject = () => useDesignStore((state) => state.currentProject);
export const useSelectedFixtures = () => useDesignStore((state) => 
  state.currentProject.fixtures.filter(f => 
    state.currentProject.selectedFixtureIds.includes(f.id)
  )
);
export const useDesignMode = () => useDesignStore((state) => state.mode);
export const useViewSettings = () => useDesignStore((state) => state.view);
export const useIsProjectDirty = () => useDesignStore((state) => state.currentProject.isDirty);