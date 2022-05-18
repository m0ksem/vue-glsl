export type VueGLSLContext = {
  ctx: WebGLRenderingContext,
  gl: WebGLRenderingContext,
  createVertexBuffer: (data: BufferSource) => WebGLBuffer,

  /** Returns attribute location */
  getAttribute: (name: string) => number,

  /** Returns uniform location */
  getUniform: (name: string) => number,

  canvas: HTMLCanvasElement,

  onResize: () => void,
}

export type VueGLSLReadyEvent = {
  draw: (cb: (...args: any[]) => any) => void
} & VueGLSLContext