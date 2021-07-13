import {writable, derived} from 'svelte/store'


export const connectionStatus = writable(false)
export const inGameStatus = writable(null)
export const scores = writable([])

export const gameData = {
  gameHeight: 5000,
  gameWidth: 5000,
  position: {x: 0, y: 0},
  topLeft: {x: 0, y: 0},
  visible: 0,
  cells: [],
  food: [],
}