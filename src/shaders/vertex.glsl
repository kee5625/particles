// Using ShaderMaterial: built-in attributes/uniforms are injected, don't redeclare them.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}