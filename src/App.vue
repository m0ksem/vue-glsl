<script setup lang="ts">
import { ref } from 'vue-demi'
import { VueGLSLReadyEvent } from './components/shader-2d.types'
import Shader2d from './components/shader-2d.vue'

const fragmentSource = `precision highp float;
uniform float width;
uniform float height;
uniform float time;

vec2 resolution = vec2(width, height);

void main() {
	float strength = 0.4;
	float t = abs(time);

	vec3 col = vec3(0);
	vec2 fC = gl_FragCoord.xy;

  //Normalized pixel coordinates (from 0 to 1)
  vec2 pos = fC/resolution.xy;

  pos.y /= resolution.x/resolution.y;
  pos = (pos) * 4.0;

  for(float k = 1.0; k < 4.0; k+=1.0) {
    pos.x += strength * sin(t + k * pos.y);
    pos.y += strength * tan(t + k * pos.x);
  }

  //Time varying pixel colour
  col = 0.5 + 0.5 * cos(vec3(pos.xy, 0.0));

	gl_FragColor = vec4(col, 1.0) * vec4(0.5, 0.2, 0.6, 1.0);
}
`

const fragmentSource2 = `precision highp float;
uniform float width;
uniform float height;
uniform float time;

vec2 resolution = vec2(width, height);

void main() {
	float strength = 0.4;
	float t = abs(time);

	vec3 col = vec3(0);
	vec2 fC = gl_FragCoord.xy;

  //Normalized pixel coordinates (from 0 to 1)
  vec2 pos = fC/resolution.xy;

  pos.y /= resolution.x/resolution.y;
  pos = (pos) * 4.0;

  for(float k = 1.0; k < 8.0; k+=1.0) {
    pos.x += strength * sin(t + k * pos.y);
    pos.y += strength * cos(t + k * pos.x);
  }

  //Time varying pixel colour
  col = 0.5 + 0.5 * cos(vec3(pos.xy, 0.0));

	gl_FragColor = vec4(col, 1.0) * vec4(0.0, 0.6, 1.0, 1.0);
}
`

let time = 0;

const onCanvasReady = ({ draw, getUniform, gl }: VueGLSLReadyEvent) => {
    const timeHandle = getUniform('time');
    const widthHandle = getUniform('width');
    const heightHandle = getUniform('height');

    gl.uniform1f(widthHandle, window.innerWidth);
    gl.uniform1f(heightHandle, window.innerHeight);

    let lastFrame = Date.now();
    let thisFrame: number;

    draw(() => {
      thisFrame = Date.now();
      time += (thisFrame - lastFrame) / (100 * 60);	
      lastFrame = thisFrame;

      gl.uniform1f(timeHandle, time);
  
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    })
}

const fragment = ref(fragmentSource)
let currentShader = 0

const onClick = () => {
  currentShader = Number(!currentShader)
  if (currentShader) {
    fragment.value = fragmentSource2
  } else {
    fragment.value = fragmentSource
  }
  
}
</script>

<template>
  <Shader2d :fragment="fragment" @ready="onCanvasReady" @click="onClick" />
</template>

<style lang="scss">
  body {
    margin: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  #app {
    height: 100%;
    width: 100%;
  }
</style>