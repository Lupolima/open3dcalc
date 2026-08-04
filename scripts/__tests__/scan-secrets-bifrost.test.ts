import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ALLOWED_FIXTURE_PATHS,
  analyzeDiffForSecrets,
  detectExposureWithLLM,
  filterAllowedFiles,
  truncateDiff,
} from "../scan-secrets-bifrost.mjs";

describe("analyzeDiffForSecrets — casos POSITIVOS (deve sinalizar)", () => {
  it("detecta API_KEY com valor sk-... (prefixo OpenAI)", () => {
    const r = analyzeDiffForSecrets(`const API_KEY = 'sk-abc123XYZ456';\n`);
    expect(r.secret).toBe(true);
    expect(r.reason).toBeTruthy();
  });

  it("detecta token GitHub ghp_... em atribuição literal", () => {
    const r = analyzeDiffForSecrets(`const token = 'ghp_xxxxxxxx';\n`);
    expect(r.secret).toBe(true);
  });

  it("detecta bloco de chave privada PRIVATE KEY", () => {
    const r = analyzeDiffForSecrets(
      [
        "+-----BEGIN RSA PRIVATE KEY-----",
        "+MIIEpAIBAAKCAQEA...",
        "+-----END RSA PRIVATE KEY-----",
      ].join("\n"),
    );
    expect(r.secret).toBe(true);
  });

  it("detecta DATABASE_URL com credenciais user:pass@host", () => {
    const r = analyzeDiffForSecrets(
      `DATABASE_URL=postgres://admin:sup3rSecret@db.internal:5432/app\n`,
    );
    expect(r.secret).toBe(true);
  });

  it("detecta valor de alta entropia atribuído (maiúsculas+minúsculas+dígitos)", () => {
    const r = analyzeDiffForSecrets(
      `const SECRET_KEY = "aB3xZ9qW2eR4tY6uI8oP0lK1mN";\n`,
    );
    expect(r.secret).toBe(true);
  });

  it("detecta Bearer token JWT longo em atribuição", () => {
    const r = analyzeDiffForSecrets(
      `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U\n`,
    );
    expect(r.secret).toBe(true);
  });

  it("analisa linhas de diff com prefixo + (conteúdo staged)", () => {
    const diff = [
      "diff --git a/src/config.ts b/src/config.ts",
      "+import { env } from './env';",
      `+const API_KEY = env.SECRET || 'sk-abc123XYZ456789';`,
    ].join("\n");
    const r = analyzeDiffForSecrets(diff);
    expect(r.secret).toBe(true);
  });
});

