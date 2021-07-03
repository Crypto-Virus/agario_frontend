import {writable, derived} from 'svelte/store'

export const width = writable(window.innerWidth)
export const height = writable(window.innerHeight)
export const pixelRatio = writable(window.devicePixelRatio)

export const props = {
  width,
  height,
  pixelRatio,
}

