import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

export interface MeshAnalysis {
  triangleCount: number
  vertexCount: number
  dimensions: { x: number; y: number; z: number }
  volume: number
  surfaceArea: number
  boundingBox: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }
  integrity: { valid: boolean; issues: string[] }
}

function calculateVolume(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position
  const index = geometry.index
  let volume = 0
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()
  const v3 = new THREE.Vector3()

  if (!index) {
    for (let i = 0; i < pos.count; i += 3) {
      v1.fromBufferAttribute(pos, i)
      v2.fromBufferAttribute(pos, i + 1)
      v3.fromBufferAttribute(pos, i + 2)
      volume += signedTetraVolume(v1, v2, v3)
    }
  } else {
    for (let i = 0; i < index.count; i += 3) {
      v1.fromBufferAttribute(pos, index.getX(i))
      v2.fromBufferAttribute(pos, index.getX(i + 1))
      v3.fromBufferAttribute(pos, index.getX(i + 2))
      volume += signedTetraVolume(v1, v2, v3)
    }
  }
  return Math.abs(volume / 6)
}

function signedTetraVolume(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): number {
  return a.x * (b.y * c.z - b.z * c.y)
       + b.x * (c.y * a.z - c.z * a.y)
       + c.x * (a.y * b.z - a.z * b.y)
}

function calculateSurfaceArea(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position
  let area = 0
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()
  const v3 = new THREE.Vector3()

  const process = (a: number, b: number, c: number) => {
    v1.fromBufferAttribute(pos, a)
    v2.fromBufferAttribute(pos, b)
    v3.fromBufferAttribute(pos, c)
    const ab = v1.distanceTo(v2)
    const bc = v2.distanceTo(v3)
    const ca = v3.distanceTo(v1)
    const s = (ab + bc + ca) / 2
    area += Math.sqrt(Math.max(0, s * (s - ab) * (s - bc) * (s - ca)))
  }

  const index = geometry.index
  if (!index) {
    for (let i = 0; i < pos.count; i += 3) process(i, i + 1, i + 2)
  } else {
    for (let i = 0; i < index.count; i += 3) process(index.getX(i), index.getX(i + 1), index.getX(i + 2))
  }
  return area
}

function validateMesh(geometry: THREE.BufferGeometry) {
  const issues: string[] = []
  const pos = geometry.attributes.position
  if (!pos || pos.count === 0) issues.push('Modelo não contém vértices')
  if (pos.count % 3 !== 0) issues.push('Número de vértices não forma triângulos completos')
  if (!geometry.attributes.normal) {
    issues.push('Modelo não contém normais')
    geometry.computeVertexNormals()
  }
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const box = geometry.boundingBox
  if (box && (box.isEmpty() || !isFinite(box.min.x))) issues.push('Bounding box inválida')
  return { valid: issues.length === 0, issues }
}

function analyzeGeometry(geometry: THREE.BufferGeometry): MeshAnalysis {
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const size = new THREE.Vector3()
  box.getSize(size)
  const pos = geometry.attributes.position

  return {
    triangleCount: pos.count / 3,
    vertexCount: pos.count,
    dimensions: { x: +size.x.toFixed(2), y: +size.y.toFixed(2), z: +size.z.toFixed(2) },
    volume: +calculateVolume(geometry).toFixed(2),
    surfaceArea: +calculateSurfaceArea(geometry).toFixed(2),
    boundingBox: {
      min: { x: +box.min.x.toFixed(2), y: +box.min.y.toFixed(2), z: +box.min.z.toFixed(2) },
      max: { x: +box.max.x.toFixed(2), y: +box.max.y.toFixed(2), z: +box.max.z.toFixed(2) },
    },
    integrity: validateMesh(geometry),
  }
}

export async function analyzeMeshFile(file: File): Promise<{ geometry: THREE.BufferGeometry; analysis: MeshAnalysis }> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'stl') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const loader = new STLLoader()
          const geometry = loader.parse(e.target?.result as ArrayBuffer)
          geometry.computeVertexNormals()
          geometry.computeBoundingBox()
          const analysis = analyzeGeometry(geometry)
          resolve({ geometry, analysis })
        } catch (err) {
          reject(new Error(`Erro ao processar STL: ${err}`))
        }
      }
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsArrayBuffer(file)
    })
  }

  if (ext === 'obj') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const loader = new OBJLoader()
          const object = loader.parse(e.target?.result as string)
          const geometries: THREE.BufferGeometry[] = []
          object.traverse(child => {
            if ((child as THREE.Mesh).isMesh) geometries.push((child as THREE.Mesh).geometry as THREE.BufferGeometry)
          })
          if (geometries.length === 0) throw new Error('Nenhuma geometria encontrada no OBJ')
          const geometry = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries)
          geometry.computeVertexNormals()
          geometry.computeBoundingBox()
          const analysis = analyzeGeometry(geometry)
          resolve({ geometry, analysis })
        } catch (err) {
          reject(new Error(`Erro ao processar OBJ: ${err}`))
        }
      }
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file)
    })
  }

  throw new Error(`Formato não suportado: ${ext}. Use STL ou OBJ.`)
}

function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry()
  const positions: number[] = []
  const normals: number[] = []
  for (const g of geometries) {
    const pos = g.attributes.position
    const norm = g.attributes.normal
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      if (norm) normals.push(norm.getX(i), norm.getY(i), norm.getZ(i))
    }
  }
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  if (normals.length > 0) merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  return merged
}

export function volumeToCm3(volumeMm3: number): number {
  return volumeMm3 / 1000
}

export function estimateWeight(volumeCm3: number, density: number, infill: number, purge: number): number {
  const infillRatio = infill / 100
  const purgeRatio = purge / 100
  const effectiveVolume = volumeCm3 * (0.2 + 0.8 * infillRatio)
  const waste = effectiveVolume * purgeRatio
  return (effectiveVolume + waste) * density
}
