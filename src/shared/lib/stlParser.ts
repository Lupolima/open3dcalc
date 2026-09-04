import * as THREE from "three";

export interface MeshAnalysis {
  triangleCount: number;
  vertexCount: number;
  dimensions: { x: number; y: number; z: number };
  volume: number;
  surfaceArea: number;
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  integrity: { valid: boolean; issues: string[] };
  /** Estimated support material volume in cm³. Only present when `estimateSupport` is enabled. */
  supportVolumeCm3?: number;
}

/** A single triangle defined by three vertices (coordinates in mm). */
export interface Triangle {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
}

export interface ParseOptions {
  /** When true, estimates support material volume from overhang triangles. Default false. */
  estimateSupport?: boolean;
  /** Layer height in mm used for support estimation. Default 0.2. */
  layerHeight?: number;
  /** Fraction of overhang volume that becomes support material. Default 0.15. */
  supportDensity?: number;
}

function calculateVolume(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position;
  const index = geometry.index;
  let volume = 0;
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  if (!index) {
    for (let i = 0; i < pos.count; i += 3) {
      v1.fromBufferAttribute(pos, i);
      v2.fromBufferAttribute(pos, i + 1);
      v3.fromBufferAttribute(pos, i + 2);
      volume += signedTetraVolume(v1, v2, v3);
    }
  } else {
    for (let i = 0; i < index.count; i += 3) {
      v1.fromBufferAttribute(pos, index.getX(i));
      v2.fromBufferAttribute(pos, index.getX(i + 1));
      v3.fromBufferAttribute(pos, index.getX(i + 2));
      volume += signedTetraVolume(v1, v2, v3);
    }
  }
  return Math.abs(volume / 6);
}

function signedTetraVolume(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
): number {
  return (
    a.x * (b.y * c.z - b.z * c.y) +
    b.x * (c.y * a.z - c.z * a.y) +
    c.x * (a.y * b.z - a.z * b.y)
  );
}

function calculateSurfaceArea(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position;
  let area = 0;
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();

  const process = (a: number, b: number, c: number) => {
    v1.fromBufferAttribute(pos, a);
    v2.fromBufferAttribute(pos, b);
    v3.fromBufferAttribute(pos, c);
    const ab = v1.distanceTo(v2);
    const bc = v2.distanceTo(v3);
    const ca = v3.distanceTo(v1);
    const s = (ab + bc + ca) / 2;
    area += Math.sqrt(Math.max(0, s * (s - ab) * (s - bc) * (s - ca)));
  };

  const index = geometry.index;
  if (!index) {
    for (let i = 0; i < pos.count; i += 3) process(i, i + 1, i + 2);
  } else {
    for (let i = 0; i < index.count; i += 3)
      process(index.getX(i), index.getX(i + 1), index.getX(i + 2));
  }
  return area;
}

/**
 * Extracts triangles from a BufferGeometry (coordinates in mm).
 * Handles both indexed and non-indexed geometries.
 */
function extractTriangles(geometry: THREE.BufferGeometry): Triangle[] {
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const triangles: Triangle[] = [];
  const read = (i: number): [number, number, number] => [
    pos.getX(i),
    pos.getY(i),
    pos.getZ(i),
  ];

  if (!index) {
    for (let i = 0; i < pos.count; i += 3) {
      triangles.push({ a: read(i), b: read(i + 1), c: read(i + 2) });
    }
  } else {
    for (let i = 0; i < index.count; i += 3) {
      triangles.push({
        a: read(index.getX(i)),
        b: read(index.getX(i + 1)),
        c: read(index.getX(i + 2)),
      });
    }
  }
  return triangles;
}

/**
 * Estimates the support material volume (in cm³) needed for a mesh.
 *
 * Triangles whose normal points downward (normal Y < -0.7, i.e. facing down
 * more than ~45°) are treated as potential overhangs. The overhang area is
 * multiplied by the layer height and a support density factor:
 *
 *   supportVolume = overhangArea * layerHeight * supportDensity
 *
 * @param triangles Mesh triangles (coordinates in mm).
 * @param options Optional layerHeight (mm, default 0.2) and supportDensity (default 0.15).
 * @returns Estimated support volume in cm³.
 */
