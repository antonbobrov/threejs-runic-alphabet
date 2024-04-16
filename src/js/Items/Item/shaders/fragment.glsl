uniform float u_time;

varying vec2 vUv;
varying float vGlobalAlpha;
varying float vRand;
varying float vPointAlpha;

void main() {
  float circle = distance(gl_PointCoord.xy, vec2(0.5));
  circle = 1.0 - smoothstep(0.3, 0.5, circle);

  vec3 color = vec3(0.17, 0.53, 0.96) * circle;
  float alpha = circle * vGlobalAlpha;
  alpha *= vPointAlpha;

  gl_FragColor = vec4(color, alpha);
}