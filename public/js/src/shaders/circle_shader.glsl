#define PI 3.1415926535897932384626433832795
#define NUM_CIRCLES 10.0
#define CIRCLE_RADIUS_SQUARED 0.5
#define RING_RADIUS 0.0025

precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform bool isNoteOnset;

void main() {
  vec2 ndcPosition = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  vec3 destColor = vec3(1.0, 0.7, 0.5);

  float circle = length(ndcPosition);
  float circleMask;

  if (isNoteOnset == true) {
    float wobbleX = cos(time) * (sqrt(CIRCLE_RADIUS_SQUARED) + sin(time) * RING_RADIUS * 2.0) + ndcPosition.x;
    float wobbleY = sin(time) * (sqrt(CIRCLE_RADIUS_SQUARED) + sin(time) * RING_RADIUS * 2.0) + ndcPosition.xy;
    circleMask = RING_RADIUS * (1.0 + 0.1 * sin(0.64 + time))) / abs(circle - CIRCLE_RADIUS_SQUARED);
  } else {
    circleMask = RING_RADIUS / abs(circle - CIRCLE_RADIUS_SQUARED);
  }

  gl_FragColor = vec4(vec3(destColor * circleMask), 1.0);
}
