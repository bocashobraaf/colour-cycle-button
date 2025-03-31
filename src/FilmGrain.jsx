import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

const FilmGrain = () => {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
      return;
    }

    function onWindowResize() {
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      composer.setSize(container.offsetWidth, container.offsetHeight);
    }
  
    window.addEventListener('resize', onWindowResize);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Updated film grain shader
    const filmGrainShader = {
      uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0 },
        'grainSize': { value: 0.01 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float grainSize;
        varying vec2 vUv;
    
        // Standard random function
        float random(vec2 st) {
          return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
        }
    
        void main() {
          // Copy the original UV coordinates
          vec2 uv = vUv;
          // Offset the UV coordinates over time to animate the noise
          uv += vec2(time * 0.1, time * 0.1);
          // Compute the noise value from the modified UV coordinates
          float grain = random(uv) * grainSize;
          // Sample the original color from the render pass
          vec3 color = texture2D(tDiffuse, vUv).rgb;
          // Add the grain effect to the color
          gl_FragColor = vec4(color + grain, 1.0);
        }
      `,
    };

    const filmGrainPass = new ShaderPass(filmGrainShader);
    composer.addPass(filmGrainPass);

    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      // Update the time uniform so the noise pattern shifts over time
      filmGrainPass.uniforms.time.value = performance.now() / 1000.0;
      composer.render();
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  // (Optional) Maintain window height in state to trigger re-renders on resize.
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className="scoutFilmGrain" 
      ref={containerRef} 
      style={{ 
        position: 'absolute', 
        width: '100vw', 
        height: '105vh', 
        zIndex: 1, 
        top: 0, 
        left: 0, 
        opacity: '0.08', 
        backdropFilter: 'blur(10px)' 
      }}
    />
  );
};

export default FilmGrain;
