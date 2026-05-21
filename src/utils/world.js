export const WORLD_SCALE = 0.025
export const PLAYER_START = { x: 200, y: 1950 }

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const circleHitsRect = (x, y, r, rect) => {
  const closestX = clamp(x, rect.x, rect.x + rect.w)
  const closestY = clamp(y, rect.y, rect.y + rect.h)
  const dx = x - closestX
  const dy = y - closestY
  return dx * dx + dy * dy < r * r
}

export const campusToWorld = (campus, x, y) => {
  const originX = campus.width / 2
  const originY = campus.height / 2
  return [(x - originX) * WORLD_SCALE, 0, (y - originY) * WORLD_SCALE]
}

export const rectToWorld = (campus, rect) => {
  const centerX = rect.x + rect.w / 2
  const centerY = rect.y + rect.h / 2
  const [x, , z] = campusToWorld(campus, centerX, centerY)
  return {
    position: [x, 0, z],
    size: [rect.w * WORLD_SCALE, rect.h * WORLD_SCALE],
  }
}
