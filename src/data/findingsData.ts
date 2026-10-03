export interface Finding {
  id: string;
  title: string;
  category: "Critical Security" | "High Complexity" | "Code Smells";
  severity: "High" | "Med" | "Low";
  badgeColor: string;
  typeKey: "sql" | "ast" | "jwt" | "memory" | "secret" | "crypto";
  location: string;
  complexity: string;
  cwe: string;
  confidence: string;
  summary: string;
  analysis: string;
  originalCode: string;
  refactoredCode: string;
  rationale: string[];
  module: string;
  linesChanged: { removed: number; added: number };
}

export interface MetricSnapshot {
  defectRisk: number;
  qualityScore: number;
  maintainability: number;
  vulnerabilities: number;
  codeSmells: number;
  highSeverity: number;
}

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: "vuln-01",
    title: "Unvalidated SQL Injection Vector",
    category: "Critical Security",
    severity: "High",
    badgeColor: "rose",
    typeKey: "sql",
    location: "services/payment_gateway.py:42",
    complexity: "Cyclomatic: 7",
    cwe: "CWE-89",
    confidence: "98.4%",
    summary: "Direct string concatenation inside execute() permits malicious boolean blind and union SQL exploits.",
    analysis: "Untrusted parameter `account_id` is interpolated directly into an SQL string without parameterized query wrappers. This allows arbitrary database command execution and critical ledger exposure.",
    originalCode: `def get_account_ledger(account_id, limit=50):
    # CRITICAL: direct string formatting creates SQLi
    query = f"SELECT * FROM transactions WHERE account_id = '{account_id}' ORDER BY timestamp DESC LIMIT {limit}"
    with db_engine.connect() as conn:
        result = conn.execute(query)
        return [dict(row) for row in result]`,
    refactoredCode: `def get_account_ledger(account_id: str, limit: int = 50) -> list[dict]:
    # AI REMEDIATION: Parameterized prepared statement
    query = text(
        "SELECT * FROM transactions WHERE account_id = :acc_id ORDER BY timestamp DESC LIMIT :lim"
    )
    with db_engine.connect() as conn:
        result = conn.execute(query, {"acc_id": account_id, "lim": limit})
        return [dict(row._mapping) for row in result]`,
    rationale: [
      "Replaced Python f-string query with SQLAlchemy/Database parameterized statements (`:acc_id`).",
      "Sanitized input types via static type annotations (`str`, `int`) preventing type coercion.",
      "Closed potential remote code execution vector without disrupting downstream API response format."
    ],
    module: "Payment Gateway",
    linesChanged: { removed: 5, added: 7 }
  },
  {
    id: "comp-02",
    title: "Cyclomatic Complexity > 16 & Deep Nesting",
    category: "High Complexity",
    severity: "High",
    badgeColor: "amber",
    typeKey: "ast",
    location: "core/dispatch_engine.py:118",
    complexity: "Cyclomatic: 18",
    cwe: "CWE-1075",
    confidence: "99.1%",
    summary: "Nested cascading conditional tree exceeds maintainability bounds and causes severe cognitive load.",
    analysis: "Radon cyclomatic analysis scored this block at Grade F (Score 18). Multiple deep if-else branches hinder edge case testability and elevate regression rates.",
    originalCode: `def evaluate_rules(event, profile, queue):
    if event.is_active:
        if profile.is_verified:
            if queue.capacity > 0:
                for rule in profile.rules:
                    if rule.type == 'PRIORITY':
                        if event.priority >= 9:
                            return dispatch_urgent(event)
                        else:
                            return dispatch_normal(event)
    return False`,
    refactoredCode: `def evaluate_rules(event, profile, queue):
    # Guard clauses flatten nesting and lower cyclomatic complexity to 3
    if not (event.is_active and profile.is_verified and queue.capacity > 0):
        return False
        
    has_urgent = any(r.type == 'PRIORITY' for r in profile.rules) and event.priority >= 9
    return dispatch_urgent(event) if has_urgent else dispatch_normal(event)`,
    rationale: [
      "Implemented early exit guard clause pattern to eradicate 6-tier nested indentation.",
      "Consolidated priority logic into declarative boolean expressions reducing cyclomatic complexity from 18 to 3.",
      "Significantly improved test suite branch coverage requirement."
    ],
    module: "Dispatch Core",
    linesChanged: { removed: 10, added: 6 }
  },
  {
    id: "vuln-03",
    title: "Insecure JWT Signature Algorithm Fallback",
    category: "Critical Security",
    severity: "High",
    badgeColor: "rose",
    typeKey: "jwt",
    location: "auth/jwt_handler.py:87",
    complexity: "Security CWE-327",
    cwe: "CWE-327",
    confidence: "99.5%",
    summary: "Decoder allows fallback to algorithm 'none' and skips signature verification on malformed tokens.",
    analysis: "JWT header `alg` verification was not pinned, which enables header manipulation exploits bypassing complete user authentication.",
    originalCode: `def verify_token(raw_jwt):
    # Vulnerable: Accepts arbitrary algorithms or 'none'
    decoded = jwt.decode(raw_jwt, options={"verify_signature": False})
    return decoded`,
    refactoredCode: `def verify_token(raw_jwt: str) -> dict:
    # Strictly enforce asymmetric RS256 signature verification
    return jwt.decode(
        raw_jwt, 
        PUBLIC_KEY, 
        algorithms=["RS256"], 
        options={"require": ["exp", "iss", "aud"], "verify_signature": True}
    )`,
    rationale: [
      "Explicitly whitelisted `algorithms=['RS256']` blocking algorithm downgrades (CVE-2015-9235).",
      "Mandated cryptographic verification of expiration, audience, and issuer claims.",
      "Hardened identity assertion pipeline across all microservice entry gates."
    ],
    module: "Auth Microservice",
    linesChanged: { removed: 4, added: 8 }
  },
  {
    id: "smell-04",
    title: "Unbounded In-Memory Connection Leak",
    category: "Code Smells",
    severity: "Med",
    badgeColor: "emerald",
    typeKey: "memory",
    location: "network/redis_pool.py:34",
    complexity: "Resource Management",
    cwe: "CWE-772",
    confidence: "96.2%",
    summary: "Redis client instances instantiated per request without pool recycling or context manager.",
    analysis: "Spawning new client handles inside worker loops causes socket file descriptor exhaustion under burst concurrency.",
    originalCode: `def fetch_cache_key(key):
    client = redis.Redis(host='localhost', port=6379)
    # Socket is never explicitly returned to pool or closed
    val = client.get(key)
    return val`,
    refactoredCode: `GLOBAL_POOL = redis.ConnectionPool(host='localhost', port=6379, max_connections=50)

def fetch_cache_key(key: str) -> bytes | None:
    # Reuses global pooled connection safely
    r = redis.Redis(connection_pool=GLOBAL_POOL)
    return r.get(key)`,
    rationale: [
      "Initialized thread-safe `ConnectionPool` with bounded connection max limit of 50.",
      "Prevented microservice OOM crashes and TCP socket hanging during high throughput surges.",
      "Standardized cache access across background tasks."
    ],
    module: "Caching Network",
    linesChanged: { removed: 4, added: 6 }
  },
  {
    id: "smell-05",
    title: "Hardcoded Staging Secrets in Config",
    category: "Critical Security",
    severity: "High",
    badgeColor: "rose",
    typeKey: "secret",
    location: "config/environments.py:15",
    complexity: "Secret Leak CWE-798",
    cwe: "CWE-798",
    confidence: "99.9%",
    summary: "Default development cryptographic salt and AWS bucket keys committed to source tree.",
    analysis: "Static strings in version control will leak into production docker image layers if environment overrides fail.",
    originalCode: `SECRET_KEY = "dev_secret_pr1sm_master_token_#2024"
AWS_S3_KEY = "AKIAIOSFODNN7EXAMPLE"`,
    refactoredCode: `import os

def raise_missing_secret():
    raise RuntimeError("Critical environment secret PRISM_SECRET_KEY is required but unset.")

SECRET_KEY = os.environ.get("PRISM_SECRET_KEY") or raise_missing_secret()
AWS_S3_KEY = os.environ.get("AWS_ACCESS_KEY_ID")`,
    rationale: [
      "Extracted static string constants to strictly runtime environment variables.",
      "Added startup assertion that halts boot if critical encryption keys are unspecified."
    ],
    module: "Configuration",
    linesChanged: { removed: 2, added: 7 }
  }
];

export const DEMO_REPOSITORIES = [
  {
    name: "Flask Microservice Core",
    url: "https://github.com/prism-engine/flask-microservice-core",
    lang: "Python 3.12",
    files: 24,
    loc: "4,820",
    initialRisk: 23,
    initialQuality: 78
  },
  {
    name: "FastAPI Auth Gateway",
    url: "https://github.com/prism-engine/fastapi-auth-gateway",
    lang: "Python / Async",
    files: 38,
    loc: "8,140",
    initialRisk: 34,
    initialQuality: 72
  },
  {
    name: "Go Distributed Worker",
    url: "https://github.com/prism-engine/go-dispatch-worker",
    lang: "Go 1.22",
    files: 19,
    loc: "3,950",
    initialRisk: 18,
    initialQuality: 84
  },
  {
    name: "Express API Core",
    url: "https://github.com/prism-engine/express-api-gateway",
    lang: "Node.js / TS",
    files: 42,
    loc: "7,620",
    initialRisk: 29,
    initialQuality: 75
  }
];
