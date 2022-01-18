export const createProgram = (ctx: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
  const program = ctx.createProgram();

  if (!program) { throw new Error('Can not create program'); }

  ctx.attachShader(program, vertexShader);
  ctx.attachShader(program, fragmentShader);
  ctx.linkProgram(program);

  ctx.useProgram(program);

  return program;
}

export const compileShader = (
  ctx: WebGLRenderingContext, 
  shaderSource: string,
  shaderType: number,
) => {
  const shader = ctx.createShader(shaderType);

  if (!shader) {
    throw new Error('Can not compile shader')
  }

  ctx.shaderSource(shader, shaderSource);
  ctx.compileShader(shader);

  if(!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)){
    console.warn("Shader compile failed with: " + ctx.getShaderInfoLog(shader))
    return null
  }

  return shader;
}

export const getAttribute = (ctx: WebGLRenderingContext, program: WebGLProgram, name: string) => {
  const location = ctx.getAttribLocation(program, name);
  if (location === -1 || location === null) {
    throw `Cannot find attribute ${name}.`;
  }
  return location;
}

export const getUniform = (ctx: WebGLRenderingContext, program: WebGLProgram, name: string) => {
  const location = ctx.getUniformLocation(program, name);
  if (location === -1 || location == null) {
    throw `Cannot find uniform ${name}.`;
  }
  return location;
}

export const createVertexBuffer = (ctx: WebGLRenderingContext, data: BufferSource) => {
  const buffer = ctx.createBuffer();

  if (!buffer) { throw 'Cannot create buffer'; }

  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);

  return buffer;
}

