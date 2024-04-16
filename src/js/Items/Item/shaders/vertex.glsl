uniform float u_time;
uniform sampler2D u_map;
uniform float u_inProgress;
uniform float u_outProgress;
uniform float u_rotationRadius;
uniform float u_PointSize;

varying vec2 vUv;
varying float vStaticNoise;
varying float vGlobalAlpha;
varying float vRand;
varying float vPointAlpha;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float scoped(float value, float min, float max) {
  return (value - min) / (max - min);
}

float clampScoped(float value, float min, float max) {
  return clamp(scoped(value, min, max), 0.0, 1.0);
}

float getInProgress() {
  float yProgress = uv.y; // abs(uv.y - 0.5) * 2.0;

  float start = yProgress * 0.05;
  start += start * vRand;

  float end = clamp(yProgress, 0.0015, 1.0);

  float progress = clampScoped(u_inProgress, start, end);

  return progress;
}

vec3 getRotationPosition(float progress) {
  float timeProgress = clampScoped(progress, 0.0, 0.001);
  float rotationTime = 1.0 + (u_time * timeProgress) * 0.00005;
  float distanceFactor = distance(position, vec3(0.0));

  mat3 rotationX = rotation3dX(rotationTime * -distanceFactor);
  mat3 rotationY = rotation3dY(rotationTime * distanceFactor);

  mat3 rotationMat = rotationX * rotationY;

  vec3 additionalPosition = position * rotationMat * u_rotationRadius;
  additionalPosition = (additionalPosition - position) * (1.0 - progress);
  
  return additionalPosition;
}

vec3 getVarporPosition() {
  float threshold = 0.6;
  bool hasAnimation = vRand > threshold;
  
  if (!hasAnimation) {
    return vec3(0.0);
  }

  float direction = vRand > (1.0 - threshold / 2.0) ? 1.0 : -1.0;

  float piMultiplier = mod(1.0 + u_time * 0.0025 * pow(vRand, 2.0), 0.5);
  float progress = sin(3.1415926 * piMultiplier);

  float x = vStaticNoise * 500.0;
  float y = 0.0;
  float z = 600.0 * progress * direction;

  return vec3(x, y, z);
}

void main() {
  vUv = uv;
  vRand = rand(uv);
  
  vStaticNoise = snoise(vec3(uv * 20.0, 0.0));
  float dynamicNoise = snoise(vec3(uv * 100.0, u_time * 0.005));

  float inProgress = getInProgress();

  vec4 mapColor = texture2D(u_map, uv);
  float mapAlpha = mapColor.a;
  vPointAlpha = mapColor.a > 0.2 ? 1.0 : 0.0;

  // default coords
  vec3 transformed = vec3(position);

  // add volume
  transformed.z += vStaticNoise * 20.0 + mapAlpha * vRand * 20.0;

  // add noise
  transformed.xy += vStaticNoise * 5.0;

  // add in-rotation
  vec3 inRotation = getRotationPosition(inProgress);
  transformed += inRotation;

  // add out-rotation
  vec3 outRotation = getRotationPosition(1.0 - u_outProgress);
  transformed += outRotation;
  
  // varyings
  vGlobalAlpha = inProgress - u_outProgress;

  // vapor
  if (mapAlpha < 0.4) {
    transformed += getVarporPosition();
  }

  // blink
  float size = u_PointSize * dynamicNoise;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  gl_PointSize = size * mapAlpha * (1.0 - vRand * 0.6);
}
