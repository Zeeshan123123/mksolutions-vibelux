'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

interface GreenhouseViewerProps {
  config: {
    greenhouses: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    lighting: {
      fixtures: number;
      zones: number;
    };
  };
  onLoad?: () => void;
}

export function GreenhouseViewer({ config, onLoad }: GreenhouseViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);
    scene.background = new THREE.Color(0x0a0e1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(800, 400, 800);

    // Renderer setup with high quality settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      precision: "highp"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // SSAO for ambient occlusion
    const ssaoPass = new SSAOPass(scene, camera, mountRef.current.clientWidth, mountRef.current.clientHeight);
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.005;
    ssaoPass.maxDistance = 0.1;
    composer.addPass(ssaoPass);

    // Bloom for lighting effects
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight),
      0.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);

    // Outline pass for selection
    const outlinePass = new OutlinePass(
      new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight),
      scene,
      camera
    );
    outlinePass.edgeStrength = 3;
    outlinePass.edgeGlow = 1;
    outlinePass.visibleEdgeColor.set('#00ff00');
    composer.addPass(outlinePass);
    composerRef.current = composer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 2000;
    controls.maxPolarAngle = Math.PI / 2.1;

    // Advanced lighting setup
    setupLighting(scene);

    // Create greenhouse complex
    const greenhouseComplex = createGreenhouseComplex(config);
    scene.add(greenhouseComplex);

    // Create environment
    createEnvironment(scene);

    // Performance stats
    const stats = Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px';
    stats.dom.style.left = '10px';
    mountRef.current.appendChild(stats.dom);

    // GUI for real-time adjustments
    const gui = new GUI();
    setupGUI(gui, scene, composer);

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.update();
      
      // Animate elements
      animateScene(scene, clock.getElapsedTime());
      
      // Update post-processing
      composer.render();
      
      stats.update();
    };

    animate();
    
    setLoading(false);
    onLoad?.();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      composer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      gui.destroy();
      stats.dom.remove();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [config, onLoad]);

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light with color variation
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(500, 800, 500);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 2000;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Hemisphere light for sky/ground color
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.6);
    scene.add(hemiLight);

    // Add light helpers in debug mode
    if (process.env.NODE_ENV === 'development') {
      const helper = new THREE.DirectionalLightHelper(sunLight, 100);
      scene.add(helper);
    }
  };

  const createGreenhouseComplex = (config: any) => {
    const complex = new THREE.Group();
    
    // Create ground with texture
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
    const groundTexture = createGroundTexture();
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    complex.add(ground);

    // Create multiple greenhouses
    for (let i = 0; i < config.greenhouses; i++) {
      const greenhouse = createAdvancedGreenhouse(config.dimensions);
      greenhouse.position.x = -400 + (i % 3) * 300;
      greenhouse.position.z = -200 + Math.floor(i / 3) * 400;
      complex.add(greenhouse);
    }

    // Add mechanical building
    const mechBuilding = createMechanicalBuilding();
    mechBuilding.position.set(-600, 0, 0);
    complex.add(mechBuilding);

    // Add pathways
    const pathways = createPathways();
    complex.add(pathways);

    return complex;
  };

  const createAdvancedGreenhouse = (dimensions: any) => {
    const greenhouse = new THREE.Group();
    
    // Foundation
    const foundationGeo = new THREE.BoxGeometry(
      dimensions.width + 10,
      5,
      dimensions.length + 10
    );
    const foundationMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1,
    });
    const foundation = new THREE.Mesh(foundationGeo, foundationMat);
    foundation.position.y = 2.5;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    greenhouse.add(foundation);

    // Frame structure with realistic materials
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1,
    });

    // Create Venlo-style peaked roof structure
    const roofFrames = createVenloRoofFrames(dimensions, frameMaterial);
    greenhouse.add(roofFrames);

    // Glass panels with realistic transparency
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 0.9,
      thickness: 0.5,
      envMapIntensity: 0.4,
      clearcoat: 1,
      clearcoatRoughness: 0,
    });

    const glassPanels = createGlassPanels(dimensions, glassMaterial);
    greenhouse.add(glassPanels);

    // Interior systems
    const interiorSystems = createInteriorSystems(dimensions);
    greenhouse.add(interiorSystems);

    // Ventilation
    const vents = createVentilationSystem(dimensions);
    greenhouse.add(vents);

    return greenhouse;
  };

  const createVenloRoofFrames = (dimensions: any, material: THREE.Material) => {
    const frames = new THREE.Group();
    
    // Create peaked roof structure typical of Venlo greenhouses
    const peaks = 3; // 3 peaks for Venlo style
    const peakWidth = dimensions.width / peaks;
    
    for (let p = 0; p < peaks; p++) {
      for (let i = 0; i <= 10; i++) {
        const frame = new THREE.Group();
        
        // Vertical posts
        const postGeo = new THREE.BoxGeometry(2, dimensions.height, 2);
        const leftPost = new THREE.Mesh(postGeo, material);
        leftPost.position.set(-dimensions.width/2 + p * peakWidth, dimensions.height/2, -dimensions.length/2 + i * dimensions.length/10);
        leftPost.castShadow = true;
        frame.add(leftPost);
        
        const rightPost = new THREE.Mesh(postGeo, material);
        rightPost.position.set(-dimensions.width/2 + (p + 1) * peakWidth, dimensions.height/2, -dimensions.length/2 + i * dimensions.length/10);
        rightPost.castShadow = true;
        frame.add(rightPost);
        
        // Roof beams
        const angle = Math.PI / 6; // 30-degree roof angle
        const beamLength = peakWidth / Math.cos(angle);
        const beamGeo = new THREE.BoxGeometry(beamLength, 2, 2);
        
        const leftBeam = new THREE.Mesh(beamGeo, material);
        leftBeam.position.set(
          -dimensions.width/2 + p * peakWidth + peakWidth/4,
          dimensions.height + peakWidth/4 * Math.tan(angle),
          -dimensions.length/2 + i * dimensions.length/10
        );
        leftBeam.rotation.z = -angle;
        leftBeam.castShadow = true;
        frame.add(leftBeam);
        
        const rightBeam = new THREE.Mesh(beamGeo, material);
        rightBeam.position.set(
          -dimensions.width/2 + (p + 1) * peakWidth - peakWidth/4,
          dimensions.height + peakWidth/4 * Math.tan(angle),
          -dimensions.length/2 + i * dimensions.length/10
        );
        rightBeam.rotation.z = angle;
        rightBeam.castShadow = true;
        frame.add(rightBeam);
        
        frames.add(frame);
      }
    }
    
    return frames;
  };

  const createGlassPanels = (dimensions: any, material: THREE.Material) => {
    const panels = new THREE.Group();
    
    // Create glass panels between frames
    const panelGeo = new THREE.PlaneGeometry(dimensions.width / 3 - 4, dimensions.length / 10 - 2);
    
    for (let p = 0; p < 3; p++) {
      for (let i = 0; i < 10; i++) {
        // Roof panels
        const leftPanel = new THREE.Mesh(panelGeo, material);
        leftPanel.position.set(
          -dimensions.width/2 + p * dimensions.width/3 + dimensions.width/6 - dimensions.width/12,
          dimensions.height + 10,
          -dimensions.length/2 + i * dimensions.length/10 + dimensions.length/20
        );
        leftPanel.rotation.x = -Math.PI / 2;
        leftPanel.rotation.z = -Math.PI / 6;
        panels.add(leftPanel);
        
        const rightPanel = new THREE.Mesh(panelGeo, material);
        rightPanel.position.set(
          -dimensions.width/2 + p * dimensions.width/3 + dimensions.width/6 + dimensions.width/12,
          dimensions.height + 10,
          -dimensions.length/2 + i * dimensions.length/10 + dimensions.length/20
        );
        rightPanel.rotation.x = -Math.PI / 2;
        rightPanel.rotation.z = Math.PI / 6;
        panels.add(rightPanel);
      }
    }
    
    // Side wall panels
    const sideGeo = new THREE.PlaneGeometry(dimensions.length / 10 - 2, dimensions.height - 10);
    for (let i = 0; i < 10; i++) {
      const leftWall = new THREE.Mesh(sideGeo, material);
      leftWall.position.set(
        -dimensions.width/2,
        dimensions.height/2 - 5,
        -dimensions.length/2 + i * dimensions.length/10 + dimensions.length/20
      );
      leftWall.rotation.y = Math.PI / 2;
      panels.add(leftWall);
      
      const rightWall = new THREE.Mesh(sideGeo, material);
      rightWall.position.set(
        dimensions.width/2,
        dimensions.height/2 - 5,
        -dimensions.length/2 + i * dimensions.length/10 + dimensions.length/20
      );
      rightWall.rotation.y = -Math.PI / 2;
      panels.add(rightWall);
    }
    
    return panels;
  };

  const createInteriorSystems = (dimensions: any) => {
    const systems = new THREE.Group();
    
    // Growing benches
    const benchMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.3,
      roughness: 0.7,
    });
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        const benchGeo = new THREE.BoxGeometry(dimensions.width / 5, 2, dimensions.length / 12);
        const bench = new THREE.Mesh(benchGeo, benchMaterial);
        bench.position.set(
          -dimensions.width/2 + dimensions.width/5 + row * dimensions.width/4,
          6,
          -dimensions.length/2 + dimensions.length/12 + col * dimensions.length/10
        );
        bench.castShadow = true;
        bench.receiveShadow = true;
        systems.add(bench);
      }
    }
    
    // Irrigation pipes
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      metalness: 0.7,
      roughness: 0.3,
    });
    
    const mainPipeGeo = new THREE.CylinderGeometry(1, 1, dimensions.length);
    const mainPipe = new THREE.Mesh(mainPipeGeo, pipeMaterial);
    mainPipe.position.set(-dimensions.width/2 + 10, 15, 0);
    mainPipe.rotation.x = Math.PI / 2;
    systems.add(mainPipe);
    
    // HVAC ducts
    const ductMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.5,
      roughness: 0.5,
    });
    
    const ductGeo = new THREE.BoxGeometry(5, 5, dimensions.length);
    const duct = new THREE.Mesh(ductGeo, ductMaterial);
    duct.position.set(0, dimensions.height - 5, 0);
    systems.add(duct);
    
    // Grow lights
    const lightFixtures = createGrowLights(dimensions);
    systems.add(lightFixtures);
    
    return systems;
  };

  const createGrowLights = (dimensions: any) => {
    const lights = new THREE.Group();
    
    const fixtureGeo = new THREE.BoxGeometry(15, 2, 5);
    const fixtureMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
    });
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 10; col++) {
        const fixture = new THREE.Mesh(fixtureGeo, fixtureMaterial);
        fixture.position.set(
          -dimensions.width/3 + row * dimensions.width/3,
          dimensions.height - 10,
          -dimensions.length/2 + dimensions.length/20 + col * dimensions.length/10
        );
        fixture.castShadow = true;
        lights.add(fixture);
        
        // Add point light for each fixture
        const pointLight = new THREE.PointLight(0xffff88, 0.5, 50);
        pointLight.position.copy(fixture.position);
        pointLight.position.y -= 5;
        lights.add(pointLight);
      }
    }
    
    return lights;
  };

  const createVentilationSystem = (dimensions: any) => {
    const vents = new THREE.Group();
    
    const ventGeo = new THREE.BoxGeometry(dimensions.width / 6, 1, 20);
    const ventMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.6,
      roughness: 0.4,
    });
    
    for (let i = 0; i < 4; i++) {
      const vent = new THREE.Mesh(ventGeo, ventMaterial);
      vent.position.set(
        0,
        dimensions.height + 15,
        -dimensions.length/2 + dimensions.length/5 + i * dimensions.length/4
      );
      vent.rotation.z = Math.PI / 8 * Math.sin(Date.now() * 0.001 + i);
      vents.add(vent);
    }
    
    // HAF fans
    const fanGeo = new THREE.CylinderGeometry(5, 5, 2, 8);
    const fanMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3,
    });
    
    for (let i = 0; i < 6; i++) {
      const fan = new THREE.Mesh(fanGeo, fanMaterial);
      fan.position.set(
        -dimensions.width/2 + dimensions.width/4 + (i % 2) * dimensions.width/2,
        dimensions.height - 15,
        -dimensions.length/2 + dimensions.length/4 + Math.floor(i / 2) * dimensions.length/3
      );
      vents.add(fan);
    }
    
    return vents;
  };

  const createMechanicalBuilding = () => {
    const building = new THREE.Group();
    
    // Main structure
    const buildingGeo = new THREE.BoxGeometry(80, 40, 100);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x404040,
      roughness: 0.8,
      metalness: 0.2,
    });
    const structure = new THREE.Mesh(buildingGeo, buildingMat);
    structure.position.y = 20;
    structure.castShadow = true;
    structure.receiveShadow = true;
    building.add(structure);
    
    // Boiler chimney
    const chimneyGeo = new THREE.CylinderGeometry(5, 5, 60);
    const chimneyMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.3,
      roughness: 0.7,
    });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(20, 50, 20);
    chimney.castShadow = true;
    building.add(chimney);
    
    // Water tank
    const tankGeo = new THREE.CylinderGeometry(25, 25, 30);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      metalness: 0.6,
      roughness: 0.4,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(-30, 15, -30);
    tank.castShadow = true;
    building.add(tank);
    
    return building;
  };

  const createPathways = () => {
    const pathways = new THREE.Group();
    
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.9,
      metalness: 0.1,
    });
    
    // Main pathway
    const mainPathGeo = new THREE.PlaneGeometry(50, 1000);
    const mainPath = new THREE.Mesh(mainPathGeo, pathMaterial);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.y = 0.1;
    mainPath.position.x = -450;
    pathways.add(mainPath);
    
    // Cross pathways
    for (let i = 0; i < 3; i++) {
      const crossPathGeo = new THREE.PlaneGeometry(800, 30);
      const crossPath = new THREE.Mesh(crossPathGeo, pathMaterial);
      crossPath.rotation.x = -Math.PI / 2;
      crossPath.position.y = 0.1;
      crossPath.position.z = -200 + i * 200;
      pathways.add(crossPath);
    }
    
    return pathways;
  };

  const createGroundTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Create a simple ground texture
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, 512, 512);
    
    // Add some variation
    for (let i = 0; i < 1000; i++) {
      context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
      context.fillRect(
        Math.random() * 512,
        Math.random() * 512,
        Math.random() * 4,
        Math.random() * 4
      );
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    return texture;
  };

  const createEnvironment = (scene: THREE.Scene) => {
    // Sky
    const skyGeo = new THREE.SphereGeometry(5000, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
    
    // Clouds
    const cloudGroup = new THREE.Group();
    const cloudGeo = new THREE.SphereGeometry(50, 8, 6);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    
    for (let i = 0; i < 20; i++) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
        Math.random() * 2000 - 1000,
        Math.random() * 200 + 500,
        Math.random() * 2000 - 1000
      );
      cloud.scale.set(
        Math.random() * 3 + 1,
        Math.random() * 2 + 1,
        Math.random() * 3 + 1
      );
      cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);
    
    // Trees
    const treeGroup = new THREE.Group();
    const treeTrunkGeo = new THREE.CylinderGeometry(2, 3, 20);
    const treeTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
    });
    const treeLeavesGeo = new THREE.SphereGeometry(15, 8, 6);
    const treeLeavesMat = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.8,
    });
    
    for (let i = 0; i < 50; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 10;
      trunk.castShadow = true;
      tree.add(trunk);
      
      const leaves = new THREE.Mesh(treeLeavesGeo, treeLeavesMat);
      leaves.position.y = 25;
      leaves.castShadow = true;
      tree.add(leaves);
      
      tree.position.set(
        Math.random() * 2000 - 1000,
        0,
        Math.random() * 2000 - 1000
      );
      
      // Keep trees away from greenhouse area
      if (Math.abs(tree.position.x) < 600 && Math.abs(tree.position.z) < 600) {
        tree.position.x = tree.position.x < 0 ? -600 : 600;
      }
      
      treeGroup.add(tree);
    }
    scene.add(treeGroup);
  };

  const animateScene = (scene: THREE.Scene, time: number) => {
    // Animate ventilation
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Rotate fans
        if (child.geometry instanceof THREE.CylinderGeometry && child.position.y > 50) {
          child.rotation.y = time * 2;
        }
      }
    });
    
    // Animate clouds
    const clouds = scene.children.find(child => child instanceof THREE.Group && child.children[0]?.geometry instanceof THREE.SphereGeometry);
    if (clouds) {
      clouds.rotation.y = time * 0.01;
    }
  };

  const setupGUI = (gui: GUI, scene: THREE.Scene, composer: EffectComposer) => {
    const params = {
      showGrid: true,
      showStats: true,
      bloomStrength: 0.5,
      bloomRadius: 0.4,
      bloomThreshold: 0.85,
      ssaoEnabled: true,
      fogDensity: 0.0008,
    };
    
    gui.add(params, 'showGrid').onChange((value: boolean) => {
      // Toggle grid visibility
    });
    
    gui.add(params, 'fogDensity', 0, 0.01).onChange((value: number) => {
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = value;
      }
    });
    
    const bloomFolder = gui.addFolder('Bloom');
    bloomFolder.add(params, 'bloomStrength', 0, 3).onChange((value: number) => {
      const bloomPass = composer.passes.find(pass => pass instanceof UnrealBloomPass) as UnrealBloomPass;
      if (bloomPass) bloomPass.strength = value;
    });
    
    bloomFolder.add(params, 'bloomRadius', 0, 1).onChange((value: number) => {
      const bloomPass = composer.passes.find(pass => pass instanceof UnrealBloomPass) as UnrealBloomPass;
      if (bloomPass) bloomPass.radius = value;
    });
    
    bloomFolder.add(params, 'bloomThreshold', 0, 1).onChange((value: number) => {
      const bloomPass = composer.passes.find(pass => pass instanceof UnrealBloomPass) as UnrealBloomPass;
      if (bloomPass) bloomPass.threshold = value;
    });
  };

  return (
    <div ref={mountRef} className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <div className="mb-4">Loading 3D Environment...</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}