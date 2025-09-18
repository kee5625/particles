// Fragment shader: color points by their UV just to visualize varying flow.
// For a solid color, you can ignore vUv and return a constant.
varying vec2 vUv;
uniform float time;
uniform float progress;
uniform sampler2D texture1; // Texture with particle positions
uniform vec4 resolution; // Viewport resolution
varying vec2 vUv;
varying vec3 vPosition;
float PI =  3.141592653589793;

void main() {
  // Simple gradient using UVs; keep alpha at 1.0
  gl_FragColor = vec4(vUv, 1.0 - vUv.x, 1.0);
}