export function estimateSupportVolume(
  triangles: Triangle[],
  options: { layerHeight?: number; supportDensity?: number } = {},
): number {
  const layerHeight = options.layerHeight ?? 0.2;
  const supportDensity = options.supportDensity ?? 0.15;
  let overhangAreaMm2 = 0;

  for (const tri of triangles) {
    const [ax, ay, az] = tri.a;
    const [bx, by, bz] = tri.b;
    const [cx, cy, cz] = tri.c;

    // Edges of the triangle
    const ux = bx - ax,
      uy = by - ay,
      uz = bz - az;
    const vx = cx - ax,
      vy = cy - ay,
      vz = cz - az;

    // Normal = u × v (magnitude = 2 × triangle area)
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len === 0) continue;

    // Normalized Y component: < -0.7 means the face points downward > ~45°
    if (ny / len < -0.7) {
      overhangAreaMm2 += len / 2;
    }
  }

  // mm² * mm = mm³ → convert to cm³ (÷ 1000)
  return (overhangAreaMm2 * layerHeight * supportDensity) / 1000;
}

function validateMesh(geometry: THREE.BufferGeometry) {
  const issues: string[] = [];
  const pos = geometry.attributes.position;
  if (!pos || pos.count === 0) issues.push("Model does not contain vertices");
  if (pos.count % 3 !== 0)
    issues.push("Vertex count does not form complete triangles");
  if (!geometry.attributes.normal) {
    issues.push("Model does not contain normals");
    geometry.computeVertexNormals();
  }
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box && (box.isEmpty() || !isFinite(box.min.x)))
    issues.push("Invalid bounding box");
  return { valid: issues.length === 0, issues };
}

function analyzeGeometry(
  geometry: THREE.BufferGeometry,
  options: ParseOptions = {},
): MeshAnalysis {
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const pos = geometry.attributes.position;

  const analysis: MeshAnalysis = {
    triangleCount: pos.count / 3,
    vertexCount: pos.count,
    dimensions: {
      x: +size.x.toFixed(2),
      y: +size.y.toFixed(2),
      z: +size.z.toFixed(2),
    },
    volume: +calculateVolume(geometry).toFixed(2),
    surfaceArea: +calculateSurfaceArea(geometry).toFixed(2),
    boundingBox: {
      min: {
        x: +box.min.x.toFixed(2),
        y: +box.min.y.toFixed(2),
        z: +box.min.z.toFixed(2),
      },
      max: {
        x: +box.max.x.toFixed(2),
        y: +box.max.y.toFixed(2),
        z: +box.max.z.toFixed(2),
      },
    },
    integrity: validateMesh(geometry),
  };

  if (options.estimateSupport) {
    analysis.supportVolumeCm3 = +estimateSupportVolume(
      extractTriangles(geometry),
      options,
    ).toFixed(2);
  }

  return analysis;
}

export async function analyzeMeshFile(
  file: File,
  options: ParseOptions = {},
): Promise<{ geometry: THREE.BufferGeometry; analysis: MeshAnalysis }> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "3mf") {
    return parse3mf(file, options);
  }

  if (ext === "stl") {
    const { STLLoader } = await import("three/addons/loaders/STLLoader.js");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loader = new STLLoader();
          const geometry = loader.parse(e.target?.result as ArrayBuffer);
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          const analysis = analyzeGeometry(geometry, options);
          resolve({ geometry, analysis });
        } catch (err) {
          reject(new Error(`Error processing STL: ${err}`));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsArrayBuffer(file);
    });
  }

  if (ext === "obj") {
    const { OBJLoader } = await import("three/addons/loaders/OBJLoader.js");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loader = new OBJLoader();
          const object = loader.parse(e.target?.result as string);
          const geometries: THREE.BufferGeometry[] = [];
          object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh)
              geometries.push(
                (child as THREE.Mesh).geometry as THREE.BufferGeometry,
              );
          });
          if (geometries.length === 0)
            throw new Error("No geometry found in OBJ");
          const geometry =
            geometries.length === 1
              ? geometries[0]
              : mergeGeometries(geometries);
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          const analysis = analyzeGeometry(geometry, options);
          resolve({ geometry, analysis });
        } catch (err) {
          reject(new Error(`Error processing OBJ: ${err}`));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  }

  throw new Error(`Unsupported format: ${ext}. Use STL, OBJ or 3MF.`);
}

