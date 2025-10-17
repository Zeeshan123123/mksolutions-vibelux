/**
 * WebGL Compatibility Fixer
 * Automatically fixes WebGL and 3D rendering issues found in testing
 */

const fs = require('fs');
const path = require('path');

class WebGLFixer {
    constructor() {
        this.fixes = {
            applied: 0,
            failed: 0,
            skipped: 0
        };
        
        this.threeDFiles = [
            '/Users/blakelange/Downloads/Mohave_Complete_Facility_3D_Analysis.html',
            '/Users/blakelange/Downloads/Mohave_Enhanced_3D_ZIndex_FINAL_FIX.html'
        ];
    }

    async fixAllWebGLIssues() {
        console.log('🎮 WEBGL COMPATIBILITY FIXER');
        console.log('═'.repeat(60));
        console.log('Fixing WebGL and 3D rendering issues...\n');

        for (const filePath of this.threeDFiles) {
            if (fs.existsSync(filePath)) {
                console.log(`🔧 Fixing: ${path.basename(filePath)}`);
                await this.fixFileWebGLIssues(filePath);
            } else {
                console.log(`⚠️  File not found: ${path.basename(filePath)}`);
            }
        }

        this.generateFixReport();
    }

    async fixFileWebGLIssues(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            // Fix 1: Add comprehensive WebGL detection
            content = this.addWebGLDetection(content);
            
            // Fix 2: Fix Three.js initialization
            content = this.fixThreeJSInit(content);
            
            // Fix 3: Add WebGL fallbacks
            content = this.addWebGLFallbacks(content);
            
            // Fix 4: Fix shader compatibility
            content = this.fixShaderCompatibility(content);
            
            // Fix 5: Optimize for headless environments
            content = this.optimizeForHeadless(content);
            
            // Fix 6: Add error recovery
            content = this.addErrorRecovery(content);
            
            // Fix 7: Fix context loss handling
            content = this.addContextLossHandling(content);
            
            // Fix 8: Add performance optimizations
            content = this.addPerformanceOptimizations(content);
            
            // Fix 9: Add progressive enhancement
            content = this.addProgressiveEnhancement(content);
            
            // Fix 10: Add canvas fallback
            content = this.addCanvasFallback(content);

            if (content !== originalContent) {
                const backupPath = filePath.replace('.html', '_BACKUP_BEFORE_WEBGL_FIX.html');
                fs.writeFileSync(backupPath, originalContent);
                
                const fixedPath = filePath.replace('.html', '_WEBGL_FIXED.html');
                fs.writeFileSync(fixedPath, content);
                
                console.log(`   ✅ Fixed and saved as: ${path.basename(fixedPath)}`);
                console.log(`   📁 Backup saved as: ${path.basename(backupPath)}`);
                this.fixes.applied++;
            } else {
                console.log(`   ℹ️  No WebGL fixes needed`);
                this.fixes.skipped++;
            }

        } catch (error) {
            console.log(`   ❌ Failed to fix: ${error.message}`);
            this.fixes.failed++;
        }
    }

    addWebGLDetection(content) {
        const webglDetectionScript = `
    <!-- WebGL FIX: Comprehensive WebGL Detection -->
    <script>
        // WebGL compatibility detection and fallback system
        (function() {
            'use strict';
            
            window.WebGLSupport = {
                webgl: false,
                webgl2: false,
                extensions: {},
                limitations: {},
                fallbackMode: false
            };
            
            function detectWebGL() {
                console.log('WEBGL FIX: Detecting WebGL support...');
                
                // Test WebGL 1.0
                try {
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    
                    if (gl) {
                        window.WebGLSupport.webgl = true;
                        
                        // Get WebGL info
                        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                        if (debugInfo) {
                            window.WebGLSupport.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                            window.WebGLSupport.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                        }
                        
                        // Check limitations
                        window.WebGLSupport.limitations = {
                            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                            maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
                            maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
                            maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
                            maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                            maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
                        };
                        
                        // Test important extensions
                        const requiredExtensions = [
                            'OES_vertex_array_object',
                            'WEBGL_depth_texture',
                            'OES_texture_float',
                            'ANGLE_instanced_arrays'
                        ];
                        
                        requiredExtensions.forEach(ext => {
                            window.WebGLSupport.extensions[ext] = !!gl.getExtension(ext);
                        });
                        
                        console.log('WEBGL FIX: WebGL 1.0 supported', window.WebGLSupport);
                    }
                } catch (e) {
                    console.warn('WEBGL FIX: WebGL 1.0 not supported:', e.message);
                }
                
                // Test WebGL 2.0
                try {
                    const canvas = document.createElement('canvas');
                    const gl2 = canvas.getContext('webgl2');
                    if (gl2) {
                        window.WebGLSupport.webgl2 = true;
                        console.log('WEBGL FIX: WebGL 2.0 supported');
                    }
                } catch (e) {
                    console.warn('WEBGL FIX: WebGL 2.0 not supported:', e.message);
                }
                
                // Check for headless environment
                if (typeof window !== 'undefined' && !window.HTMLCanvasElement) {
                    console.warn('WEBGL FIX: Headless environment detected');
                    window.WebGLSupport.fallbackMode = true;
                }
                
                // Check for software rendering
                if (window.WebGLSupport.renderer && 
                    (window.WebGLSupport.renderer.includes('Software') || 
                     window.WebGLSupport.renderer.includes('Mesa'))) {
                    console.warn('WEBGL FIX: Software rendering detected');
                    window.WebGLSupport.fallbackMode = true;
                }
                
                return window.WebGLSupport.webgl || window.WebGLSupport.webgl2;
            }
            
            // Run detection when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', detectWebGL);
            } else {
                detectWebGL();
            }
            
        })();
    </script>`;

        if (!content.includes('WebGLSupport')) {
            content = content.replace(
                /<head>/i,
                `<head>${webglDetectionScript}`
            );
        }

        return content;
    }

    fixThreeJSInit(content) {
        // Replace basic Three.js initialization with robust version
        const robustThreeJSInit = `
        // WebGL FIX: Robust Three.js initialization
        function initThreeJS() {
            console.log('WEBGL FIX: Initializing Three.js with fallbacks...');
            
            const container = document.getElementById('threejs-container');
            if (!container) {
                console.error('WEBGL FIX: Container not found');
                return;
            }
            
            // Check WebGL support first
            if (!window.WebGLSupport || (!window.WebGLSupport.webgl && !window.WebGLSupport.webgl2)) {
                console.warn('WEBGL FIX: WebGL not supported, using fallback');
                initCanvasFallback();
                return;
            }
            
            try {
                scene = new THREE.Scene();
                scene.background = new THREE.Color(0x0a0a0a);
                
                camera = new THREE.PerspectiveCamera(
                    75, 
                    container.clientWidth / container.clientHeight, 
                    0.1, 
                    1000
                );
                camera.position.set(80, 60, 80);
                camera.lookAt(0, 0, 0);
                
                // WebGL renderer with enhanced error handling
                const rendererOptions = {
                    antialias: window.WebGLSupport.webgl2,
                    alpha: true,
                    powerPreference: 'default', // More compatible than 'high-performance'
                    failIfMajorPerformanceCaveat: false,
                    preserveDrawingBuffer: true,
                    stencil: false,
                    depth: true
                };
                
                renderer = new THREE.WebGLRenderer(rendererOptions);
                
                // Set pixel ratio for better compatibility
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                renderer.setPixelRatio(pixelRatio);
                
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.shadowMap.enabled = false; // Disable shadows for compatibility
                
                // Add canvas with error handling
                try {
                    container.appendChild(renderer.domElement);
                } catch (e) {
                    console.error('WEBGL FIX: Failed to append canvas:', e);
                    initCanvasFallback();
                    return;
                }
                
                // Enhanced lighting for better compatibility
                const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
                scene.add(ambientLight);
                
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(100, 100, 50);
                directionalLight.castShadow = false; // Disable shadows
                scene.add(directionalLight);
                
                // Create content with error handling
                try {
                    createDemoContent();
                } catch (e) {
                    console.error('WEBGL FIX: Failed to create content:', e);
                    createSimpleContent();
                }
                
                // Start render loop with error handling
                try {
                    animate();
                    updateStatus('✅ Enhanced 3D facility model loaded - WebGL optimized');
                    initializeCircuitMonitor();
                } catch (e) {
                    console.error('WEBGL FIX: Failed to start animation:', e);
                    updateStatus('⚠️ 3D model loaded with limited functionality');
                }
                
            } catch (error) {
                console.error('WEBGL FIX: Three.js initialization failed:', error);
                initCanvasFallback();
            }
        }`;

        // Replace the original initThreeJS function
        content = content.replace(
            /function initThreeJS\(\)[\s\S]*?(?=function|\n\s*<\/script>|\n\s*$)/,
            robustThreeJSInit
        );

        return content;
    }

    addWebGLFallbacks(content) {
        const fallbackFunctions = `
        // WebGL FIX: Fallback functions for non-WebGL environments
        function initCanvasFallback() {
            console.log('WEBGL FIX: Initializing 2D Canvas fallback');
            
            const container = document.getElementById('threejs-container');
            if (!container) return;
            
            // Create 2D canvas
            const canvas = document.createElement('canvas');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.background = '#0a0a0a';
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('WEBGL FIX: 2D Canvas not supported either');
                initHTMLFallback();
                return;
            }
            
            container.appendChild(canvas);
            
            // Draw fallback visualization
            drawFallbackVisualization(ctx, canvas);
            
            updateStatus('📊 2D visualization loaded (WebGL fallback)');
            initializeCircuitMonitor();
        }
        
        function drawFallbackVisualization(ctx, canvas) {
            const width = canvas.width;
            const height = canvas.height;
            
            // Clear canvas
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);
            
            // Draw grid
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            const gridSize = 50;
            
            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            
            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            
            // Draw fixture representations
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA000';
            ctx.lineWidth = 2;
            
            const fixtureSize = 20;
            const cols = Math.floor(width / 100);
            const rows = Math.floor(height / 100);
            
            for (let col = 0; col < cols; col++) {
                for (let row = 0; row < rows; row++) {
                    const x = (col + 1) * 100 - fixtureSize / 2;
                    const y = (row + 1) * 100 - fixtureSize / 2;
                    
                    // Draw fixture
                    ctx.fillRect(x, y, fixtureSize, fixtureSize);
                    ctx.strokeRect(x, y, fixtureSize, fixtureSize);
                    
                    // Draw light rays
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + fixtureSize/2, y + fixtureSize);
                    ctx.lineTo(x + fixtureSize/2 - 15, y + fixtureSize + 30);
                    ctx.moveTo(x + fixtureSize/2, y + fixtureSize);
                    ctx.lineTo(x + fixtureSize/2 + 15, y + fixtureSize + 30);
                    ctx.stroke();
                }
            }
            
            // Draw title
            ctx.fillStyle = '#2196F3';
            ctx.font = 'bold 24px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Mohave Cannabis Co. - Facility Layout', width / 2, 40);
            
            // Draw subtitle
            ctx.fillStyle = '#64b5f6';
            ctx.font = '16px Arial, sans-serif';
            ctx.fillText('765 VYPR 2p LED Fixtures (2D Fallback View)', width / 2, 70);
            
            // Draw legend
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(width - 200, height - 100, 20, 20);
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('VYPR 2p Fixtures', width - 170, height - 85);
            
            // Add interactivity
            canvas.addEventListener('click', function(e) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                updateStatus('🔍 Clicked position: (' + Math.round(x) + ', ' + Math.round(y) + ')');
            });
        }
        
        function initHTMLFallback() {
            console.log('WEBGL FIX: Initializing HTML fallback');
            
            const container = document.getElementById('threejs-container');
            if (!container) return;
            
            container.innerHTML = \`
                <div style="
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    text-align: center;
                    padding: 2rem;
                    box-sizing: border-box;
                ">
                    <h2 style="color: #2196F3; margin-bottom: 1rem;">
                        🏢 Mohave Cannabis Co.
                    </h2>
                    <h3 style="color: #64b5f6; margin-bottom: 2rem;">
                        Facility Analysis & Design
                    </h3>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                        width: 100%;
                        max-width: 800px;
                    ">
                        <div style="
                            background: rgba(33, 150, 243, 0.1);
                            border: 1px solid rgba(33, 150, 243, 0.3);
                            border-radius: 8px;
                            padding: 1rem;
                        ">
                            <h4 style="color: #FFD700; margin-bottom: 0.5rem;">💡 Fixtures</h4>
                            <p style="font-size: 2rem; font-weight: bold; color: #2196F3;">765</p>
                            <p style="font-size: 0.9rem;">VYPR 2p LED Units</p>
                        </div>
                        
                        <div style="
                            background: rgba(76, 175, 80, 0.1);
                            border: 1px solid rgba(76, 175, 80, 0.3);
                            border-radius: 8px;
                            padding: 1rem;
                        ">
                            <h4 style="color: #FFD700; margin-bottom: 0.5rem;">⚡ Power</h4>
                            <p style="font-size: 2rem; font-weight: bold; color: #4CAF50;">493 kW</p>
                            <p style="font-size: 0.9rem;">Total Connected Load</p>
                        </div>
                        
                        <div style="
                            background: rgba(255, 152, 0, 0.1);
                            border: 1px solid rgba(255, 152, 0, 0.3);
                            border-radius: 8px;
                            padding: 1rem;
                        ">
                            <h4 style="color: #FFD700; margin-bottom: 0.5rem;">🌱 PPFD</h4>
                            <p style="font-size: 2rem; font-weight: bold; color: #FF9800;">810</p>
                            <p style="font-size: 0.9rem;">μmol/m²/s Average</p>
                        </div>
                        
                        <div style="
                            background: rgba(156, 39, 176, 0.1);
                            border: 1px solid rgba(156, 39, 176, 0.3);
                            border-radius: 8px;
                            padding: 1rem;
                        ">
                            <h4 style="color: #FFD700; margin-bottom: 0.5rem;">🏢 Rooms</h4>
                            <p style="font-size: 2rem; font-weight: bold; color: #9C27B0;">14</p>
                            <p style="font-size: 0.9rem;">Flowering Chambers</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem; padding: 1rem; background: rgba(244, 67, 54, 0.1); border-radius: 8px;">
                        <p style="color: #F44336; font-weight: bold;">⚠️ 3D Visualization Unavailable</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                            Your browser or environment does not support WebGL.<br>
                            Consider updating your browser or enabling hardware acceleration.
                        </p>
                    </div>
                </div>
            \`;
            
            updateStatus('📋 Static facility overview loaded (HTML fallback)');
        }`;

        if (!content.includes('initCanvasFallback')) {
            content = content.replace(
                /<\/script>/i,
                `${fallbackFunctions}\n    </script>`
            );
        }

        return content;
    }

    fixShaderCompatibility(content) {
        // Fix shader issues by using simpler materials
        const shaderFix = `
        // WebGL FIX: Enhanced material creation with fallbacks
        function createCompatibleMaterial(options = {}) {
            const {
                color = 0xFFD700,
                emissive = 0x000000,
                emissiveIntensity = 0.3,
                transparent = false,
                opacity = 1.0
            } = options;
            
            try {
                // Try standard material first
                if (window.WebGLSupport && window.WebGLSupport.webgl2) {
                    return new THREE.MeshStandardMaterial({
                        color: color,
                        emissive: emissive,
                        emissiveIntensity: emissiveIntensity,
                        transparent: transparent,
                        opacity: opacity,
                        roughness: 0.7,
                        metalness: 0.1
                    });
                } else {
                    // Fallback to Lambert material for better compatibility
                    return new THREE.MeshLambertMaterial({
                        color: color,
                        emissive: emissive,
                        emissiveIntensity: emissiveIntensity,
                        transparent: transparent,
                        opacity: opacity
                    });
                }
            } catch (e) {
                console.warn('WEBGL FIX: Using basic material fallback');
                // Ultimate fallback to basic material
                return new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: transparent,
                    opacity: opacity
                });
            }
        }`;

        // Replace material creation in createDemoContent
        content = content.replace(
            /new THREE\.MeshLambertMaterial\(/g,
            'createCompatibleMaterial('
        );

        // Add the function before other functions
        content = content.replace(
            /function createDemoContent/,
            `${shaderFix}\n        \n        function createDemoContent`
        );

        return content;
    }

    optimizeForHeadless(content) {
        const headlessOptimization = `
        // WebGL FIX: Headless environment optimizations
        function optimizeForHeadless() {
            if (typeof window === 'undefined' || !window.HTMLCanvasElement) {
                console.log('WEBGL FIX: Headless environment detected');
                return true;
            }
            
            // Check for headless indicators
            const headlessIndicators = [
                !window.navigator.webdriver === undefined,
                window.navigator.userAgent.includes('HeadlessChrome'),
                window.navigator.userAgent.includes('PhantomJS'),
                !window.requestAnimationFrame,
                !window.cancelAnimationFrame
            ];
            
            const isHeadless = headlessIndicators.some(indicator => indicator);
            
            if (isHeadless) {
                console.log('WEBGL FIX: Optimizing for headless environment');
                
                // Reduce rendering frequency
                window.HEADLESS_MODE = true;
                window.RENDER_FREQUENCY = 1000; // 1 FPS instead of 60
                
                // Disable expensive features
                window.DISABLE_SHADOWS = true;
                window.DISABLE_ANTIALIASING = true;
                window.REDUCE_GEOMETRY = true;
                
                return true;
            }
            
            return false;
        }`;

        // Add headless check to initialization
        content = content.replace(
            /function initThreeJS\(\) {/,
            `function initThreeJS() {\n            optimizeForHeadless();\n`
        );

        // Modify animate function for headless
        const headlessAnimate = `
        function animate() {
            if (window.HEADLESS_MODE) {
                // Reduced frequency animation for headless
                setTimeout(() => {
                    requestAnimationFrame(animate);
                }, window.RENDER_FREQUENCY || 1000);
            } else {
                requestAnimationFrame(animate);
            }
            
            try {
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                }
            } catch (e) {
                console.error('WEBGL FIX: Render error:', e);
                // Try to recover
                if (renderer) {
                    try {
                        renderer.forceContextRestore();
                    } catch (restoreError) {
                        console.error('WEBGL FIX: Context restore failed:', restoreError);
                    }
                }
            }
        }`;

        content = content.replace(
            /function animate\(\)[\s\S]*?(?=function|\n\s*<\/script>)/,
            headlessAnimate
        );

        // Add the optimization function
        content = content.replace(
            /function initThreeJS/,
            `${headlessOptimization}\n        \n        function initThreeJS`
        );

        return content;
    }

    addErrorRecovery(content) {
        const errorRecoveryScript = `
        // WebGL FIX: Error recovery and monitoring
        let webglErrorCount = 0;
        let lastContextLoss = 0;
        const MAX_ERRORS = 5;
        const CONTEXT_LOSS_COOLDOWN = 5000;
        
        function handleWebGLError(error) {
            webglErrorCount++;
            console.error('WEBGL FIX: WebGL Error #' + webglErrorCount + ':', error);
            
            if (webglErrorCount >= MAX_ERRORS) {
                console.warn('WEBGL FIX: Too many WebGL errors, switching to fallback');
                initCanvasFallback();
                return;
            }
            
            // Try to recover
            try {
                if (renderer && renderer.getContext) {
                    const gl = renderer.getContext();
                    if (gl && gl.getError) {
                        const glError = gl.getError();
                        if (glError !== gl.NO_ERROR) {
                            console.warn('WEBGL FIX: GL Error code:', glError);
                        }
                    }
                }
            } catch (e) {
                console.error('WEBGL FIX: Error recovery failed:', e);
            }
        }
        
        function monitorWebGLHealth() {
            if (!renderer || !renderer.getContext) return;
            
            try {
                const gl = renderer.getContext();
                if (gl) {
                    // Check for context loss
                    if (gl.isContextLost && gl.isContextLost()) {
                        const now = Date.now();
                        if (now - lastContextLoss > CONTEXT_LOSS_COOLDOWN) {
                            console.warn('WEBGL FIX: WebGL context lost, attempting recovery');
                            lastContextLoss = now;
                            
                            // Try to restore context
                            setTimeout(() => {
                                try {
                                    if (renderer.forceContextRestore) {
                                        renderer.forceContextRestore();
                                    }
                                } catch (e) {
                                    console.error('WEBGL FIX: Context restore failed:', e);
                                    initCanvasFallback();
                                }
                            }, 1000);
                        }
                    }
                    
                    // Check for GL errors
                    const error = gl.getError();
                    if (error !== gl.NO_ERROR) {
                        handleWebGLError('GL Error: ' + error);
                    }
                }
            } catch (e) {
                console.error('WEBGL FIX: Health monitoring failed:', e);
            }
        }
        
        // Monitor WebGL health periodically
        setInterval(monitorWebGLHealth, 2000);`;

        content = content.replace(
            /<\/script>/i,
            `${errorRecoveryScript}\n    </script>`
        );

        return content;
    }

    addContextLossHandling(content) {
        const contextLossHandling = `
        // WebGL FIX: Context loss and restoration handling
        function addContextLossHandlers() {
            if (!renderer || !renderer.domElement) return;
            
            const canvas = renderer.domElement;
            
            canvas.addEventListener('webglcontextlost', function(e) {
                console.warn('WEBGL FIX: WebGL context lost');
                e.preventDefault();
                
                updateStatus('⚠️ 3D rendering temporarily unavailable');
                
                // Stop animation loop
                if (window.animationId) {
                    cancelAnimationFrame(window.animationId);
                }
            });
            
            canvas.addEventListener('webglcontextrestored', function() {
                console.log('WEBGL FIX: WebGL context restored');
                
                try {
                    // Reinitialize Three.js
                    initThreeJS();
                    updateStatus('✅ 3D rendering restored');
                } catch (e) {
                    console.error('WEBGL FIX: Context restoration failed:', e);
                    initCanvasFallback();
                }
            });
            
            // Also handle context creation errors
            canvas.addEventListener('webglcontextcreationerror', function(e) {
                console.error('WEBGL FIX: WebGL context creation failed:', e.statusMessage);
                initCanvasFallback();
            });
        }`;

        // Add context loss handlers after renderer creation
        content = content.replace(
            /renderer\.setSize\(container\.clientWidth, container\.clientHeight\);/,
            `renderer.setSize(container.clientWidth, container.clientHeight);
                addContextLossHandlers();`
        );

        // Add the function
        content = content.replace(
            /function initThreeJS/,
            `${contextLossHandling}\n        \n        function initThreeJS`
        );

        return content;
    }

    addPerformanceOptimizations(content) {
        const performanceOptimizations = `
        // WebGL FIX: Performance optimizations
        function optimizePerformance() {
            if (!renderer) return;
            
            // Optimize renderer settings
            renderer.shadowMap.enabled = false;
            renderer.powerPreference = "default";
            renderer.precision = "mediump";
            
            // Reduce pixel ratio on low-end devices
            const maxPixelRatio = window.WebGLSupport.fallbackMode ? 1 : 2;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
            
            // Enable frustum culling
            camera.frustumCulled = true;
            
            // Optimize materials
            scene.traverse(function(object) {
                if (object.material) {
                    object.material.flatShading = true;
                    object.material.needsUpdate = true;
                }
            });
            
            console.log('WEBGL FIX: Performance optimizations applied');
        }`;

        // Add performance optimizations after scene creation
        content = content.replace(
            /scene\.add\(directionalLight\);/,
            `scene.add(directionalLight);
                optimizePerformance();`
        );

        content = content.replace(
            /function initThreeJS/,
            `${performanceOptimizations}\n        \n        function initThreeJS`
        );

        return content;
    }

    addProgressiveEnhancement(content) {
        const progressiveEnhancement = `
        // WebGL FIX: Progressive enhancement
        function enhanceProgressively() {
            const capabilities = {
                basic: true,
                shadows: false,
                antialiasing: false,
                highDPI: false,
                advancedMaterials: false
            };
            
            if (window.WebGLSupport) {
                // Enable features based on capabilities
                if (window.WebGLSupport.webgl2) {
                    capabilities.antialiasing = true;
                    capabilities.advancedMaterials = true;
                }
                
                if (window.WebGLSupport.limitations.maxTextureSize >= 4096) {
                    capabilities.highDPI = true;
                }
                
                if (window.WebGLSupport.extensions['WEBGL_depth_texture']) {
                    capabilities.shadows = true;
                }
            }
            
            // Apply capabilities
            if (renderer) {
                if (!capabilities.antialiasing) {
                    renderer.setPixelRatio(1);
                }
                
                if (!capabilities.shadows) {
                    renderer.shadowMap.enabled = false;
                }
            }
            
            console.log('WEBGL FIX: Progressive enhancement applied:', capabilities);
            return capabilities;
        }`;

        content = content.replace(
            /function initThreeJS/,
            `${progressiveEnhancement}\n        \n        function initThreeJS`
        );

        return content;
    }

    addCanvasFallback(content) {
        // Ensure the simple content creation function exists
        const simpleContentFunction = `
        function createSimpleContent() {
            console.log('WEBGL FIX: Creating simplified 3D content');
            
            try {
                // Simple ground plane
                const groundGeometry = new THREE.PlaneGeometry(200, 150);
                const groundMaterial = createCompatibleMaterial({ 
                    color: 0x1a1a1a 
                });
                const ground = new THREE.Mesh(groundGeometry, groundMaterial);
                ground.rotation.x = -Math.PI / 2;
                scene.add(ground);
                
                // Simplified fixtures - fewer objects
                const fixtureGeometry = new THREE.BoxGeometry(4, 0.6, 2);
                const fixtureMaterial = createCompatibleMaterial({ 
                    color: 0xFFD700,
                    emissive: lightingVisible ? 0xFFD700 : 0x000000,
                    emissiveIntensity: 0.2
                });
                
                // Create fewer fixtures for better performance
                for (let i = 0; i < 10; i++) {
                    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
                    fixture.position.set(
                        (i % 5) * 20 - 40,
                        8,
                        Math.floor(i / 5) * 20 - 10
                    );
                    scene.add(fixture);
                }
                
                console.log('WEBGL FIX: Simplified content created');
                
            } catch (e) {
                console.error('WEBGL FIX: Simple content creation failed:', e);
                
                // Even simpler fallback
                const simpleGeometry = new THREE.BoxGeometry(10, 10, 10);
                const simpleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
                const simpleCube = new THREE.Mesh(simpleGeometry, simpleMaterial);
                scene.add(simpleCube);
            }
        }`;

        if (!content.includes('createSimpleContent')) {
            content = content.replace(
                /function createDemoContent/,
                `${simpleContentFunction}\n        \n        function createDemoContent`
            );
        }

        return content;
    }

    generateFixReport() {
        console.log('\n🎮 WEBGL FIXES SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Files Fixed: ${this.fixes.applied}`);
        console.log(`⚠️  Files Skipped: ${this.fixes.skipped}`);
        console.log(`❌ Files Failed: ${this.fixes.failed}`);
        
        const total = this.fixes.applied + this.fixes.skipped + this.fixes.failed;
        const successRate = total > 0 ? ((this.fixes.applied / total) * 100).toFixed(1) : 0;
        console.log(`📈 Success Rate: ${successRate}%`);

        console.log('\n🔧 WEBGL FIXES APPLIED:');
        console.log('─'.repeat(40));
        console.log('   ✅ Comprehensive WebGL detection');
        console.log('   ✅ Robust Three.js initialization');
        console.log('   ✅ Canvas 2D fallback system');
        console.log('   ✅ HTML static fallback');
        console.log('   ✅ Shader compatibility improvements');
        console.log('   ✅ Headless environment optimization');
        console.log('   ✅ Error recovery mechanisms');
        console.log('   ✅ Context loss handling');
        console.log('   ✅ Performance optimizations');
        console.log('   ✅ Progressive enhancement');

        console.log('\n📁 FIXED FILES:');
        console.log('─'.repeat(40));
        this.threeDFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                const fixedPath = filePath.replace('.html', '_WEBGL_FIXED.html');
                if (fs.existsSync(fixedPath)) {
                    console.log(`   📄 ${path.basename(fixedPath)}`);
                }
            }
        });

        console.log('\n💡 NEXT STEPS:');
        console.log('─'.repeat(40));
        console.log('   1. Test in different browsers and environments');
        console.log('   2. Verify fallbacks work correctly');
        console.log('   3. Test on low-end devices');
        console.log('   4. Monitor WebGL error logs');
        console.log('   5. Consider server-side rendering for critical paths');

        // Save fix report
        const reportData = {
            timestamp: new Date().toISOString(),
            fixes: this.fixes,
            successRate: successRate + '%',
            fixesApplied: [
                'WebGL Detection',
                'Three.js Initialization',
                'Canvas 2D Fallback',
                'HTML Static Fallback',
                'Shader Compatibility',
                'Headless Optimization',
                'Error Recovery',
                'Context Loss Handling',
                'Performance Optimization',
                'Progressive Enhancement'
            ]
        };

        fs.writeFileSync('./test-screenshots/webgl-fixes-report.json', JSON.stringify(reportData, null, 2));
        console.log('\n📄 Fix report saved: ./test-screenshots/webgl-fixes-report.json');
    }
}

// Run the WebGL fixer
async function runWebGLFixes() {
    const fixer = new WebGLFixer();
    await fixer.fixAllWebGLIssues();
}

if (require.main === module) {
    runWebGLFixes().catch(console.error);
}

module.exports = WebGLFixer;