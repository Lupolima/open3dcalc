#!/usr/bin/env node
/**
 * scan-secrets-bifrost.mjs — Verificação de exposição de secrets em camadas.
 *
 * Duas camadas de detecção sobre o diff staged:
 *   1. Heurísticas determinísticas (rápidas, offline, sem falso positivo em
 *      código normal): prefixos de API keys conhecidas, atribuições a nomes
 *      sensíveis, URLs com credenciais, blocos PRIVATE KEY, alta entropia.
 *   2. IA via Bifrost (fail-open): auditor de segurança LLM que responde
 *      PASS/FAIL para o diff truncado.
 *
 * Rodável com `node` puro (Node >= 18, ESM, sem dependências externas).
 * Saída em pt-BR no estilo do hook `.husky/commit-msg`.
 *
 * ⚠️  PRIVACIDADE: o diff staged (truncado em até 8000 chars) é enviado ao
 * serviço externo https://llm.ofertachina.cloud (Bifrost) quando BF_VIRTUAL_KEY
 * ou `git config bifrost.api-key` está configurado. Não commite secrets reais —
 * a camada IA é apenas um segundo auditor, e é fail-open: em erro de API/rede
 * (HTTP != 200, timeout 45s, resposta inesperada) ela NÃO bloqueia o commit.
 */

import { spawnSync } from "node:child_process";

/** Endpoint e modelo Bifrost — mesma infra do hook `.husky/commit-msg`. */
export const BIFROST_URL = "https://llm.ofertachina.cloud/v1/chat/completions";
export const BIFROST_MODEL = "opencode-zen/deepseek-v4-flash-free";

/** Tamanho máximo do diff enviado ao LLM (contexto do modelo). */
export const MAX_LLM_DIFF_CHARS = 8000;

/**
 * Separa as linhas *adicionadas* de um diff (conteúdo staged) e devolve o
 * texto "limpo" (sem o marcador de linha `+`). Linhas de contexto (` `) e de
 * remoção (`-`) são ignoradas — apenas o que entra no commit pode vazar algo
 * novo. Texto que não parece diff (ex.: snippets soltos nos testes) passa
 * intacto.
 */
function addedLines(diffText) {
  const lines = String(diffText).split("\n");
  const out = [];
  for (const raw of lines) {
    if (raw.startsWith("+++") || raw.startsWith("---")) continue; // cabeçalhos
    if (raw.startsWith("+")) out.push(raw.slice(1));
    else if (
      !raw.startsWith("-") &&
      !raw.startsWith(" ") &&
      !raw.startsWith("@")
    ) {
      out.push(raw); // sem marcador de diff — analisa como está
    }
  }
  return out.join("\n");
}

/** Contagem de classes de caractere (lower/upper/digit/symbol). */
function charClasses(token) {
  let classes = 0;
  if (/[a-z]/.test(token)) classes += 1;
  if (/[A-Z]/.test(token)) classes += 1;
  if (/[0-9]/.test(token)) classes += 1;
  if (/[^A-Za-z0-9]/.test(token)) classes += 1;
  return classes;
}

/**
 * Arquivos que legitimamente contêm strings com cara de secret:
 *   - `scripts/__tests__/`        → fixtures de teste (casos positivos);
 *   - `scripts/scan-secrets-bifrost.mjs` → o próprio detector (strings de padrão).
 * O conteúdo desses arquivos é ignorado na análise do diff — mesma allowlist
 * do `.gitleaks.toml` na raiz. Evita o auto-bloqueio do hook ao commitar o
 * detector e seus testes (prática padrão de allowlist, revisada pelo Themis).
 */
export const ALLOWED_FIXTURE_PATHS = [
  /(^|\/)scripts\/__tests__\//,
  /(^|\/)scripts\/scan-secrets-bifrost\.mjs$/,
];

/**
 * Remove do diff os trechos (hunks) pertencentes a arquivos allowlisted.
 * Linhas sem marcador `diff --git` (snippets soltos, entradas de teste diretas)
 * passam intactas — a filtragem só age sobre diffs reais com cabeçalhos.
 */
export function filterAllowedFiles(diffText) {
  const lines = String(diffText).split("\n");
  const out = [];
  let inAllowedFile = false;
  for (const raw of lines) {
    const hdr = /^diff --git a\/(.*?) b\//.exec(raw);
    if (hdr) {
      inAllowedFile = ALLOWED_FIXTURE_PATHS.some((re) => re.test(hdr[1]));
    }
    if (!inAllowedFile) out.push(raw);
  }
  return out.join("\n");
}

