<script lang="ts">
import { defineComponent, PropType, onMounted, ref, watch, h, onBeforeUnmount } from 'vue-demi'
import type { VueGLSLReadyEvent } from './shader-2d.types'
import { compileShader, createProgram, createVertexBuffer, getAttribute, getUniform } from './shader-2d.utils'
import { defaultVertexSource, planeVertexData } from './shader-2d.data'

const fixCanvasSize = (canvas: HTMLCanvasElement) => {
  canvas.height = canvas.offsetHeight
  canvas.width = canvas.offsetWidth
}

export default defineComponent({
  name: 'Shader2d',

  props: {
    ctxOptions: { type: Object as PropType<WebGLContextAttributes>, default: () => ({}) },
    webgl: { type: String as PropType<'webgl' | 'webgl2'>, default: 'webgl' },
    vertex: { type: String, default: defaultVertexSource },
    fragment: { type: String, required: true },

    /** Pass null ref to access drawing context */
    modelValue: { 
      type: Object as PropType<VueGLSLReadyEvent | undefined | null>, 
      default: () => ({}),
    },
  },

  emits: ['ready', 'update:modelValue'],

  setup(props, { emit }) {
    const canvas = ref<HTMLCanvasElement>()
    const isError = ref(false)

    let program: WebGLProgram
    let ctx: WebGLRenderingContext
    let vertexShader: WebGLShader | null
    let fragmentShader: WebGLShader | null
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
        },
        canvas: canvas.value,
        onResize,
      } as VueGLSLReadyEvent)
    }

    const onResize = () => { 
      if (canvas.value) { fixCanvasSize(canvas.value) }
      
      if (ctx) { ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height) }
    }

    onMounted(() => {
      if (!canvas.value) { return }

      fixCanvasSize(canvas.value)

      ctx = canvas.value.getContext(props.webgl, props.ctxOptions) as WebGLRenderingContext
      if (!ctx) { throw new Error("Webgl is not supported") }

      vertexShader = compileShader(ctx, props.vertex, ctx.VERTEX_SHADER);
      fragmentShader = compileShader(ctx, props.fragment, ctx.FRAGMENT_SHADER);

      if (!vertexShader || !fragmentShader) { return isError.value = true }

      program = createProgram(ctx, vertexShader, fragmentShader)

      createVertexBuffer(ctx, planeVertexData);
      const positionLocaltion = getAttribute(ctx, program, 'position')

      ctx.enableVertexAttribArray(positionLocaltion);
      ctx.vertexAttribPointer(positionLocaltion,
        2, 				 // position is a vec2 (2 values per component)
        ctx.FLOAT, // each component is a float
        false, 		 // don't normalize values
        2 * 4, 		 // two 4 byte float components per vertex (32 bit float is 4 bytes)
        0 				 // how many bytes inside the buffer to start from
      );

      emit('update:modelValue', {
        ctx, gl: ctx,
        createVertexBuffer: (data: BufferSource) => createVertexBuffer(ctx, data),
        getUniform: (name: string) => getUniform(ctx, program, name),
        getAttribute: (name: string) => getAttribute(ctx, program, name),
        canvas: canvas.value,
        onResize,
      } as VueGLSLReadyEvent)

      restart()

      window.addEventListener('resize', onResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize)
    })

    watch(() => props.fragment, () => {
      isError.value = false
      fragmentShader = compileShader(ctx, props.fragment, ctx.FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) { return isError.value = true }
      program = createProgram(ctx, vertexShader, fragmentShader)
      restart()
    })

    watch(() => props.vertex, () => {
      isError.value = false
      vertexShader = compileShader(ctx, props.vertex, ctx.VERTEX_SHADER);
      if (!vertexShader || !fragmentShader) { return isError.value = true }
      program = createProgram(ctx, vertexShader, fragmentShader)
      restart()
    })

    return () => isError.value ? h({ text: 'Shader compilation error' }) : h('canvas', {
      ref: canvas
    })
  },
})
</script>

<style lang="scss" scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>
