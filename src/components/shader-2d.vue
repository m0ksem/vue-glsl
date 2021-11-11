<script lang="ts">
import { defineComponent, PropType, onMounted, ref, watch } from 'vue-demi'
import type { VueGLSLReadyEvent } from './shader-2d.types'
import { compileShader, createProgram, createVertexBuffer, getAttribute, getUniform } from './shader-2d.utils'
import { planeVertexData, defaultVertexSource } from './shader-2d.data'

const fixCanvasSize = (canvas: HTMLCanvasElement) => {
  canvas.height = canvas.offsetHeight
  canvas.width = canvas.offsetWidth
}

export default defineComponent({
  props: {
    webgl: { type: String as PropType<'webgl' | 'webgl2'>, default: 'webgl' },
    vertex: { type: String, default: defaultVertexSource },
    fragment: { type: String, required: true },
  },

  emits: ['ready'],

  setup(props, { emit }) {
    const canvas = ref<HTMLCanvasElement>()
    let program: WebGLProgram
    let ctx: WebGLRenderingContext
    let vertexShader: WebGLShader
    let fragmentShader: WebGLShader
    let animationFrameIndex: number | null = null

    const restart = () => {
      if (animationFrameIndex != null) { cancelAnimationFrame(animationFrameIndex) }

      emit('ready', {
        ctx, gl: ctx,
        createVertexBuffer: (data: BufferSource) => createVertexBuffer(ctx, data),
        getUniform: (name: string) => getUniform(ctx, program, name),
        getAttribute: (name: string) => getAttribute(ctx, program, name),
        draw(cb: (...args: any[]) => any) {
          const frame = () => {
            cb()
            animationFrameIndex = requestAnimationFrame(frame)
          }
          frame()
        }
      } as VueGLSLReadyEvent)
    }

    onMounted(() => {
      if (!canvas.value) { return }

      fixCanvasSize(canvas.value)

      ctx = canvas.value.getContext(props.webgl) as WebGLRenderingContext
      if (!ctx) { throw new Error("Webgl is not supported") }

      vertexShader = compileShader(ctx, props.vertex, ctx.VERTEX_SHADER);
      fragmentShader = compileShader(ctx, props.fragment, ctx.FRAGMENT_SHADER);

      program = createProgram(ctx, vertexShader, fragmentShader)

      const planeBuffer = createVertexBuffer(ctx, planeVertexData);
      const positionLocaltion = getAttribute(ctx, program, 'position')

      ctx.enableVertexAttribArray(positionLocaltion);
      ctx.vertexAttribPointer(positionLocaltion,
        2, 				 // position is a vec2 (2 values per component)
        ctx.FLOAT, // each component is a float
        false, 		 // don't normalize values
        2 * 4, 		 // two 4 byte float components per vertex (32 bit float is 4 bytes)
        0 				 // how many bytes inside the buffer to start from
      );

      restart()
    })

    watch(() => props.fragment, () => {
      fragmentShader = compileShader(ctx, props.fragment, ctx.FRAGMENT_SHADER);
      program = createProgram(ctx, vertexShader, fragmentShader)
      restart()
    })

    watch(() => props.vertex, () => {
      vertexShader = compileShader(ctx, props.vertex, ctx.VERTEX_SHADER);
      program = createProgram(ctx, vertexShader, fragmentShader)
      restart()
    })

    return {
      canvas,
    }
  },
})
</script>


<template>
  <canvas ref="canvas" />
</template>

<style lang="scss" scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
