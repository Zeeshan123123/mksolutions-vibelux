import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryAdvanced } from './cloudinary-advanced';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface Model3DResult {
  viewerUrl: string;
  thumbnailUrl: string;
  animatedPreviewUrl: string;
  formats: {
    glb?: string;
    usdz?: string;
    obj?: string;
    fbx?: string;
  };
  metadata: {
    vertices: number;
    faces: number;
    materials: number;
    animations: number;
    fileSize: number;
  };
}

// Process and display 3D CAD models
export async function process3DModel(
  modelFile: string | File,
  options?: {
    autoRotate?: boolean;
    backgroundColor?: string;
    lighting?: 'studio' | 'outdoor' | 'soft';
    cameraPosition?: { x: number; y: number; z: number };
  }
): Promise<Model3DResult> {
  try {
    // Upload 3D model
    const uploadResult = await cloudinary.uploader.upload(
      typeof modelFile === 'string' ? modelFile : await fileToBase64(modelFile as File),
      {
        resource_type: 'auto',
        folder: 'cad_models_3d',
        type: 'upload',
        
        // 3D model processing
        eager: [
          // Generate static thumbnail
          {
            width: 800,
            height: 600,
            crop: 'fit',
            format: 'jpg',
            quality: 'auto:best',
            angle: 45, // Viewing angle
            background: options?.backgroundColor || '#f5f5f5'
          },
          
          // Generate rotating preview GIF
          {
            width: 600,
            height: 600,
            format: 'gif',
            delay: 100,
            angle: 'auto_rotate', // 360 degree rotation
            frames: 36, // Smooth rotation
            background: options?.backgroundColor || '#ffffff'
          },
          
          // Generate WebGL preview
          {
            format: 'glb', // GLTF binary format
            flags: '3d_viewer',
            background: options?.backgroundColor || 'transparent'
          }
        ],
        
        // Extract 3D metadata
        moderation: '3d_model_analysis',
        
        notification_url: process.env.NEXT_PUBLIC_WEBHOOK_URL
      }
    );

    // Generate interactive 3D viewer URL
    const viewerUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: 'raw',
      format: 'html',
      transformation: [
        {
          flags: '3d_viewer',
          width: 1200,
          height: 800,
          
          // Viewer customization
          variables: {
            auto_rotate: options?.autoRotate !== false,
            background_color: options?.backgroundColor || '#f0f0f0',
            lighting_preset: options?.lighting || 'studio',
            enable_ar: true, // Enable AR viewing on mobile
            enable_vr: true, // Enable VR support
            show_controls: true,
            show_stats: false,
            
            // Camera settings
            camera_fov: 75,
            camera_near: 0.1,
            camera_far: 1000,
            camera_position: options?.cameraPosition || { x: 5, y: 5, z: 5 }
          }
        }
      ]
    });

    // Generate format variants
    const formats: Model3DResult['formats'] = {
      glb: cloudinary.url(uploadResult.public_id, {
        resource_type: 'auto',
        format: 'glb',
        flags: 'attachment'
      }),
      usdz: cloudinary.url(uploadResult.public_id, {
        resource_type: 'auto',
        format: 'usdz', // For Apple AR
        flags: 'attachment'
      }),
      obj: cloudinary.url(uploadResult.public_id, {
        resource_type: 'auto',
        format: 'obj',
        flags: 'attachment'
      }),
      fbx: cloudinary.url(uploadResult.public_id, {
        resource_type: 'auto',
        format: 'fbx',
        flags: 'attachment'
      })
    };

    // Extract metadata (mock data - real implementation would parse from upload response)
    const metadata = {
      vertices: uploadResult.info?.model_analysis?.vertices || 50000,
      faces: uploadResult.info?.model_analysis?.faces || 100000,
      materials: uploadResult.info?.model_analysis?.materials || 5,
      animations: uploadResult.info?.model_analysis?.animations || 0,
      fileSize: uploadResult.bytes || 0
    };

    return {
      viewerUrl,
      thumbnailUrl: uploadResult.eager[0]?.secure_url || uploadResult.secure_url,
      animatedPreviewUrl: uploadResult.eager[1]?.secure_url || '',
      formats,
      metadata
    };
    
  } catch (error) {
    logger.error('api', '3D model processing error:', error );
    throw new Error('Failed to process 3D model');
  }
}

// Generate AR Quick Look for iOS
export async function generateARQuickLook(
  modelPublicId: string,
  options?: {
    title?: string;
    subtitle?: string;
    allowScaling?: boolean;
  }
): Promise<string> {
  return cloudinary.url(modelPublicId, {
    resource_type: 'auto',
    format: 'usdz',
    transformation: [
      {
        // AR customization
        variables: {
          ar_title: options?.title || 'View in AR',
          ar_subtitle: options?.subtitle || 'Place in your space',
          ar_allow_scaling: options?.allowScaling !== false,
          ar_placement: 'horizontal', // Floor placement
          ar_scale: 1.0
        }
      }
    ]
  });
}

