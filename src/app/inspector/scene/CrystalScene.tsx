import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { bonds, buildCell, repeatCell, toCartesian, withNeighbours, type Atom } from '@/engine/crystal/cell'
import type { Cif } from '@/engine/crystal/cif'

import { ELEMENT_COLOUR } from '../elementColours'
const RADIUS: Record<string, number> = { O: 0.36, Si: 0.3, Al: 0.32, Na: 0.45, K: 0.5, Ca: 0.45, Mg: 0.4, Fe: 0.4, F: 0.34, Cl: 0.45, S: 0.4, C: 0.3, H: 0.2, Pb: 0.5, Zn: 0.4, P: 0.35 }

export interface CrystalOptions {
  repeat: 1 | 2
  showBonds: boolean
  showCell: boolean
  /** Draw SiO₄ (and AlO₄) tetrahedra as translucent faces. */
  polyhedra: boolean
}

/** A unit cell (or 2×2×2 of them) as spheres and sticks, orbitable. Everything Three.js lives in this file. */
export function CrystalScene({ cif, options, reducedMotion }: { cif: Cif; options: CrystalOptions; reducedMotion: boolean }) {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000)
    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(5, 8, 10)
    scene.add(key)

    // The cell's own atoms come first; the image atoms that complete edge bonds follow, drawn smaller and paler.
    const cellAtoms = buildCell(cif)
    const own = options.repeat === 2 ? repeatCell(cif, cellAtoms, 2) : cellAtoms
    const atoms: Atom[] = options.showBonds || options.polyhedra ? withNeighbours(cif, own) : own
    const isOwn = (i: number) => i < own.length
    const group = new THREE.Group()
    const corner = toCartesian(cif.cell, [options.repeat / 2, options.repeat / 2, options.repeat / 2])
    group.position.set(-corner[0], -corner[1], -corner[2])
    scene.add(group)

    const sphere = new THREE.SphereGeometry(1, 24, 16)
    const m = new THREE.Matrix4()
    for (const ownAtoms of [true, false]) {
      const byElement = new Map<string, Atom[]>()
      atoms.forEach((a, i) => {
        if (isOwn(i) === ownAtoms) byElement.set(a.element, [...(byElement.get(a.element) ?? []), a])
      })
      for (const [element, list] of byElement) {
        const material = new THREE.MeshStandardMaterial({ color: ELEMENT_COLOUR[element] ?? '#999999', roughness: 0.5, transparent: !ownAtoms, opacity: ownAtoms ? 1 : 0.45 })
        const mesh = new THREE.InstancedMesh(sphere, material, list.length)
        list.forEach((a, i) => {
          const r = (RADIUS[element] ?? 0.35) * (ownAtoms ? 1 : 0.7)
          m.makeScale(r, r, r).setPosition(a.xyz[0], a.xyz[1], a.xyz[2])
          mesh.setMatrixAt(i, m)
        })
        group.add(mesh)
      }
    }

    const pairs = options.showBonds || options.polyhedra ? bonds(atoms) : []
    if (options.showBonds) {
      const stick = new THREE.CylinderGeometry(0.07, 0.07, 1, 8)
      const sticks = new THREE.InstancedMesh(stick, new THREE.MeshStandardMaterial({ color: '#777777', roughness: 0.8 }), pairs.length)
      const up = new THREE.Vector3(0, 1, 0)
      pairs.forEach(([i, j], n) => {
        const a = new THREE.Vector3(...atoms[i]!.xyz)
        const b = new THREE.Vector3(...atoms[j]!.xyz)
        const mid = a.clone().add(b).multiplyScalar(0.5)
        const dir = b.clone().sub(a)
        const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize())
        m.compose(mid, q, new THREE.Vector3(1, dir.length(), 1))
        sticks.setMatrixAt(n, m)
      })
      group.add(sticks)
    }

    if (options.polyhedra) {
      const neighbours = new Map<number, number[]>()
      for (const [i, j] of pairs) {
        neighbours.set(i, [...(neighbours.get(i) ?? []), j])
        neighbours.set(j, [...(neighbours.get(j) ?? []), i])
      }
      const faces: number[] = []
      atoms.forEach((a, i) => {
        if (!isOwn(i) || (a.element !== 'Si' && a.element !== 'Al')) return
        const o = (neighbours.get(i) ?? []).filter((k) => atoms[k]!.element === 'O')
        if (o.length !== 4) return
        const [p, q, r, s] = o.map((k) => atoms[k]!.xyz)
        for (const tri of [[p, q, r], [p, q, s], [p, r, s], [q, r, s]] as const) for (const v of tri) faces.push(...v!)
      })
      if (faces.length) {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(faces, 3))
        geo.computeVertexNormals()
        group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#3b7dd8', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })))
      }
    }

    if (options.showCell) {
      const c = (f: [number, number, number]) => new THREE.Vector3(...toCartesian(cif.cell, f.map((v) => v * options.repeat) as [number, number, number]))
      const v = [c([0, 0, 0]), c([1, 0, 0]), c([1, 1, 0]), c([0, 1, 0]), c([0, 0, 1]), c([1, 0, 1]), c([1, 1, 1]), c([0, 1, 1])]
      const edges = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7].map((i) => v[i]!)
      group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(edges), new THREE.LineBasicMaterial({ color: '#888888' })))
    }

    const extent = Math.max(cif.cell.a, cif.cell.b, cif.cell.c) * options.repeat
    camera.position.set(extent * 1.6, extent * 1.2, extent * 1.8)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = !reducedMotion
    controls.autoRotate = !reducedMotion
    controls.autoRotateSpeed = 0.8

    let frame = 0
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight || Math.round(w * 0.75)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()
    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      renderer.dispose()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose()
          const mat = o.material as THREE.Material | THREE.Material[]
          ;(Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose())
        }
      })
      el.removeChild(renderer.domElement)
    }
  }, [cif, options, reducedMotion])

  return <div ref={mount} className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />
}

export default CrystalScene