/**
 * Uma entrada do diretório central do ZIP que embala o 3MF.
 * O 3MF é um pacote OPC (um ZIP), então ler o arquivo é ler o ZIP primeiro.
 */
interface ZipEntry {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

/**
 * Lê o diretório central do ZIP e devolve TODAS as entradas indexadas por nome
 * em minúsculas (nomes de parte OPC são comparados sem diferenciar maiúsculas).
 *
 * Antes esta varredura parava na PRIMEIRA entrada terminada em ".model" e
 * decodificava só ela. Isso quebra os arquivos da "production extension"
 * (projetos do OrcaSlicer/BambuStudio), em que o modelo raiz não contém malha
 * nenhuma — só <components p:path="/3D/Objects/object_N.model"> — e as malhas
 * de verdade moram em outras partes do mesmo ZIP.
 */
function readZipCentralDirectory(uint8: Uint8Array): Map<string, ZipEntry> {
  // O End Of Central Directory fica, por especificação, nos últimos
  // 22 + 65535 bytes (o comentário do ZIP tem no máximo 64 KiB). Limitar a
  // busca a essa janela evita varrer um arquivo de centenas de MB byte a byte.
  const scanStart = Math.max(0, uint8.length - 22 - 0xffff);
  let eocdOffset = -1;
  for (let i = uint8.length - 22; i >= scanStart; i--) {
    if (
      uint8[i] === 0x50 &&
      uint8[i + 1] === 0x4b &&
      uint8[i + 2] === 0x05 &&
      uint8[i + 3] === 0x06
    ) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1)
    throw new Error("Invalid 3MF file: not a valid ZIP archive");

  const cdOffset =
    (uint8[eocdOffset + 16] |
      (uint8[eocdOffset + 17] << 8) |
      (uint8[eocdOffset + 18] << 16) |
      (uint8[eocdOffset + 19] << 24)) >>>
    0;
  const numEntries = uint8[eocdOffset + 10] | (uint8[eocdOffset + 11] << 8);

  const entries = new Map<string, ZipEntry>();
  let offset = cdOffset;
  for (let i = 0; i < numEntries; i++) {
    // 0x02014b50 = assinatura de um cabeçalho do diretório central.
    if (uint8[offset] !== 0x50 || uint8[offset + 1] !== 0x4b) break;

    const fileNameLen = uint8[offset + 28] | (uint8[offset + 29] << 8);
    const extraLen = uint8[offset + 30] | (uint8[offset + 31] << 8);
    const commentLen = uint8[offset + 32] | (uint8[offset + 33] << 8);
    const name = new TextDecoder().decode(
      uint8.slice(offset + 46, offset + 46 + fileNameLen),
    );

    entries.set(normalizePartName(name), {
      name,
      compressionMethod: uint8[offset + 10] | (uint8[offset + 11] << 8),
      compressedSize:
        (uint8[offset + 20] |
          (uint8[offset + 21] << 8) |
          (uint8[offset + 22] << 16) |
          (uint8[offset + 23] << 24)) >>>
        0,
      uncompressedSize:
        (uint8[offset + 24] |
          (uint8[offset + 25] << 8) |
          (uint8[offset + 26] << 16) |
          (uint8[offset + 27] << 24)) >>>
        0,
      localHeaderOffset:
        (uint8[offset + 42] |
          (uint8[offset + 43] << 8) |
          (uint8[offset + 44] << 16) |
          (uint8[offset + 45] << 24)) >>>
        0,
    });

    offset += 46 + fileNameLen + extraLen + commentLen;
  }

  return entries;
}

/**
 * Normaliza um nome de parte OPC para servir de chave: sem a barra inicial
 * (o `p:path` do 3MF é absoluto, `/3D/Objects/x.model`, mas o ZIP guarda
 * `3D/Objects/x.model`), com barras invertidas viradas e em minúsculas.
 */
function normalizePartName(name: string): string {
  return name.replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase();
}

/** Descomprime uma entrada do ZIP e devolve o texto (as partes do 3MF são XML). */
async function readZipEntryText(
  uint8: Uint8Array,
  entry: ZipEntry,
): Promise<string> {
  // Os tamanhos vêm do diretório central; o cabeçalho local só é consultado
  // para saber onde os dados começam, porque os campos de tamanho dele podem
  // estar zerados quando o escritor usou data descriptor.
  const lhs = entry.localHeaderOffset;
  const localFileNameLen = uint8[lhs + 26] | (uint8[lhs + 27] << 8);
  const localExtraLen = uint8[lhs + 28] | (uint8[lhs + 29] << 8);
  const dataStart = lhs + 30 + localFileNameLen + localExtraLen;

  if (entry.compressionMethod === 0) {
    // Stored: os bytes já são o conteúdo.
    return new TextDecoder().decode(
      uint8.slice(dataStart, dataStart + entry.uncompressedSize),
    );
  }

  if (entry.compressionMethod === 8) {
    // Deflate cru (sem cabeçalho zlib) — é o que o ZIP usa.
    const compressed = uint8.slice(dataStart, dataStart + entry.compressedSize);
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    writer.write(compressed);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
    const decompressed = new Uint8Array(totalLen);
    let pos = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, pos);
      pos += chunk.length;
    }
    return new TextDecoder().decode(decompressed);
  }

  throw new Error(`Unsupported compression method: ${entry.compressionMethod}`);
}

