
// Import styles and required libraries
import './style.css'
import * as THREE from 'three';
import { REVISION } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import fragment from './shaders/fragment.glsl?raw'; // Custom fragment shader for particles
import vertex from './shaders/vertex.glsl?raw';   // Custom vertex shader for particles
import GUI from 'lil-gui';
import gsap from 'gsap';
import simFragment from './shaders/simFragment.glsl?raw'; // Fragment shader for FBO simulation
import simVertex from './shaders/simVertex.glsl?raw';     // Vertex shader for FBO simulation


// Main Sketch class to set up the scene, camera, renderer, and particle system
export default class Sketch{
  constructor(options){
    // Create a new Three.js scene
    this.scene = new THREE.Scene();

    // Store the DOM container and set up renderer size
    this.container = options.dom;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);

    // Add the renderer's canvas to the DOM
    document.getElementById('container').appendChild( this.renderer.domElement );

    // Set up a perspective camera
    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 0.01, 10 );
    this.camera.position.set(0,0,1); // Camera looks at the center

    // Add orbit controls for camera movement (for debugging/viewing)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0; // Animation time tracker

    // Set up loaders for 3D models (not used for particles, but included)
    const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
    this.dracoLoader = new DRACOLoader(new THREE.LoadingManager()).setDecoderPath(
      `${THREE_PATH}/examples/jsm/libs/draco/gltf/`
    );
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.isPlaying = true; // Animation state

    // Initialize the scene: add mesh, set up render targets, FBO, and event listeners
    this.addMesh();
    this.getRenderTarget();
    this.setupFBO();
    this.resize();
    this.render();
    this.setupResize();
  }

  // Listen for window resize events
  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  // Adjust camera and renderer when the window size changes
  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }


  // Create a render target for offscreen rendering (used for FBO/particle simulation)
  getRenderTarget(){
    const renderTarget = new THREE.WebGLRenderTarget(
      this.width,
      this.height,
      {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type:THREE.FloatType,
        stencilBuffer: false
      }
    );
    this.renderTarget = renderTarget;
  }


  // Set up Frame Buffer Object (FBO) for particle simulation
  // This is where the particle positions are stored and updated
  setupFBO(){
    this.size = 128; // Number of particles per side (size*size total)
    this.fbo = this.getRenderTarget();
    this.fbo1 = this.getRenderTarget();

    // Scene and camera for offscreen simulation
    this.fboScene = new THREE.Scene();
    this.fboCamera = new THREE.OrthographicCamera(-1,1,1,-1,-1,1);
    this.fboCamera.position.set(0,0,0.5);
    this.fboCamera.lookAt(0,0,0);
    let geometry = new THREE.PlaneGeometry(2,2);

    // Initialize particle data (positions, etc.)
    this.data = new Float32Array(this.size*this.size*4);

    // Set initial positions in a random donut (torus) shape
    for(let i=0; i<this.size*this.size; i++){
      for (let j=0; j<4; j++){
        let index = (i + j * this.size) * 4;
        let theta = Math.random() * Math.PI * 2; // Angle around the donut
        let r = 0.5 + 0.5*Math.random(); // Radius from center (donut thickness)

        this.data[index + 0] = r*Math.cos(theta); // X position
        this.data[index + 1] = r*Math.sin(theta); // Y position
        this.data[index + 2] = 1.; // Z or other attribute (unused here)
        this.data[index + 3] = 1.; // Alpha or other attribute
      }
    }

    this.fboTexture = new THREE.DataTexture(
      this.data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType
    );
    this.fboTexture.magFilter = THREE.NearestFilter;
    this.fboTexture.minFilter = THREE.NearestFilter;
    this.fboTexture.needsUpdate = true;
    
    // Shader material for simulating particle movement (airflow, cursor, etc.)
    this.fboMaterial = new THREE.ShaderMaterial({
      fragmentShader: simFragment,
      vertexShader: simVertex,
      uniforms:{
        uPositions: {value: this.fboTexture}, // Texture with particle positions
        time: {type: "f", value: 0}, // Animation time
      }
    });

    // Plane mesh to run the simulation in the FBO scene
    this.fboMesh = new THREE.Mesh(geometry, this.fboMaterial);
    this.fboScene.add(this.fboMesh);

  }


  // Add the mesh that will display the particles
  addMesh(){
    // Placeholder geometry (should be replaced with a particle system for donut)
    this.geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );

    // Use a custom shader material for particles
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms:{
        progress: {type: "f", value: 0}
      }
    })

    // Currently renders a cube; for a donut of particles, use Points or InstancedMesh
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );
  };

  // Main render loop: updates animation and renders the scene
  render(){
    this.time++;
    // Animate the mesh (currently a cube, should be particles)
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
    // Render the scene from the camera's perspective
    this.renderer.render(this.scene, this.camera);
    // Request the next frame
    window.requestAnimationFrame(this.render);
  };

}

// Start the sketch (creates the scene and starts animation)
new Sketch();


