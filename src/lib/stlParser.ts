import { BufferGeometry } from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

export interface StlInfo {
  volume: number
  surfaceArea: number
  vertices: number
  faces: number
  isValid: boolean
  isManifold: boolean
  boundingBox: { x: number; y: number; z: number }
}

export async function parseStlFile(file: File): Promise<{ geometry: BufferGeometry; info: StlInfo }> {
  const arrayBuffer = await file.arrayBuffer()
  const loader = new STLLoader()
  const geometry = loader.parse(arrayBuffer)

  geometry.computeVertexNormals()
  geometry.computeBoundingBox()

  if (!geometry.boundingBox) {
    throw new Error('Could not compute bounding box')
  }

  const pos = geometry.getAttribute('position')
  const vertices = pos.count
  const faces = vertices / 3
  const volume = computeVolume(geometry)
  const surfaceArea = computeSurfaceArea(geometry)
  const bb = geometry.boundingBox
  const size = {
    x: Math.abs(bb.max.x - bb.min.x),
    y: Math.abs(bb.max.y - bb.min.y),
    z: Math.abs(bb.max.z - bb.min.z),
  }

  const edges = geometry.getIndex()
  const isManifold = edges !== null ? checkManifold(geometry) : true

  return {
    geometry,
    info: {
      volume, // mm³
      surfaceArea,
      vertices,
      faces,
      isValid: faces > 0 && volume > 0,
      isManifold,
      boundingBox: size,
    },
  }
}

function computeVolume(geometry: BufferGeometry): number {
  const pos = geometry.getAttribute('position')
  const vertices = pos.array
  let volume = 0

  for (let i = 0; i < vertices.length; i += 9) {
    const ax = vertices[i], ay = vertices[i + 1], az = vertices[i + 2]
    const bx = vertices[i + 3], by = vertices[i + 4], bz = vertices[i + 5]
    const cx = vertices[i + 6], cy = vertices[i + 7], cz = vertices[i + 8]

    const v321 = cx * by * az
    const v231 = cx * ay * bz
    const v312 = bx * cy * az
    const v132 = bx * ay * cz
    const v213 = ax * cy * bz
    const v123 = ax * by * cz

    volume += (-v321 + v231 + v312 - v132 - v213 + v123) / 6
  }

  return Math.abs(volume) // mm³
}

function computeSurfaceArea(geometry: BufferGeometry): number {
  const pos = geometry.getAttribute('position')
  const vertices = pos.array
  let area = 0

  for (let i = 0; i < vertices.length; i += 9) {
    const ax = vertices[i], ay = vertices[i + 1], az = vertices[i + 2]
    const bx = vertices[i + 3], by = vertices[i + 4], bz = vertices[i + 5]
    const cx = vertices[i + 6], cy = vertices[i + 7], cz = vertices[i + 8]

    const abx = bx - ax, aby = by - ay, abz = bz - az
    const acx = cx - ax, acy = cy - ay, acz = cz - az

    const nx = aby * acz - abz * acy
    const ny = abz * acx - abx * acz
    const nz = abx * acy - aby * acx

    area += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2
  }

  return area // mm²
}

function checkManifold(geometry: BufferGeometry): boolean {
  const index = geometry.getIndex()
  if (!index) return true
  const edgeMap = new Map<string, number>()

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2)
    const edges = [
      [Math.min(a, b), Math.max(a, b)],
      [Math.min(b, c), Math.max(b, c)],
      [Math.min(c, a), Math.max(c, a)],
    ]
    for (const [e0, e1] of edges) {
      const key = `${e0}-${e1}`
      edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1)
    }
  }

  for (const count of edgeMap.values()) {
    if (count !== 2) return false
  }
  return true
}

export function volumeToCm3(volumeMm3: number): number {
  return volumeMm3 / 1000
}