/**
 * Escolhe a parte que é o modelo raiz do pacote.
 * Ordem: o caminho convencional `3D/3dmodel.model` e, se ele não existir,
 * a primeira parte `.model` do pacote.
 */
function pick3mfRootModel(entries: Map<string, ZipEntry>): string {
  if (entries.has("3d/3dmodel.model")) return "3d/3dmodel.model";

  for (const key of entries.keys()) {
    if (key.endsWith(".model")) return key;
  }
  throw new Error("3MF file does not contain a valid 3D model");
}

/**
 * Matriz do 3MF: 12 números que formam uma 4x3 em convenção de vetor-linha
 * (`m00 m01 m02 m10 m11 m12 m20 m21 m22 m30 m31 m32`), onde a última linha é
 * a translação. A identidade é o valor implícito quando o atributo falta.
 */
type Mat3mf = number[];

const IDENTITY_3MF: Mat3mf = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

function parse3mfTransform(value: string | null): Mat3mf {
  if (!value) return IDENTITY_3MF;
  const n = value.trim().split(/\s+/).map(Number);
  if (n.length !== 12 || n.some((v) => !Number.isFinite(v)))
    return IDENTITY_3MF;
  return n;
}

/**
 * Compõe duas transformações: aplica `a` primeiro e `b` depois
 * (p' = p · a · b, seguindo a convenção de vetor-linha do 3MF).
 */
function mul3mf(a: Mat3mf, b: Mat3mf): Mat3mf {
  const out = new Array<number>(12);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      out[row * 3 + col] =
        a[row * 3] * b[col] +
        a[row * 3 + 1] * b[3 + col] +
        a[row * 3 + 2] * b[6 + col];
    }
  }
  // Linha de translação: a translação de `a` passa pela rotação de `b`.
  for (let col = 0; col < 3; col++) {
    out[9 + col] =
      a[9] * b[col] + a[10] * b[3 + col] + a[11] * b[6 + col] + b[9 + col];
  }
  return out;
}

