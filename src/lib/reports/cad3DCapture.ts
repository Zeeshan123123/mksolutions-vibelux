import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface CAD3DOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  quality?: number;
}

export class CAD3DRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  constructor(options: CAD3DOptions) {
    // Create off-screen canvas for rendering
    this.canvas = document.createElement('canvas');
    this.canvas.width = options.width;
    this.canvas.height = options.height;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.backgroundColor || '#f8f9fa');

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      60,
      options.width / options.height,
      0.1,
      10000
    );

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true
    });
    this.renderer.setSize(options.width, options.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(500, 800, 500);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 2000;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
    fillLight.position.set(-300, 400, -300);
    this.scene.add(fillLight);
  }

  private createRealistic3DGreenhouse(config: any, position: THREE.Vector3) {
    const greenhouse = new THREE.Group();
    
    // Foundation
    const foundationGeo = new THREE.BoxGeometry(
      config.dimensions.width + 4,
      3,
      config.dimensions.length + 4
    );
    const foundationMat = new THREE.MeshLambertMaterial({
      color: 0x444444
    });
    const foundation = new THREE.Mesh(foundationGeo, foundationMat);
    foundation.position.y = 1.5;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    greenhouse.add(foundation);

    // Aluminum frame structure
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.8,
      roughness: 0.3
    });

    // Vertical posts every 20 feet
    const posts = Math.floor(config.dimensions.length / 20);
    for (let i = 0; i <= posts; i++) {
      const postGeo = new THREE.BoxGeometry(1, config.dimensions.height, 1);
      
      // Left side posts
      const leftPost = new THREE.Mesh(postGeo, frameMaterial);
      leftPost.position.set(
        -config.dimensions.width/2,
        config.dimensions.height/2 + 3,
        -config.dimensions.length/2 + i * (config.dimensions.length/posts)
      );
      leftPost.castShadow = true;
      greenhouse.add(leftPost);
      
      // Right side posts
      const rightPost = new THREE.Mesh(postGeo, frameMaterial);
      rightPost.position.set(
        config.dimensions.width/2,
        config.dimensions.height/2 + 3,
        -config.dimensions.length/2 + i * (config.dimensions.length/posts)
      );
      rightPost.castShadow = true;
      greenhouse.add(rightPost);
    }

    // Venlo-style peaked roof structure
    const peaks = 3;
    const peakWidth = config.dimensions.width / peaks;
    
    for (let p = 0; p < peaks; p++) {
      for (let i = 0; i <= posts; i++) {
        // Roof peak beams
        const peakHeight = 8;
        const leftBeamGeo = new THREE.BoxGeometry(peakWidth/2, 1, 1);
        const rightBeamGeo = new THREE.BoxGeometry(peakWidth/2, 1, 1);
        
        const leftBeam = new THREE.Mesh(leftBeamGeo, frameMaterial);
        leftBeam.position.set(
          -config.dimensions.width/2 + p * peakWidth + peakWidth/4,
          config.dimensions.height + peakHeight/2 + 3,
          -config.dimensions.length/2 + i * (config.dimensions.length/posts)
        );
        leftBeam.rotation.z = -Math.PI / 8;
        leftBeam.castShadow = true;
        greenhouse.add(leftBeam);
        
        const rightBeam = new THREE.Mesh(rightBeamGeo, frameMaterial);
        rightBeam.position.set(
          -config.dimensions.width/2 + (p + 1) * peakWidth - peakWidth/4,
          config.dimensions.height + peakHeight/2 + 3,
          -config.dimensions.length/2 + i * (config.dimensions.length/posts)
        );
        rightBeam.rotation.z = Math.PI / 8;
        rightBeam.castShadow = true;
        greenhouse.add(rightBeam);
      }
    }

    // Glass panels with realistic material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.85,
      thickness: 0.5,
      transparent: true,
      opacity: 0.7
    });

    // Side walls
    for (let i = 0; i < posts; i++) {
      const wallGeo = new THREE.PlaneGeometry(
        config.dimensions.length/posts - 1,
        config.dimensions.height - 2
      );
      
      const leftWall = new THREE.Mesh(wallGeo, glassMaterial);
      leftWall.position.set(
        -config.dimensions.width/2,
        config.dimensions.height/2 + 2,
        -config.dimensions.length/2 + (i + 0.5) * (config.dimensions.length/posts)
      );
      leftWall.rotation.y = Math.PI / 2;
      greenhouse.add(leftWall);
      
      const rightWall = new THREE.Mesh(wallGeo, glassMaterial);
      rightWall.position.set(
        config.dimensions.width/2,
        config.dimensions.height/2 + 2,
        -config.dimensions.length/2 + (i + 0.5) * (config.dimensions.length/posts)
      );
      rightWall.rotation.y = -Math.PI / 2;
      greenhouse.add(rightWall);
    }

    // Roof panels
    for (let p = 0; p < peaks; p++) {
      for (let i = 0; i < posts; i++) {
        const roofGeo = new THREE.PlaneGeometry(
          peakWidth/2 - 1,
          config.dimensions.length/posts - 1
        );
        
        // Left roof slope
        const leftRoof = new THREE.Mesh(roofGeo, glassMaterial);
        leftRoof.position.set(
          -config.dimensions.width/2 + p * peakWidth + peakWidth/4,
          config.dimensions.height + 6,
          -config.dimensions.length/2 + (i + 0.5) * (config.dimensions.length/posts)
        );
        leftRoof.rotation.x = -Math.PI / 2;
        leftRoof.rotation.z = -Math.PI / 8;
        greenhouse.add(leftRoof);
        
        // Right roof slope
        const rightRoof = new THREE.Mesh(roofGeo, glassMaterial);
        rightRoof.position.set(
          -config.dimensions.width/2 + (p + 1) * peakWidth - peakWidth/4,
          config.dimensions.height + 6,
          -config.dimensions.length/2 + (i + 0.5) * (config.dimensions.length/posts)
        );
        rightRoof.rotation.x = -Math.PI / 2;
        rightRoof.rotation.z = Math.PI / 8;
        greenhouse.add(rightRoof);
      }
    }

    // Interior growing benches
    const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const benchesPerRow = Math.floor(config.dimensions.length / 15);
    const benchRows = 4;
    
    for (let row = 0; row < benchRows; row++) {
      for (let bench = 0; bench < benchesPerRow; bench++) {
        const benchGeo = new THREE.BoxGeometry(config.dimensions.width / 6, 1, 12);
        const benchMesh = new THREE.Mesh(benchGeo, benchMaterial);
        benchMesh.position.set(
          -config.dimensions.width/3 + row * config.dimensions.width/6,
          4,
          -config.dimensions.length/2 + 10 + bench * 15
        );
        benchMesh.castShadow = true;
        benchMesh.receiveShadow = true;
        greenhouse.add(benchMesh);
      }
    }

    // Lighting fixtures
    const fixtureMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffff88,
      emissive: 0x444400
    });
    
    const fixturesPerRow = Math.floor(config.dimensions.length / 10);
    const lightRows = 3;
    
    for (let row = 0; row < lightRows; row++) {
      for (let fixture = 0; fixture < fixturesPerRow; fixture++) {
        const fixtureGeo = new THREE.BoxGeometry(8, 1, 3);
        const fixtureMesh = new THREE.Mesh(fixtureGeo, fixtureMaterial);
        fixtureMesh.position.set(
          -config.dimensions.width/4 + row * config.dimensions.width/4,
          config.dimensions.height - 2,
          -config.dimensions.length/2 + 8 + fixture * 10
        );
        fixtureMesh.castShadow = true;
        greenhouse.add(fixtureMesh);
        
        // Add actual light source
        const pointLight = new THREE.PointLight(0xffff88, 0.3, 30);
        pointLight.position.copy(fixtureMesh.position);
        pointLight.position.y -= 3;
        greenhouse.add(pointLight);
      }
    }

    greenhouse.position.copy(position);
    return greenhouse;
  }

  public async generateFacilityOverview(config: any): Promise<string> {
    this.setupLighting();
    
    // Ground
    const groundGeo = new THREE.PlaneGeometry(2000, 1500);
    const groundMat = new THREE.MeshLambertMaterial({ 
      color: 0x2d5016,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Create 5 connected Venlo greenhouses
    const greenhousePositions = [
      new THREE.Vector3(-200, 0, -100),
      new THREE.Vector3(0, 0, -100),
      new THREE.Vector3(200, 0, -100),
      new THREE.Vector3(-100, 0, 100),
      new THREE.Vector3(100, 0, 100)
    ];

    greenhousePositions.forEach((position, index) => {
      const greenhouse = this.createRealistic3DGreenhouse(config.structures, position);
      this.scene.add(greenhouse);
    });

    // Mechanical building
    const mechBuildingGeo = new THREE.BoxGeometry(60, 25, 80);
    const mechBuildingMat = new THREE.MeshLambertMaterial({ color: 0x505050 });
    const mechBuilding = new THREE.Mesh(mechBuildingGeo, mechBuildingMat);
    mechBuilding.position.set(400, 12.5, 0);
    mechBuilding.castShadow = true;
    mechBuilding.receiveShadow = true;
    this.scene.add(mechBuilding);

    // Position camera for overhead angled view
    this.camera.position.set(600, 400, 600);
    this.camera.lookAt(0, 0, 0);

    // Render
    this.renderer.render(this.scene, this.camera);
    
    return this.canvas.toDataURL('image/png', 0.9);
  }

  public async generateInteriorView(config: any): Promise<string> {
    // Clear scene
    this.scene.clear();
    this.setupLighting();

    // Create single greenhouse interior
    const greenhouse = this.createRealistic3DGreenhouse(config.structures, new THREE.Vector3(0, 0, 0));
    this.scene.add(greenhouse);

    // Position camera inside for interior view
    this.camera.position.set(0, 15, -config.structures.dimensions.length/3);
    this.camera.lookAt(0, 10, config.structures.dimensions.length/4);

    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png', 0.9);
  }

  public async generateLightingView(config: any): Promise<string> {
    // Clear scene
    this.scene.clear();
    this.setupLighting();

    // Create greenhouse with emphasis on lighting
    const greenhouse = this.createRealistic3DGreenhouse(config.structures, new THREE.Vector3(0, 0, 0));
    this.scene.add(greenhouse);

    // Add lighting grid visualization
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 });
    const gridHelper = new THREE.GridHelper(config.structures.dimensions.length, 20, 0xffff00, 0xffff88);
    gridHelper.position.y = config.structures.dimensions.height - 5;
    this.scene.add(gridHelper);

    // Position camera to show lighting layout
    this.camera.position.set(50, config.structures.dimensions.height + 20, -50);
    this.camera.lookAt(0, config.structures.dimensions.height - 5, 0);

    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png', 0.9);
  }

  public dispose() {
    this.renderer.dispose();
    this.canvas.remove();
  }
}

export async function generate3DCADViews(config: any): Promise<{
  overview: string;
  interior: string;
  lighting: string;
}> {
  const renderer = new CAD3DRenderer({ 
    width: 1200, 
    height: 800,
    backgroundColor: '#f8f9fa',
    quality: 0.9
  });

  try {
    const [overview, interior, lighting] = await Promise.all([
      renderer.generateFacilityOverview(config),
      renderer.generateInteriorView(config),
      renderer.generateLightingView(config)
    ]);

    return { overview, interior, lighting };
  } finally {
    renderer.dispose();
  }
}