describe("analyzeDiffForSecrets — casos NEGATIVOS (não pode dar falso positivo)", () => {
  it("não sinaliza key={item.id} do React JSX", () => {
    const r = analyzeDiffForSecrets(
      `<Item key={item.id} name={item.name} />\n`,
    );
    expect(r.secret).toBe(false);
    expect(r.reason).toBeNull();
  });

  it("não sinaliza token como nome de variável sem valor literal", () => {
    const r = analyzeDiffForSecrets(`const token = getToken();\n`);
    expect(r.secret).toBe(false);
  });

  it("não sinaliza declaração de tipo token: string", () => {
    const r = analyzeDiffForSecrets(`token: string;\n`);
    expect(r.secret).toBe(false);
  });

  it("não sinaliza API_KEY como nome de variável sem valor literal", () => {
    const r = analyzeDiffForSecrets(`const API_KEY = env.API_KEY;\n`);
    expect(r.secret).toBe(false);
  });

  it("não sinaliza 'secret' como string curta de i18n", () => {
    const r = analyzeDiffForSecrets(`"secret": "Segredo",\n`);
    expect(r.secret).toBe(false);
  });

  it("não sinaliza commit normal de código", () => {
    const r = analyzeDiffForSecrets(
      [
        "+export const add = (a: number, b: number) => a + b;",
        "+export function greet(name: string) { return `Hello ${name}`; }",
        "+const items = [{ id: 1 }, { id: 2 }];",
      ].join("\n"),
    );
    expect(r.secret).toBe(false);
  });

  it("não sinaliza hash curto ou uuid em código", () => {
    const r = analyzeDiffForSecrets(
      `const id = "12345678-1234-5678-1234-567812345678";\n`,
    );
    expect(r.secret).toBe(false);
  });

  // ─── MEDIUM-3: falsos positivos do scanner determinístico ────────────────
  it("não sinaliza token i18n dotted (auth.session.label)", () => {
    const r = analyzeDiffForSecrets(`token: "auth.session.label",\n`);
    expect(r.secret).toBe(false);
    expect(r.reason).toBeNull();
  });

  it("não sinaliza password curta com hífen (user-pass)", () => {
    const r = analyzeDiffForSecrets(`password: "user-pass",\n`);
    expect(r.secret).toBe(false);
    expect(r.reason).toBeNull();
  });

  it("não sinaliza secret i18n dotted (app.secret.title)", () => {
    const r = analyzeDiffForSecrets(`secret: "app.secret.title",\n`);
    expect(r.secret).toBe(false);
    expect(r.reason).toBeNull();
  });

  it("não sinaliza id mixed-case de 27 chars (padrão de ID)", () => {
    const r = analyzeDiffForSecrets(`id="aBc123DeF456gHi789Jkl012Mno"\n`);
    expect(r.secret).toBe(false);
    expect(r.reason).toBeNull();
  });

  it("não sinaliza URL com maiúsculas e dígitos (CDN Logo-3x.png)", () => {
    const r = analyzeDiffForSecrets(
      `url="https://CDN.example.com/v2/Logo-3x.png"\n`,
    );
    expect(r.secret).toBe(false);
    expect(r.reason).toBeNull();
  });

  it("não sinaliza comentário mencionando PRIVATE KEY", () => {
    const r = analyzeDiffForSecrets(
      `// Nunca commite um -----BEGIN PRIVATE KEY----- em código\n`,
    );
    expect(r.secret).toBe(false);
    expect(r.reason).toBeNull();
  });

  it("não sinaliza comentário com # mencionando PRIVATE KEY", () => {
    const r = analyzeDiffForSecrets(
      `# exemplo: -----BEGIN RSA PRIVATE KEY----- (não é real)\n`,
    );
    expect(r.secret).toBe(false);
  });

  it("não sinaliza comentário com * (JSDoc) mencionando PRIVATE KEY", () => {
    const r = analyzeDiffForSecrets(
      ` * Contém -----BEGIN PRIVATE KEY----- apenas como documentação\n`,
    );
    expect(r.secret).toBe(false);
  });
});

describe("analyzeDiffForSecrets — regressões MEDIUM-3 (deve continuar sinalizando)", () => {
  it("detecta password longa com chars incomuns (≥12 chars)", () => {
    const r = analyzeDiffForSecrets(`password: "S3cr3t!Passw0rd123"\n`);
    expect(r.secret).toBe(true);
  });

  it("detecta bear token em caixa baixa (case-insensitive)", () => {
    const r = analyzeDiffForSecrets(
      `authorization: bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U\n`,
    );
    expect(r.secret).toBe(true);
  });

  it("detecta linha .env com valor de alta entropia (chave não-benigna)", () => {
    const r = analyzeDiffForSecrets(
      `DEPLOY_AUTH_TOKEN=aB3xZ9qW2eR4tY6uI8oP0lK1mN\n`,
    );
    expect(r.secret).toBe(true);
  });
});