/**
 * Percorre o grafo de objetos do 3MF a partir dos itens de `<build>` e acumula
 * os triângulos já transformados para as coordenadas finais da bandeja.
 *
 * Trata os três casos que o parser antigo não tratava:
 *  - `<components>`, que montam um objeto a partir de outros objetos;
 *  - `p:path`, que põe o objeto referenciado em OUTRA parte do ZIP
 *    (production extension — é o layout de projeto do OrcaSlicer/BambuStudio);
 *  - as matrizes de `<item>` e `<component>`, sem as quais objetos múltiplos
 *    se empilham todos na origem.
 */
async function collect3mfTriangles(
  uint8: Uint8Array,
  entries: Map<string, ZipEntry>,
  rootPath: string,
): Promise<{ positions: number[]; normals: number[] }> {
  const parser = new DOMParser();
  const docs = new Map<string, Document>();

  /** Carrega e memoiza uma parte `.model` do pacote. */
  const loadDoc = async (path: string): Promise<Document> => {
    const key = normalizePartName(path);
    const cached = docs.get(key);
    if (cached) return cached;

    const entry = entries.get(key);
    if (!entry) throw new Error(`3MF part not found: ${path}`);

    const doc = parser.parseFromString(
      await readZipEntryText(uint8, entry),
      "text/xml",
    );
    if (doc.querySelector("parsererror"))
      throw new Error(`Error parsing 3MF XML in ${path}`);
    docs.set(key, doc);
    return doc;
  };

  const positions: number[] = [];
  const normals: number[] = [];

  /**
   * Emite um objeto (e o que ele referenciar) já transformado.
   * `stack` guarda os pares parte#id do caminho atual para barrar ciclos —
   * um 3MF malformado poderia se auto-referenciar e travar a aba do navegador.
   */
  const emitObject = async (
    path: string,
    objectId: string,
    transform: Mat3mf,
    stack: Set<string>,
  ): Promise<void> => {
    const key = `${normalizePartName(path)}#${objectId}`;
    if (stack.has(key) || stack.size > 32) return;

    const doc = await loadDoc(path);
    const obj = Array.from(doc.querySelectorAll("object")).find(
      (o) => o.getAttribute("id") === objectId,
    );
    if (!obj) return;

    stack.add(key);
    try {
      const mesh = obj.querySelector("mesh");
      if (mesh) {
        appendMesh(mesh, transform, positions, normals);
      }

      for (const component of Array.from(obj.querySelectorAll("component"))) {
        const childId = component.getAttribute("objectid");
        if (!childId) continue;
        // `p:path` aponta para outra parte; sem ele, o objeto é local.
        const childPath =
          component.getAttribute("p:path") ||
          component.getAttribute("path") ||
          path;
        const childTransform = mul3mf(
          parse3mfTransform(component.getAttribute("transform")),
          transform,
        );
        await emitObject(childPath, childId, childTransform, stack);
      }
    } finally {
      stack.delete(key);
    }
  };

  const rootDoc = await loadDoc(rootPath);
  const items = Array.from(rootDoc.querySelectorAll("build > item"));

  if (items.length > 0) {
    for (const item of items) {
      const objectId = item.getAttribute("objectid");
      if (!objectId) continue;
      const itemPath =
        item.getAttribute("p:path") || item.getAttribute("path") || rootPath;
      await emitObject(
        itemPath,
        objectId,
        parse3mfTransform(item.getAttribute("transform")),
        new Set<string>(),
      );
    }
  }

  // Recurso final: pacotes sem `<build>` utilizável (ou cujos itens não
  // resolveram) ainda rendem geometria se houver malha solta em <resources>.
  if (positions.length === 0) {
    for (const mesh of Array.from(rootDoc.querySelectorAll("object mesh"))) {
      appendMesh(mesh, IDENTITY_3MF, positions, normals);
    }
  }

  return { positions, normals };
}

