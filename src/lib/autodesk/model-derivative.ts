import { getAccessToken } from './auth';

// Model Derivative API for CAD format conversion
export class ModelDerivative {
  private baseUrl = 'https://developer.api.autodesk.com/modelderivative/v2';
  
  // Supported input formats
  static supportedFormats = [
    'dwg', 'dxf', 'dwf', 'nwd', 'nwc', 'rvt', 'rfa', 'rte',
    'ifc', 'igs', 'iges', 'step', 'stp', 'stl', 'obj', 'fbx',
    '3ds', 'dae', 'skp', 'prt', 'sldprt', 'sldasm', 'asm',
    'iam', 'ipt', 'x_t', 'x_b', 'jt', 'wire', 'sab', 'sat',
    'smb', 'smt', 'dwfx', 'f3d', 'cam360', 'sim', 'fusion',
    'navisworks', 'catia', 'creo', 'nx', 'parasolid', 'rhino',
    'solidworks', 'inventor', 'revit', 'autocad', 'fusion360',
    'sim360', 'max', 'wire', '3dm', 'session', 'dlv3', 'exp',
    'model', 'prt', 'neu', 'g', 'neu', 'prt', 'asm'
  ];

  // Check if format is supported
  static isFormatSupported(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? this.supportedFormats.includes(extension) : false;
  }

  // Submit translation job
  async translateModel(urn: string, outputFormat: 'svf' | 'svf2' = 'svf2') {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/designdata/job`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-ads-force': 'true' // Force retranslation
        },
        body: JSON.stringify({
          input: {
            urn: urn,
            compressedUrn: false,
            rootFilename: ''
          },
          output: {
            destination: {
              region: 'us'
            },
            formats: [
              {
                type: outputFormat,
                views: ['2d', '3d'],
                advanced: {
                  generateMasterViews: true,
                  extractProperties: true
                }
              }
            ]
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Translation failed: ${error.diagnostic || response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('api', 'Model translation error:', error );
      throw error;
    }
  }

  // Check translation status
  async getTranslationStatus(urn: string) {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/designdata/${urn}/manifest`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get translation status: ${response.statusText}`);
      }

      const manifest = await response.json();
      return {
        status: manifest.status,
        progress: manifest.progress,
        derivatives: manifest.derivatives || []
      };
    } catch (error) {
      logger.error('api', 'Translation status error:', error );
      throw error;
    }
  }

  // Extract metadata
  async getMetadata(urn: string) {
    try {
      const token = await getAccessToken();
      
      // Get metadata guid
      const guidResponse = await fetch(`${this.baseUrl}/designdata/${urn}/metadata`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!guidResponse.ok) {
        throw new Error('Failed to get metadata');
      }

      const guidData = await guidResponse.json();
      const guid = guidData.data.metadata[0].guid;

      // Get properties
      const propsResponse = await fetch(
        `${this.baseUrl}/designdata/${urn}/metadata/${guid}/properties`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!propsResponse.ok) {
        throw new Error('Failed to get properties');
      }

      const properties = await propsResponse.json();
      return this.parseModelProperties(properties);
    } catch (error) {
      logger.error('api', 'Metadata extraction error:', error );
      throw error;
    }
  }

  // Parse model properties for lighting-relevant data
  private parseModelProperties(properties: any) {
    const result = {
      dimensions: { length: 0, width: 0, height: 0 },
      rooms: [],
      walls: [],
      ceilings: [],
      materials: [],
      electricalSystems: []
    };

    // Extract room/space information
    properties.data.collection.forEach((object: any) => {
      const props = object.properties;
      
      // Check for room/space objects
      if (object.name?.toLowerCase().includes('room') || 
          object.name?.toLowerCase().includes('space')) {
        result.rooms.push({
          id: object.objectid,
          name: object.name,
          area: props['Area']?.value,
          volume: props['Volume']?.value,
          height: props['Unbounded Height']?.value || props['Height']?.value
        });
      }

      // Extract dimensions from bounding box
      if (props['Bounding Box']) {
        const bbox = props['Bounding Box'];
        result.dimensions = {
          length: bbox.max[0] - bbox.min[0],
          width: bbox.max[1] - bbox.min[1],
          height: bbox.max[2] - bbox.min[2]
        };
      }

      // Check for walls
      if (object.name?.toLowerCase().includes('wall')) {
        result.walls.push({
          id: object.objectid,
          name: object.name,
          material: props['Material']?.value
        });
      }

      // Check for ceilings
      if (object.name?.toLowerCase().includes('ceiling')) {
        result.ceilings.push({
          id: object.objectid,
          name: object.name,
          height: props['Elevation']?.value,
          material: props['Material']?.value
        });
      }

      // Extract electrical systems
      if (props['System Type']?.value === 'Electrical' || 
          object.name?.toLowerCase().includes('electrical')) {
        result.electricalSystems.push({
          id: object.objectid,
          name: object.name,
          voltage: props['Voltage']?.value,
          phase: props['Number of Phases']?.value
        });
      }
    });

    return result;
  }

  // Generate thumbnail
  async getThumbnail(urn: string, width = 400, height = 400): Promise<string> {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(
        `${this.baseUrl}/designdata/${urn}/thumbnail?width=${width}&height=${height}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get thumbnail');
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      logger.error('api', 'Thumbnail generation error:', error );
      throw error;
    }
  }

  // Extract 2D views (floor plans, sections)
  async get2DViews(urn: string) {
    try {
      const manifest = await this.getTranslationStatus(urn);
      const views2D = [];

      manifest.derivatives.forEach((derivative: any) => {
        if (derivative.outputType === 'f2d') {
          derivative.children?.forEach((child: any) => {
            views2D.push({
              guid: child.guid,
              name: child.name,
              role: child.role,
              type: child.type,
              urn: child.urn
            });
          });
        }
      });

      return views2D;
    } catch (error) {
      logger.error('api', '2D views extraction error:', error );
      throw error;
    }
  }

  // Download derivative
  async downloadDerivative(urn: string, derivativeUrn: string): Promise<Blob> {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(
        `${this.baseUrl}/designdata/${urn}/manifest/${derivativeUrn}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download derivative');
      }

      return await response.blob();
    } catch (error) {
      logger.error('api', 'Derivative download error:', error );
      throw error;
    }
  }

  // Batch translate multiple files
  async batchTranslate(urns: string[]) {
    const results = await Promise.allSettled(
      urns.map(urn => this.translateModel(urn))
    );

    return results.map((result, index) => ({
      urn: urns[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  // Monitor translation progress
  async monitorTranslation(urn: string, onProgress?: (status: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.getTranslationStatus(urn);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'success') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error('Translation failed'));
          } else {
            // Check again in 5 seconds
            setTimeout(checkStatus, 5000);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  }
}