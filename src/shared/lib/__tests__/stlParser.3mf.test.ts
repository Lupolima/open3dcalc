import { describe, it, expect } from "vitest";
import { analyzeMeshFile } from "../stlParser";

/**
 * Escreve um ZIP mínimo com entradas STORED (sem compressão).
 * O parser do 3MF não confere CRC, então o campo vai zerado de propósito —
 * o que interessa aqui é a topologia do pacote, não a integridade dele.
 */
function makeZip(files: Record<string, string>): Uint8Array {
  const enc = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = enc.encode(name);
    const data = enc.encode(content);

    const local = new Uint8Array(30 + nameBytes.length + data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // assinatura do cabeçalho local
    lv.setUint16(4, 20, true); // versão necessária
    lv.setUint16(8, 0, true); // método 0 = stored
    lv.setUint32(18, data.length, true); // tamanho comprimido
    lv.setUint32(22, data.length, true); // tamanho original
    lv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    locals.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); // assinatura do diretório central
    cv.setUint16(10, 0, true); // método 0 = stored
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true); // deslocamento do cabeçalho local
    central.set(nameBytes, 46);
    centrals.push(central);

    offset += local.length;
  }

  const cdSize = centrals.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, centrals.length, true);
  ev.setUint16(10, centrals.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);

  const total = offset + cdSize + eocd.length;
  const out = new Uint8Array(total);
  let p = 0;
  for (const b of [...locals, ...centrals, eocd]) {
    out.set(b, p);
    p += b.length;
  }
  return out;
}

/** Um cubo 10×10×10 na origem, como <mesh> do 3MF. */
const CUBE_MESH = `<mesh>
  <vertices>
    <vertex x="0" y="0" z="0"/><vertex x="10" y="0" z="0"/>
    <vertex x="10" y="10" z="0"/><vertex x="0" y="10" z="0"/>
    <vertex x="0" y="0" z="10"/><vertex x="10" y="0" z="10"/>
    <vertex x="10" y="10" z="10"/><vertex x="0" y="10" z="10"/>
  </vertices>
  <triangles>
    <triangle v1="0" v2="2" v3="1"/><triangle v1="0" v2="3" v3="2"/>
    <triangle v1="4" v2="5" v3="6"/><triangle v1="4" v2="6" v3="7"/>
    <triangle v1="0" v2="1" v3="5"/><triangle v1="0" v2="5" v3="4"/>
    <triangle v1="1" v2="2" v3="6"/><triangle v1="1" v2="6" v3="5"/>
    <triangle v1="2" v2="3" v3="7"/><triangle v1="2" v2="7" v3="6"/>
    <triangle v1="3" v2="0" v3="4"/><triangle v1="3" v2="4" v3="7"/>
  </triangles>
</mesh>`;

function file3mf(bytes: Uint8Array, name = "test.3mf"): File {
  return new File([bytes as BlobPart], name);
}

describe("3MF parsing", () => {
  it("lê um 3MF simples, com a malha embutida no modelo raiz", async () => {
    const zip = makeZip({
      "[Content_Types].xml": '<?xml version="1.0"?><Types/>',
      "_rels/.rels": '<?xml version="1.0"?><Relationships/>',
      "3D/3dmodel.model": `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources><object id="1" type="model">${CUBE_MESH}</object></resources>
  <build><item objectid="1"/></build>
</model>`,
    });

    const { analysis } = await analyzeMeshFile(file3mf(zip));
    expect(analysis.triangleCount).toBe(12);
    expect(analysis.dimensions.x).toBeCloseTo(10);
    expect(analysis.volume).toBeCloseTo(1000);
  });

  it("segue p:path para malhas em partes externas (production extension)", async () => {
    // Layout de projeto do OrcaSlicer/BambuStudio: o modelo raiz não tem
    // malha nenhuma, só um componente apontando para outra parte do ZIP.
    const zip = makeZip({
      "[Content_Types].xml": '<?xml version="1.0"?><Types/>',
      "_rels/.rels": '<?xml version="1.0"?><Relationships/>',
      "3D/3dmodel.model": `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter"
 xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
 xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06">
  <resources>
    <object id="1" type="model">
      <components>
        <component p:path="/3D/Objects/object_1.model" objectid="2"/>
      </components>
    </object>
  </resources>
  <build><item objectid="1"/></build>
</model>`,
      "3D/Objects/object_1.model": `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources><object id="2" type="model">${CUBE_MESH}</object></resources>
  <build/>
</model>`,
    });

    const { analysis } = await analyzeMeshFile(file3mf(zip));
    expect(analysis.triangleCount).toBe(12);
    expect(analysis.volume).toBeCloseTo(1000);
  });

  it("aplica as matrizes de <item> e <component>", async () => {
    // Duas cópias do mesmo cubo, uma na origem e outra deslocada 50 mm em X:
    // sem aplicar a matriz, as duas se empilhariam e a caixa daria 10 mm.
    const zip = makeZip({
      "3D/3dmodel.model": `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources><object id="1" type="model">${CUBE_MESH}</object></resources>
  <build>
    <item objectid="1"/>
    <item objectid="1" transform="1 0 0 0 1 0 0 0 1 50 0 0"/>
  </build>
</model>`,
    });

    const { analysis } = await analyzeMeshFile(file3mf(zip));
    expect(analysis.triangleCount).toBe(24);
    expect(analysis.dimensions.x).toBeCloseTo(60); // 0..10 e 50..60
    expect(analysis.dimensions.y).toBeCloseTo(10);
  });

  it("não trava com componentes que se auto-referenciam", async () => {
    const zip = makeZip({
      "3D/3dmodel.model": `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <components><component objectid="1"/></components>
    </object>
  </resources>
  <build><item objectid="1"/></build>
</model>`,
    });

    await expect(analyzeMeshFile(file3mf(zip))).rejects.toThrow(
      /No triangles found/,
    );
  });
});
