import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

// Lints code strings against the real eslint.config.js. The file paths are virtual: they only select which config
// blocks apply.
let eslint: ESLint

beforeAll(async () => {
  eslint = new ESLint()
  await eslint.lintText('export {}\n', { filePath: 'src/data/warmup.ts' })
}, 30_000)

async function ruleIds(code: string, filePath: string): Promise<string[]> {
  const results = await eslint.lintText(code, { filePath })
  // lintText returns [] silently if the path matches no config block, which would make every "is clean" test pass vacuously.
  expect(results).toHaveLength(1)
  const [result] = results
  if (!result) throw new Error('no lint result')
  return result.messages.map((m) => m.ruleId ?? `FATAL: ${m.message}`)
}

const FETCH = 'export const f = () => fetch("https://example.org")\n'

describe('architecture lint rules', () => {
  it.each([
    ['react', 'src/data/x.ts'],
    ['react-dom/client', 'src/engine/x.ts'],
    ['@/app/foo', 'src/data/adapters/x.ts'],
    ['../../app/foo', 'src/engine/sub/x.ts'],
  ])('rejects importing %s in %s', async (source, filePath) => {
    const ids = await ruleIds(`import * as m from "${source}"\nexport const v = m\n`, filePath)
    expect(ids).toEqual(['no-restricted-imports'])
  })

  it.each(['src/app/pages/X.tsx', 'src/main.tsx', 'src/data/snapshot.ts', 'src/engine/x.ts', 'src/map/x.ts'])('rejects fetch in %s', async (filePath) => {
    expect(await ruleIds(FETCH, filePath)).toEqual(['no-restricted-globals'])
  })

  it('allows fetch in src/data/adapters/', async () => {
    expect(await ruleIds(FETCH, 'src/data/adapters/usgs-quakes.ts')).toEqual([])
  })

  it('keeps Three.js inside scene/ folders', async () => {
    expect(await ruleIds('import * as THREE from "three"\nexport const t = THREE\n', 'src/app/inspector/Card.tsx')).toEqual(['no-restricted-imports'])
    expect(await ruleIds('import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"\nexport const t = OrbitControls\n', 'src/app/inspector/Card.tsx')).toEqual(['no-restricted-imports'])
    expect(await ruleIds('import * as THREE from "three"\nexport const t = THREE\n', 'src/app/inspector/scene/CrystalScene.tsx')).toEqual([])
    expect(await ruleIds('import * as THREE from "three"\nexport const t = THREE\n', 'src/engine/x.ts')).toEqual(['no-restricted-imports'])
  })

  it('rejects the DOM in pure folders', async () => {
    expect(await ruleIds('export const t = document.title\n', 'src/data/adapters/x.ts')).toEqual(['no-restricted-globals'])
    expect(await ruleIds('export const t = window.name\n', 'src/engine/x.ts')).toEqual(['no-restricted-globals'])
  })

  it('rejects the clock and random in engine/', async () => {
    expect(await ruleIds('export const t = Date.now()\n', 'src/engine/x.ts')).toEqual(['no-restricted-properties'])
    expect(await ruleIds('export const t = new Date()\n', 'src/engine/x.ts')).toEqual(['no-restricted-syntax'])
    expect(await ruleIds('export const r = Math.random()\n', 'src/engine/x.ts')).toEqual(['no-restricted-properties'])
  })
})
