export type VueGLSLReadyEvent = {
  ctx: WebGLRenderingContext,
  gl: WebGLRenderingContext,
  createVertexBuffer: (data: BufferSource) => WebGLBuffer,
  getAttribute: (name: string) => number,
  getUniform: (name: string) => number,
  draw: (cb: (...args: any[]) => any) => void
}