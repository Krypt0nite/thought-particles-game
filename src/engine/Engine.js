import { updatePhysics } from './Physics'
import { render } from './Renderer'

export function startEngine({ canvas, state, params, running }) {
  const ctx = canvas.getContext('2d')

  function loop() {
    if (running.current) {
      updatePhysics(state.current, params.current)
      render(ctx, canvas, state.current)
    }
    requestAnimationFrame(loop)
  }

  loop()
}
