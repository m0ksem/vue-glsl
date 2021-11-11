export * from './components/shader-2d.types'
import Shader2DComponent from  './components/shader-2d.vue'
import { Plugin } from 'vue-demi'

export const Shader2D = Shader2DComponent

export const plugin: Plugin = {
  install(app) {
    app.component('shader-2d', Shader2DComponent)
  }
}