/**
 * Busca prefixos de API keys conhecidos exigindo que o token apareça em
 * contexto de valor (logo após `'`, `"`, `` ` `` ou `=`) e, para sk-/rk-,
 * com entropia mínima (dígito + maiúscula + minúscula).
 * Retorna `{ token, label } | null`.
 */
function findKnownKeyPrefix(text) {
  const rules = [
    { re: /ghp_[A-Za-z0-9]{8,}/, label: "ghp_ (GitHub)" },
    { re: /gho_[A-Za-z0-9]{8,}/, label: "gho_ (GitHub)" },
    { re: /github_pat_[A-Za-z0-9_]{20,}/, label: "github_pat_ (GitHub PAT)" },
    { re: /xox[bap]-[A-Za-z0-9\-]{8,}/, label: "xox*- (Slack)" },
    { re: /AKIA[0-9A-Z]{16}/, label: "AKIA (AWS)" },
    { re: /AIza[0-9A-Za-z_\-]{15,}/, label: "AIza (Google)" },
    { re: /(?:sk|rk)-[A-Za-z0-9_\-]{12,}/, label: "sk-/rk- (API key)" },
  ];
  for (const rule of rules) {
    const globalRe = new RegExp(
      rule.re.source,
      rule.re.flags.includes("g") ? rule.re.flags : `${rule.re.flags}g`,
    );
    for (const match of text.matchAll(globalRe)) {
      const before = text.slice(Math.max(0, match.index - 1), match.index);
      const inValueContext =
        before === "'" || before === '"' || before === "`" || before === "=";
      if (!inValueContext) continue;
      if (rule.label.startsWith("sk-")) {
        const body = match[0].replace(/^(?:sk|rk)-/, "");
        if (!/[0-9]/.test(body) || !/[a-z]/.test(body) || !/[A-Z]/.test(body)) {
          continue; // entropia insuficiente — não parece chave real
        }
      }
      return { token: match[0], label: rule.label };
    }
  }
  return null;
}

/**
 * Heurísticas determinísticas e conservadoras.
 * Retorna `{ secret: boolean, reason: string | null }`.
 */