// Create 3D equipment showcase
export async function create3DShowcase(
  modelIds: string[],
  options?: {
    title?: string;
    layout?: 'grid' | 'carousel' | 'comparison';
    annotations?: Array<{
      modelId: string;
      text: string;
      position: { x: number; y: number; z: number };
    }>;
  }
): Promise<string> {
  // Create a multi-model viewer
  const showcaseManifest = {
    version: '1.0',
    title: options?.title || '3D Equipment Showcase',
    layout: options?.layout || 'carousel',
    models: modelIds.map((id, index) => ({
      id: id,
      position: {
        x: index * 3,
        y: 0,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: 1,
      annotations: options?.annotations?.filter(a => a.modelId === id) || []
    })),
    environment: {
      background: '#f5f5f5',
      lighting: 'studio',
      shadows: true,
      reflections: true
    },
    camera: {
      type: 'orbital',
      autoRotate: true,
      controls: true
    }
  };

  // Upload showcase configuration
  const result = await cloudinary.uploader.upload_large(
    `data:application/json;base64,${Buffer.from(JSON.stringify(showcaseManifest)).toString('base64')}`,
    {
      public_id: `showcase_${Date.now()}`,
      resource_type: 'raw',
      format: 'json',
      folder: '3d_showcases'
    }
  );

  // Generate viewer URL
  return cloudinary.url(result.public_id, {
    resource_type: 'raw',
    format: 'html',
    transformation: [
      {
        flags: '3d_showcase_viewer',
        width: 1400,
        height: 900
      }
    ]
  });
}

// Convert 2D CAD drawing to 3D
export async function convertCADTo3D(
  cadFileUrl: string,
  options?: {
    extrusion?: number; // Depth for 2D to 3D conversion
    material?: 'metal' | 'plastic' | 'wood' | 'glass';
    color?: string;
  }
): Promise<Model3DResult> {
  try {
    // This would use Autodesk Forge API for actual conversion
    // For now, we'll simulate the process
    
    const uploadResult = await cloudinary.uploader.upload(cadFileUrl, {
      resource_type: 'auto',
      folder: 'cad_to_3d',
      
      transformation: [
        {
          // CAD to 3D conversion parameters
          effect: 'cad_to_3d',
          extrusion_depth: options?.extrusion || 10,
          material_preset: options?.material || 'metal',
          material_color: options?.color || '#808080',
          
          // Output format
          format: 'glb'
        }
      ],
      
      eager: [
        // 3D preview
        {
          width: 800,
          height: 600,
          format: 'jpg',
          angle: 30,
          background: '#f0f0f0'
        }
      ]
    });

    return process3DModel(uploadResult.secure_url);
    
  } catch (error) {
    logger.error('api', 'CAD to 3D conversion error:', error );
    throw new Error('Failed to convert CAD to 3D');
  }
}

// Generate 3D heatmap for lighting analysis
export async function generate3DHeatmap(
  roomModelId: string,
  lightingData: Array<{
    position: { x: number; y: number; z: number };
    intensity: number;
    spread: number;
  }>
): Promise<string> {
  // Create heatmap overlay for 3D model
  const heatmapConfig = {
    model: roomModelId,
    analysis_type: 'lighting_ppfd',
    data_points: lightingData,
    color_scale: {
      min: { value: 0, color: '#0000ff' },
      mid: { value: 500, color: '#00ff00' },
      max: { value: 1000, color: '#ff0000' }
    },
    opacity: 0.7,
    interpolation: 'smooth'
  };

  const result = await cloudinary.uploader.upload(
    `data:application/json;base64,${Buffer.from(JSON.stringify(heatmapConfig)).toString('base64')}`,
    {
      public_id: `heatmap_${Date.now()}`,
      resource_type: 'raw',
      folder: '3d_analysis',
      
      transformation: [
        {
          overlay: roomModelId,
          flags: '3d_heatmap_overlay'
        }
      ]
    }
  );

  return cloudinary.url(result.public_id, {
    resource_type: 'raw',
    format: 'html',
    flags: '3d_analysis_viewer'
  });
}

// Helper function
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Export 3D model viewer component configuration
export const Model3DViewerConfig = {
  // Supported file formats
  supportedFormats: [
    '.glb', '.gltf', '.obj', '.fbx', '.stl', 
    '.ply', '.3ds', '.dae', '.usdz', '.dwg'
  ],
  
  // Viewer settings
  defaultSettings: {
    autoRotate: true,
    autoRotateSpeed: 2,
    enableZoom: true,
    enablePan: true,
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 1,
    maxDistance: 100,
    maxPolarAngle: Math.PI / 2,
    
    // Lighting
    ambientIntensity: 0.3,
    directionalIntensity: 0.8,
    environmentIntensity: 1,
    
    // Performance
    antialias: true,
    pixelRatio: window.devicePixelRatio || 1,
    shadowMap: true,
    toneMapping: 'ACESFilmic'
  },
  
  // Mobile AR settings
  arSettings: {
    requiredFeatures: ['hit-test', 'anchors'],
    optionalFeatures: ['dom-overlay', 'light-estimation'],
    scale: 'auto',
    placement: 'floor'
  }
};