/** Converte um `<mesh>` do 3MF em triângulos soltos, aplicando a matriz. */
function appendMesh(
  mesh: Element,
  m: Mat3mf,
  positions: number[],
  normals: number[],
): void {
  const vertices = mesh.querySelectorAll("vertex");
  // Coordenadas já transformadas, em array plano: 3 números por vértice.
  const coords = new Float64Array(vertices.length * 3);
  let i = 0;
  for (const v of Array.from(vertices)) {
    const x = parseFloat(v.getAttribute("x") || "0");
    const y = parseFloat(v.getAttribute("y") || "0");
    const z = parseFloat(v.getAttribute("z") || "0");
    coords[i++] = x * m[0] + y * m[3] + z * m[6] + m[9];
    coords[i++] = x * m[1] + y * m[4] + z * m[7] + m[10];
    coords[i++] = x * m[2] + y * m[5] + z * m[8] + m[11];
  }

  const vertexCount = vertices.length;
  for (const t of Array.from(mesh.querySelectorAll("triangle"))) {
    const v1 = parseInt(t.getAttribute("v1") || "0");
    const v2 = parseInt(t.getAttribute("v2") || "0");
    const v3 = parseInt(t.getAttribute("v3") || "0");
    if (v1 >= vertexCount || v2 >= vertexCount || v3 >= vertexCount) continue;

    const x1 = coords[v1 * 3],
      y1 = coords[v1 * 3 + 1],
      z1 = coords[v1 * 3 + 2];
    const x2 = coords[v2 * 3],
      y2 = coords[v2 * 3 + 1],
      z2 = coords[v2 * 3 + 2];
    const x3 = coords[v3 * 3],
      y3 = coords[v3 * 3 + 1],
      z3 = coords[v3 * 3 + 2];

    positions.push(x1, y1, z1, x2, y2, z2, x3, y3, z3);

    // Normal da face, calculada depois da transformação — assim espelhamento
    // e rotação já vêm embutidos, sem precisar transformar normais à parte.
    const ax = x2 - x1,
      ay = y2 - y1,
      az = z2 - z1;
    const bx = x3 - x1,
      by = y3 - y1,
      bz = z3 - z1;
    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;
    for (let k = 0; k < 3; k++) normals.push(nx, ny, nz);
  }
}

async function parse3mf(
  file: File,
  options: ParseOptions = {},
): Promise<{ geometry: THREE.BufferGeometry; analysis: MeshAnalysis }> {
  const THREE = await import("three");
  const uint8 = new Uint8Array(await file.arrayBuffer());

  const entries = readZipCentralDirectory(uint8);
  const rootPath = pick3mfRootModel(entries);
  const { positions, normals } = await collect3mfTriangles(
    uint8,
    entries,
    rootPath,
  );

  if (positions.length === 0) throw new Error("No triangles found in 3MF file");

  return build3mfGeometry(positions, normals, THREE, options);
}

function build3mfGeometry(
  allPositions: number[],
  allNormals: number[],
  THREE: typeof import("three"),
  options: ParseOptions = {},
): { geometry: THREE.BufferGeometry; analysis: MeshAnalysis } {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(allPositions, 3),
  );
  if (allNormals.length > 0) {
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(allNormals, 3),
    );
  }
  geometry.computeBoundingBox();

  // A análise usa o MESMO caminho de STL e OBJ. Antes o 3MF tinha uma cópia
  // própria dela, que calculava o volume pelo teorema da divergência dividindo
  // por 6 em vez de 18 — devolvia o TRIPLO do valor real — e ainda declarava
  // `integrity: { valid: true }` sem verificar malha nenhuma.
  return { geometry, analysis: analyzeGeometry(geometry, options) };
}

function mergeGeometries(
  geometries: THREE.BufferGeometry[],
): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  for (const g of geometries) {
    const pos = g.attributes.position;
    const norm = g.attributes.normal;
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (norm) normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
    }
  }
  merged.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  if (normals.length > 0)
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  return merged;
}

export function volumeToCm3(volumeMm3: number): number {
  return volumeMm3 / 1000;
}

export function estimateWeight(
  volumeCm3: number,
  density: number,
  infill: number,
  purge: number,
): number {
  const infillRatio = infill / 100;
  const purgeRatio = purge / 100;
  const effectiveVolume = volumeCm3 * (0.2 + 0.8 * infillRatio);
  const waste = effectiveVolume * purgeRatio;
  return (effectiveVolume + waste) * density;
}
