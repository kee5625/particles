// Fragment shader: color points by their UV just to visualize varying flow.
// For a solid color, you can ignore vUv and return a constant.
varying vec2 vUv;

void main() {
  // Simple gradient using UVs; keep alpha at 1.0
  gl_FragColor = vec4(vUv, 1.0 - vUv.x, 1.0);
}