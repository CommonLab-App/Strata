/**
 * Resolves once the fonts have loaded and a frame has actually been painted (two animation frames: the second runs
 * only after the first frame is on screen), then yields once more so the paint is committed before any long task.
 * Heavy chunks (the globe, the crystal viewer) start after this, never before the page's text is up.
 */
export const settled = () =>
  document.fonts.ready.then(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0)))
      }),
  )
