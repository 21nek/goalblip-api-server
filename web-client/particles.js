// Subtle Three.js particles for hero section
(function() {
    'use strict';
    
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, skipping particles');
        return;
    }

    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    let scene, camera, renderer, particles;
    let animationId = null;
    let isVisible = false;

    function initParticles() {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        heroSection.appendChild(canvas);

        // Scene setup
        scene = new THREE.Scene();
        const heroRect = heroSection.getBoundingClientRect();
        camera = new THREE.PerspectiveCamera(75, heroRect.width / heroRect.height, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(heroRect.width, heroRect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create particles (subtle, not overwhelming)
        const particleCount = 40;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const color = new THREE.Color(0xcbe043); // Accent color

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;

            // Colors (accent with variation)
            const colorVariation = 0.3 + Math.random() * 0.4;
            colors[i3] = color.r * colorVariation;
            colors[i3 + 1] = color.g * colorVariation;
            colors[i3 + 2] = color.b * colorVariation;

            // Sizes (smaller for subtlety)
            sizes[i] = Math.random() * 0.3 + 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Subtle floating animation
                    mvPosition.y += sin(time * 0.5 + position.x * 0.1) * 0.1;
                    mvPosition.x += cos(time * 0.3 + position.y * 0.1) * 0.1;
                    
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    gl_FragColor = vec4(vColor, alpha * 0.2);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    function animate() {
        if (!isVisible) return;
        
        animationId = requestAnimationFrame(animate);

        if (particles && particles.material) {
            particles.material.uniforms.time.value += 0.01;
            particles.rotation.y += 0.0005;
        }

        renderer.render(scene, camera);
    }

    function handleResize() {
        if (!camera || !renderer || !heroSection) return;
        
        const heroRect = heroSection.getBoundingClientRect();
        camera.aspect = heroRect.width / heroRect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(heroRect.width, heroRect.height);
    }

    // Intersection Observer for performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible && !animationId) {
                animate();
            }
        });
    }, { threshold: 0.1 });

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initParticles();
            observer.observe(heroSection);
            window.addEventListener('resize', handleResize);
        });
    } else {
        initParticles();
        observer.observe(heroSection);
        window.addEventListener('resize', handleResize);
    }
})();

