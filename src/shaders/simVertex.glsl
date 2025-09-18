// Using ShaderMaterial: built-in attributes/uniforms are injected, don't redeclare them.
varying vec2 vUv;
uniform float time;
varying vec3 vPosition;
uniform vec2 pixels;
float PI =  3.141592653589793;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}