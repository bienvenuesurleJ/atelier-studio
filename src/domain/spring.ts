export interface SpringState {
  value: number
  velocity: number
}

export interface SpringParams {
  stiffness: number
  damping: number
  mass: number
}

export function stepSpring(state: SpringState, target: number, params: SpringParams, dt: number): SpringState {
  const mass = Math.max(0.05, params.mass)
  const stiffness = Math.max(0, params.stiffness)
  const damping = Math.max(0, params.damping)
  const step = Math.min(0.032, Math.max(0.001, dt))
  const force = -stiffness * (state.value - target)
  const acceleration = (force - damping * state.velocity) / mass
  const velocity = state.velocity + acceleration * step
  const value = state.value + velocity * step
  return { value, velocity }
}

export function simulateSpring(from: number, to: number, params: SpringParams, frames = 180, dt = 1 / 60): number[] {
  let state: SpringState = { value: from, velocity: 0 }
  const values = [state.value]
  for (let i = 0; i < frames; i += 1) {
    state = stepSpring(state, to, params, dt)
    values.push(state.value)
    if (Math.abs(state.value - to) < 0.004 && Math.abs(state.velocity) < 0.02) break
  }
  return values
}
