# VueGLSL

## Usage

1. Import component 

```ts
import Shader2d from './components/shader-2d.vue'
```

```html
<Shader2d :fragment="fragment" @ready="onCanvasReady" />
```

2. Create fragment shader 
```ts
const fragment = 
`precision highp float;
uniform float time;

void main() {
  gl_FragColor = vec4(sin(time), cos(time), sin(time), 1.0);
}
`
```
3. Create event listener:

```ts
let time = 0;

const onCanvasReady = ({ draw, getUniform, gl }: VueGLSLReadyEvent) => {
    const timeHandle = getUniform('time');

    let lastFrame = Date.now();
    let thisFrame: number;

    // Will be executed each frame
    draw(() => {
      thisFrame = Date.now();
      time += (thisFrame - lastFrame) / (100 * 60);	
      lastFrame = thisFrame;

      gl.uniform1f(timeHandle, time);
  
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    })
}
```