// Comprehensive Cloudinary Configuration for VibeLux
// This file contains all available Cloudinary features and optimizations

export const CloudinaryConfig = {
  // Account settings
  account: {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
    private_cdn: false, // Upgrade to enable
    cdn_subdomain: true,
    analytics: true,
    urlAnalytics: true
  },

  // Upload presets with AI features
  uploadPresets: {
    plant_health: {
      preset: 'vibelux_plant_health',
      folder: 'plant_health',
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'raw', 'tiff'],
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' },
        { dpr: 'auto' }
      ],
      ai_features: {
        detection: 'adv_face', // Detects plant features
        ocr: 'adv_ocr', // Reads labels
        categorization: 'google_tagging',
        auto_tagging: 0.7,
        quality_analysis: true,
        accessibility_analysis: true,
        colors: true,
        faces: true,
        moderation: 'aws_rek'
      },
      eager_transformations: [
        // AI-enhanced version
        { 
          transformation: 'ai_enhance',
          format: 'auto',
          quality: 'auto:best'
        },
        // Background removed
        {
          transformation: 'bg_removal',
          format: 'png'
        },
        // Social media versions
        {
          transformation: 'social_square',
          width: 1080,
          height: 1080,
          crop: 'fill',
          gravity: 'auto'
        }
      ],
      backup: true,
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      invalidate: true,
      notification_url: process.env.NEXT_PUBLIC_WEBHOOK_URL
    },

    equipment: {
      preset: 'vibelux_equipment',
      folder: 'equipment',
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { background_removal: 'cloudinary_ai' },
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ],
      ai_features: {
        detection: 'cld-fashion', // Better for products
        ocr: 'adv_ocr',
        categorization: 'google_tagging',
        auto_tagging: 0.8,
        background_removal: true
      }
    },

    cad_files: {
      preset: 'vibelux_design_cad',
      folder: 'cad_designs',
      allowedFormats: ['pdf', 'dwg', 'dxf', 'svg', 'ai', 'eps'],
      resource_type: 'raw',
      transformation: [
        { page: 1 }, // For PDFs
        { density: 300 }, // High quality
        { quality: 'auto:best' }
      ]
    }
  },

  // Optimization settings
  optimizations: {
    // Automatic format selection
    format: {
      auto: true,
      preferred: ['avif', 'webp', 'jpg'],
      fallback: 'jpg'
    },
    
    // Quality settings
    quality: {
      default: 'auto:good',
      profiles: {
        thumbnail: 'auto:low',
        preview: 'auto:eco',
        display: 'auto:good',
        print: 'auto:best',
        archive: '100'
      }
    },

    // Responsive images
    responsive: {
      breakpoints: [320, 640, 960, 1280, 1600, 1920, 2560],
      steps: 150, // Generate every 150px
      bytes_step: 20000, // Or every 20KB
      min_width: 100,
      max_width: 3000,
      max_images: 20
    },

    // Performance
    performance: {
      dpr: 'auto', // Device pixel ratio
      progressive: true,
      strip_metadata: false, // Keep EXIF for analysis
      lossy: true,
      webp_lossless: false
    }
  },

  // AI and ML features
  ai_ml: {
    // Background removal
    background_removal: {
      enabled: true,
      fine_edges: true,
      hints: ['plant', 'equipment', 'product']
    },

    // Generative AI
    generative_ai: {
      gen_fill: true, // Fill missing parts
      gen_replace: true, // Replace objects
      gen_recolor: true, // Change colors
      gen_restore: true, // Restore old/damaged images
      gen_background_replace: true
    },

    // Object detection
    object_detection: {
      models: ['coco', 'lvis', 'openimages'],
      custom_model: 'vibelux_plants' // Train custom model
    },

    // Visual search
    visual_search: {
      enabled: true,
      index_name: 'vibelux_products'
    }
  },

  // Video settings
  video: {
    // Encoding
    encoding: {
      codec: 'h265', // Better compression
      profile: 'main',
      level: 'auto',
      bit_rate: 'auto'
    },

    // Streaming
    streaming: {
      hls: true,
      dash: true,
      profiles: ['4k', 'full_hd', 'hd', 'sd', 'mobile']
    },

    // AI features
    ai_features: {
      auto_captioning: true,
      transcript: true,
      preview_generation: true,
      highlight_detection: true
    }
  },

  // Security
  security: {
    // Upload security
    upload: {
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4'],
      max_file_size: 104857600, // 100MB
      virus_scan: true,
      moderation: {
        aws_rek: 0.8,
        webpurify: 0.8
      }
    },

    // Delivery security
    delivery: {
      signed_urls: {
        enabled: true,
        duration: 3600 // 1 hour
      },
      token_auth: true,
      ip_whitelist: [],
      referrer_check: true
    },

    // Access control
    access_control: {
      strict_transformations: false,
      allowed_transformations: [],
      resource_access_mode: 'public'
    }
  },

  // Webhooks and notifications
  webhooks: {
    upload_notifications: {
      url: process.env.NEXT_PUBLIC_WEBHOOK_URL,
      events: ['upload', 'delete', 'resource_context_changed'],
      eager: true,
      backup: true,
      include_metadata: true
    },
    
    moderation_notifications: {
      url: process.env.NEXT_PUBLIC_MODERATION_WEBHOOK_URL,
      events: ['moderation_status'],
      include_analysis: true
    }
  },

  // Advanced features
  advanced: {
    // Custom functions
    custom_functions: {
      wasm: true, // WebAssembly functions
      remote: true // Remote functions
    },

    // Metadata
    metadata: {
      structured: true,
      custom_fields: [
        { field: 'plant_id', type: 'string' },
        { field: 'growth_stage', type: 'enum', values: ['seedling', 'vegetative', 'flowering', 'harvest'] },
        { field: 'health_score', type: 'number' },
        { field: 'location', type: 'geo' }
      ]
    },

    // Search
    search: {
      enabled: true,
      expressions: true,
      aggregate: true,
      autocomplete: true
    },

    // Addons
    addons: {
      google_ai_video: true,
      aspose: true, // Document conversion
      rekognition: true,
      azure_video_indexer: true,
      background_removal: true,
      viesus: true // Image enhancement
    }
  },

  // Cost optimization
  cost_optimization: {
    // Caching
    cache: {
      browser_ttl: 31536000, // 1 year
      edge_ttl: 2592000, // 30 days
      breakpoints_cache: true
    },

    // Bandwidth
    bandwidth: {
      compression_level: 'auto',
      use_fetch: true, // Fetch from origin
      proxy_whitelist: []
    },

    // Storage
    storage: {
      auto_backup: false, // Use selectively
      auto_delete_after: 0, // Days, 0 = never
      dedupe: true // Deduplication
    }
  },

  // Analytics and monitoring
  analytics: {
    // Built-in analytics
    cloudinary_analytics: true,
    
    // Custom analytics
    custom: {
      google_analytics: process.env.NEXT_PUBLIC_GA_ID,
      segment: process.env.NEXT_PUBLIC_SEGMENT_KEY,
      datadog: process.env.DATADOG_API_KEY
    },

    // Performance monitoring
    performance: {
      real_user_monitoring: true,
      synthetic_monitoring: true,
      alerts: {
        bandwidth_threshold: 1000000000, // 1GB
        transformation_threshold: 100000,
        error_rate_threshold: 0.01
      }
    }
  },

  // Feature flags
  features: {
    ai_background_removal: true,
    ai_generative_fill: true,
    ai_object_detection: true,
    video_ai_highlights: true,
    responsive_breakpoints: true,
    auto_upload_mapping: true,
    dynamic_folders: true,
    conditional_transformations: true,
    custom_domain: false, // Requires enterprise
    private_cdn: false, // Requires enterprise
    multi_cdn: false // Requires enterprise
  }
};

// Helper to get optimal settings for different use cases
export const getOptimalSettings = (useCase: 'plant_health' | 'equipment' | 'marketing' | 'documentation') => {
  const baseSettings = {
    quality: 'auto',
    fetch_format: 'auto',
    dpr: 'auto',
    responsive: true,
    progressive: true
  };

  switch (useCase) {
    case 'plant_health':
      return {
        ...baseSettings,
        quality: 'auto:best',
        effect: ['gen_restore', 'sharpen:100'],
        colors: true,
        detection: 'adv_face'
      };
    
    case 'equipment':
      return {
        ...baseSettings,
        background_removal: 'cloudinary_ai',
        effect: 'drop_shadow',
        gravity: 'auto:classic'
      };
    
    case 'marketing':
      return {
        ...baseSettings,
        quality: 'auto:best',
        effect: ['improve', 'vibrance:20'],
        eager: true
      };
    
    case 'documentation':
      return {
        ...baseSettings,
        format: 'auto',
        flags: 'attachment',
        page: 'all'
      };
    
    default:
      return baseSettings;
  }
};