export function analyzeDiffForSecrets(diffText) {
  const text = addedLines(diffText);
  if (!text.trim()) return { secret: false, reason: null };

  // 1) Prefixos de API keys conhecidos em contexto de valor.
  //    Só sinaliza quando precedidos por aspa (valor literal) ou `=`
  //    (atribuição / .env) — nunca em nomes de variável ou JSX
  //    (`key={item.id}` não é valor literal). Para sk-/rk- exige entropia
  //    (dígito + maiúscula + minúscula) para não disparar em palavras como
  //    "task-planning".
  const prefixMatch = findKnownKeyPrefix(text);
  if (prefixMatch) {
    const shown = prefixMatch.token.slice(0, 24);
    return {
      secret: true,
      reason: `API key detectada com prefixo reconhecido (${prefixMatch.label}): \`${shown}…\``,
    };
  }

  // 2) Bearer token longo (JWT etc.) após `Bearer ` (case-insensitive).
  const bearerRe = /Bearer\s+([A-Za-z0-9._\-]{40,})/i;
  const bearerMatch = bearerRe.exec(text);
  if (bearerMatch) {
    return {
      secret: true,
      reason: `Bearer token longo detectado (${bearerMatch[1].length} chars) — possível JWT/credencial`,
    };
  }

  // 3) Bloco de chave privada PEM — análise linha a linha para ignorar
  //    comentários (`//`, `#`, `*`, `<!--`) que apenas mencionam o marcador.
  //    O padrão é montado por concatenação para o próprio detector não se
  //    auto-flag quando este arquivo for analisado no diff staged.
  const pemKeyMarker = "PRIVATE KEY" + "-----";
  const pemRe = new RegExp(
    `-----BEGIN [A-Z0-9 ]*${pemKeyMarker}|${pemKeyMarker}`,
    "i",
  );
  const isCommentLine = (line) => /^\s*(\/\/|#|\*|<!--)/.test(line);
  for (const line of text.split("\n")) {
    if (isCommentLine(line)) continue;
    if (pemRe.test(line)) {
      return {
        secret: true,
        reason: "bloco de chave privada PEM (PRIVATE KEY) detectado",
      };
    }
  }

  // 4) URL com credenciais embutidas (user:pass@host) — ex.: DATABASE_URL.
  const urlCredRe = /[A-Za-z][A-Za-z0-9+.-]*:\/\/[^/\s'"]+:[^/\s'"]+@/;
  const urlMatch = urlCredRe.exec(text);
  if (urlMatch) {
    const scheme = urlMatch[0].split("://")[0];
    return {
      secret: true,
      reason: `URL com credenciais embutidas (user:pass@) detectada em conexão \`${scheme}://…\``,
    };
  }

  // 5) Nomes sensíveis com valor literal (quoted) de 12+ chars contendo
  //    char incomum — evita falso positivo em `token: string`,
  //    `const token = getToken()`, `API_KEY = env.API_KEY`, i18n dotted
  //    (`token: "auth.session.label"`) e passwords curtas (`"user-pass"`).
  const sensitiveRe =
    /(?<!["'`A-Za-z0-9_])(API_?KEY|API_?SECRET|ACCESS_?KEY|ACCESS_?TOKEN|CLIENT_?SECRET|SECRET_?KEY|PRIVATE_?KEY|AUTH_?TOKEN|REFRESH_?TOKEN|SESSION_?TOKEN|PASSWORD|PASSWD|SECRET|TOKEN)\s*[:=]\s*["'`]([^"'`]{12,})["'`]/i;
  const sensMatch = sensitiveRe.exec(text);
  if (sensMatch) {
    const value = sensMatch[2];
    // i18n: `app.secret.title` / `auth.session.label` — caminho dotted.
    const isDottedI18n = /^[a-z0-9_-]+(\.[a-z0-9_-]+){2,}$/i.test(value);
    // char incomum = fora de [A-Za-z0-9._-] → `user-pass` (só hífen) não conta.
    const hasUnusualChar = /[^A-Za-z0-9._-]/.test(value);
    if (!isDottedI18n && hasUnusualChar) {
      return {
        secret: true,
        reason: `valor literal longo atribuído a nome sensível \`${sensMatch[1]}\``,
      };
    }
  }

  // 6) Alta entropia: token de 24+ chars com lower+upper+dígito, em posição
  //    de atribuição (quoted após `=`). Requer as 3 classes → UUIDs hex e
  //    ids alfanuméricos não disparam. Não sinaliza:
  //      - chaves benignas (`id`, `url`, `name`, ...) → `id="aBc123…Mno"`;
  //      - valores com `/` (URLs) → `url="https://CDN.example.com/…"`;
  //      - valores dotted-i18n → `app.secret.title`.
  const BENIGN_VALUE_KEYS =
    /^(id|key|name|slug|url|uri|href|src|class|title|label|icon|variant|size|color|type|role|path|route|state|data|ref|testid|test-id|aria-label|alt)$/i;
  const isDottedI18nValue = (v) => /^[a-z0-9_-]+(\.[a-z0-9_-]+){2,}$/i.test(v);

  const quotedEntropyRe =
    /(?:^|[^\w])([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["'`]([A-Za-z0-9!@#$%^&*_\-+/=?{}:;.,~|]{24,})["'`]/;
  const qMatch = quotedEntropyRe.exec(text);
  if (qMatch) {
    const key = qMatch[1];
    const value = qMatch[2];
    const looksLikeSecret =
      !BENIGN_VALUE_KEYS.test(key) &&
      !/[/\s]/.test(value) &&
      !isDottedI18nValue(value) &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value);
    if (looksLikeSecret) {
      return {
        secret: true,
        reason: `valor de alta entropia (${value.length} chars, mixed-case) atribuído a \`${key}\` — possível secret`,
      };
    }
  }

  const envLineRe = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^\s#"']+)/;
  for (const line of text.split("\n")) {
    const envMatch = envLineRe.exec(line.trim());
    if (!envMatch) continue;
    const key = envMatch[1];
    const value = envMatch[2];
    if (
      !BENIGN_VALUE_KEYS.test(key) &&
      !/[/\s]/.test(value) &&
      !isDottedI18nValue(value) &&
      value.length >= 24 &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      charClasses(value) >= 3
    ) {
      return {
        secret: true,
        reason: `linha estilo .env com valor de alta entropia (${value.length} chars)`,
      };
    }
  }

  return { secret: false, reason: null };
}

/**
 * Trunca um diff grande preservando o começo e o fim (onde estão as mudanças
 * mais recentes), com aviso explícito no meio.
 */
export function truncateDiff(diffText, maxChars = MAX_LLM_DIFF_CHARS) {
  const text = String(diffText);
  if (text.length <= maxChars) return text;
  const half = Math.floor((maxChars - 30) / 2);
  const marker = "\n... [truncado — diff enviado parcialmente ao LLM] ...\n";
  return `${text.slice(0, half)}${marker}${text.slice(-half)}`;
}

/**
 * Camada IA via Bifrost. Fail-open em erro de API/rede (retorna ERROR —
 * o chamador decide se bloqueia). AbortController com timeout de 45s.
 */
export async function detectExposureWithLLM(diffText, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(BIFROST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: BIFROST_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a security auditor reviewing a git diff for leaked secrets or credential exposure. " +
              "Respond with exactly one line: PASS if the diff contains no secret or exposure, or FAIL: <reason> if it does. " +
              "Be precise and conservative — do not flag example values, test fixtures, or placeholder text.",
          },
          {
            role: "user",
            content: `Review this git diff for secrets or credential exposure:\n\n${diffText}`,
          },
        ],
        temperature: 0.0,
        max_tokens: 200,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        decision: "ERROR",
        reason: `API respondeu HTTP ${response.status}`,
      };
    }
    const data = await response.json();
    const content = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (/^FAIL/i.test(content)) {
      const reason = content.replace(/^FAIL:?\s*/i, "").trim();
      return {
        decision: "FAIL",
        reason: reason || "exposição detectada pela IA",
      };
    }
    if (/^PASS/i.test(content)) return { decision: "PASS", reason: content };
    return {
      decision: "ERROR",
      reason: `resposta inesperada do modelo: ${content.slice(0, 120) || "(vazia)"}`,
    };
  } catch (error) {
    const reason =
      error?.name === "AbortError"
        ? "timeout após 45s"
        : String(error?.message ?? error);
    return { decision: "ERROR", reason };
  } finally {
    clearTimeout(timeout);
  }
}

/** `git diff --cached` sem cor, ou null se falhar. */
function stagedDiff() {
  const result = spawnSync("git", ["diff", "--cached", "--no-color"], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    return null;
  }
  return result.stdout;
}

/** `git config --get <key>`, retornando "" se ausente. */
function gitConfig(key) {
  const result = spawnSync("git", ["config", "--get", key], {
    encoding: "utf8",
  });
  if (result.error || result.status !== 0) return "";
  return result.stdout.trim();
}

/** Função principal do hook — retorna o exit code. */
export async function main() {
  if (process.env.SKIP_BIFROST_EXPOSURE === "1") {
    console.log(
      "  ⏭️  scan-secrets: verificação de exposição pulada (SKIP_BIFROST_EXPOSURE=1)",
    );
    return 0;
  }

  console.log("🤖 Verificando exposição de secrets no diff staged...");

  const diff = stagedDiff();
  if (diff === null) {
    console.warn(
      "  ⚠️  scan-secrets: falha ao obter `git diff --cached` — pulando verificação (fail-open)",
    );
    return 0;
  }
  if (!diff.trim()) {
    console.log("  ✅ scan-secrets: nenhuma alteração staged para analisar");
    return 0;
  }

  // Remove hunks de arquivos allowlisted (fixtures de teste + o próprio
  // detector) antes de analisar — o detector não pode se auto-bloquear nem
  // bloquear os testes que o exercitam.
  const scanDiff = filterAllowedFiles(diff);

  // Camada 1 — determinística, bloqueia na hora.
  const local = analyzeDiffForSecrets(scanDiff);
  if (local.secret) {
    console.error("❌ Secret detectado no diff staged — commit bloqueado:");
    console.error(`   ${local.reason}`);
    return 1;
  }

  // Chave Bifrost: env var > git config. Sem chave → fail-open (igual commit-msg).
  const apiKey = process.env.BF_VIRTUAL_KEY || gitConfig("bifrost.api-key");
  if (!apiKey) {
    console.warn(
      "  ⏭️  Verificação IA de exposição pulada (sem chave Bifrost). Sete BF_VIRTUAL_KEY ou:",
    );
    console.warn("     git config --add bifrost.api-key 'sua-chave'");
    return 0;
  }

  // Camada 2 — IA, com payload truncado para caber no contexto do modelo
  // (também filtrado pelos arquivos allowlisted).
  const payload = truncateDiff(scanDiff, MAX_LLM_DIFF_CHARS);
  if (payload !== scanDiff) {
    console.warn(
      `  ⚠️  Diff grande (${scanDiff.length} chars) — enviando trecho de ${payload.length} chars ao LLM`,
    );
  }

  const ai = await detectExposureWithLLM(payload, apiKey);
  if (ai.decision === "FAIL") {
    console.error("❌ IA de segurança detectou exposição — commit bloqueado:");
    console.error(`   ${ai.reason}`);
    return 1;
  }
  if (ai.decision === "ERROR") {
    console.warn(
      `  ⚠️  Erro na verificação IA (${ai.reason}) — prosseguindo sem aprovação IA (fail-open)`,
    );
    return 0;
  }
  console.log("  ✅ Verificação IA de exposição: PASS");
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`)
  main().then((code) => {
    process.exitCode = code;
  });