describe("filterAllowedFiles — allowlist do detector (HIGH-1 auto-bloqueio)", () => {
  const fixtureHunk = [
    "diff --git a/scripts/__tests__/scan-secrets-bifrost.test.ts b/scripts/__tests__/scan-secrets-bifrost.test.ts",
    "index 0000000..1234567",
    "--- a/scripts/__tests__/scan-secrets-bifrost.test.ts",
    "+++ b/scripts/__tests__/scan-secrets-bifrost.test.ts",
    "+const token = 'ghp_xxxxxxxx';",
    "+-----BEGIN RSA PRIVATE KEY-----",
  ].join("\n");

  const detectorHunk = [
    "diff --git a/scripts/scan-secrets-bifrost.mjs b/scripts/scan-secrets-bifrost.mjs",
    "--- a/scripts/scan-secrets-bifrost.mjs",
    "+++ b/scripts/scan-secrets-bifrost.mjs",
    '+  const pemRe = new RegExp(`-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----|PRIVATE KEY-----`, "i");',
  ].join("\n");

  it("reconhece os caminhos allowlisted (testes e detector)", () => {
    expect(
      ALLOWED_FIXTURE_PATHS[0].test(
        "scripts/__tests__/scan-secrets-bifrost.test.ts",
      ),
    ).toBe(true);
    expect(
      ALLOWED_FIXTURE_PATHS[1].test("scripts/scan-secrets-bifrost.mjs"),
    ).toBe(true);
    expect(ALLOWED_FIXTURE_PATHS[1].test("scripts/other-file.mjs")).toBe(false);
    expect(ALLOWED_FIXTURE_PATHS[0].test("src/__tests__/x.test.ts")).toBe(
      false,
    );
  });

  it("remove hunks de arquivos allowlisted do diff", () => {
    const filtered = filterAllowedFiles(fixtureHunk);
    expect(filtered).not.toContain("ghp_xxxxxxxx");
    expect(filtered).not.toContain("PRIVATE KEY");
  });

  it("remove hunks do próprio detector", () => {
    const filtered = filterAllowedFiles(detectorHunk);
    expect(filtered).not.toContain("PRIVATE KEY");
  });

  it("mantém hunks de arquivos normais intactos", () => {
    const normal = [
      "diff --git a/src/config.ts b/src/config.ts",
      "--- a/src/config.ts",
      "+++ b/src/config.ts",
      "+export const add = (a: number, b: number) => a + b;",
    ].join("\n");
    expect(filterAllowedFiles(normal)).toBe(normal);
  });

  it("mantém texto sem cabeçalho de diff intacto (entradas diretas)", () => {
    const bare = "+const token = 'ghp_xxxxxxxx';\n";
    expect(filterAllowedFiles(bare)).toBe(bare);
  });

  it("não deixa o detector se auto-flag em diff só de arquivos allowlisted", () => {
    const r = analyzeDiffForSecrets(
      filterAllowedFiles(`${fixtureHunk}\n${detectorHunk}`),
    );
    expect(r.secret).toBe(false);
  });

  it("ainda bloqueia diff misto: arquivo normal + fixture com secret real", () => {
    const mixed = [
      "diff --git a/src/server.ts b/src/server.ts",
      "+++ b/src/server.ts",
      "+const API_KEY = 'sk-abc123XYZ456789';",
      "diff --git a/scripts/__tests__/x.test.ts b/scripts/__tests__/x.test.ts",
      "+++ b/scripts/__tests__/x.test.ts",
      "+const token = 'ghp_xxxxxxxx';",
    ].join("\n");
    const r = analyzeDiffForSecrets(filterAllowedFiles(mixed));
    expect(r.secret).toBe(true);
  });
});

describe("truncateDiff", () => {
  it("mantém diffs pequenos intactos", () => {
    const diff = "+line one\n+line two\n";
    expect(truncateDiff(diff, 100)).toBe(diff);
  });

  it("trunca diffs grandes preservando começo e fim", () => {
    const big = Array.from({ length: 1500 }, (_, i) => `+line ${i}`).join("\n");
    const out = truncateDiff(big, 8000);
    expect(big.length).toBeGreaterThan(8000);
    expect(out.length).toBeLessThanOrEqual(8200);
    expect(out.length).toBeLessThan(big.length);
    expect(out.startsWith("+line 0")).toBe(true);
    expect(out.endsWith("+line 1499")).toBe(true);
    expect(out).toContain("... [truncado");
  });
});

describe("detectExposureWithLLM", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const llm = "https://llm.ofertachina.cloud/v1/chat/completions";

  it("retorna FAIL quando o modelo responde FAIL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: "FAIL: API key sk-... detectada" } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const r = await detectExposureWithLLM("+leak\n", "test-key");
    expect(r.decision).toBe("FAIL");
    expect(r.reason).toContain("sk-");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(llm);
    expect(JSON.parse(init.body).temperature).toBe(0.0);
  });

  it("retorna PASS quando o modelo responde PASS", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: "PASS" } }],
        }),
      }),
    );
    const r = await detectExposureWithLLM("+normal code\n", "test-key");
    expect(r.decision).toBe("PASS");
  });

  it("retorna ERROR em falha de rede e não lança", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );
    const r = await detectExposureWithLLM("+diff\n", "test-key");
    expect(r.decision).toBe("ERROR");
    expect(r.reason).toBeTruthy();
  });

  it("retorna ERROR em timeout (AbortController)", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => {
              reject(new DOMException("aborted", "AbortError"));
            });
          }),
      ),
    );
    const p = detectExposureWithLLM("+diff\n", "test-key");
    await vi.advanceTimersByTimeAsync(46_000);
    const r = await p;
    expect(r.decision).toBe("ERROR");
    expect(r.reason.toLowerCase()).toContain("timeout");
  });

  it("retorna ERROR em resposta HTTP não-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    );
    const r = await detectExposureWithLLM("+diff\n", "test-key");
    expect(r.decision).toBe("ERROR");
    expect(String(r.reason)).toContain("429");
  });
});
