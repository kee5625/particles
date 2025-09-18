import './style.css'
import * as THREE from 'three';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';


export default class Sketch{
  

  constructor(){
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize(this.width, this.height);
    document.getElementById('container').appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 0.01, 10 );
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    this.addMesh();

    this.time = 0;

    this.render = this.render.bind(this);
    this.render();
  }

  addMesh(){
    this.geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    // Use custom shader instead of MeshNormalMaterial
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      uniforms:{
        progress: {type: "f", value: 0}
      }
    })

    // Render as a solid cube (triangles), not points
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );
  };

  render(){
    this.time++;
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
    // console.log(this.time);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render);
  };
}

new Sketch();


