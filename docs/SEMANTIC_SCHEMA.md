# Semantic schema

Schema version: `DRIFTPROOF_SEMANTIC_V1`

The only accepted model output is:

```json
{
  "obligation_changed": false,
  "permission_changed": false,
  "prohibition_changed": false,
  "scope_changed": false,
  "deadline_changed": false,
  "economic_term_changed": false,
  "exception_changed": false,
  "evidence_sufficient": true
}
```

All eight values must be JSON booleans. The key set is exact. The encoded output is bounded to 512 UTF-8 bytes. Protected dimensions are selected at guard creation from the first seven keys; `evidence_sufficient` is always decisive.

## Deterministic derivation

```text
if evidence_sufficient == false:
    INCONCLUSIVE
else if any selected protected dimension == true:
    MATERIAL_CHANGE
else:
    NO_MATERIAL_CHANGE
```

Technical retrieval/model failures are recorded separately as `SOURCE_UNAVAILABLE`, `EVIDENCE_MISMATCH`, or `INCONCLUSIVE` and never pass through this business derivation as `NO_MATERIAL_CHANGE`.

## Consensus result schema

The eight booleans are only the semantic component of an assessment. The
independently reproduced result also binds the guard ID, frozen baseline SHA-256,
semantic schema version, top-level generation, technical status, and the complete
evidence envelope. The evidence source URL, effective URL, UTF-8 content, SHA-256,
exact byte length, and nested generation must all be mutually consistent. The
observation timestamp is bounded provenance metadata and is intentionally excluded
from the stable identity because validator wall clocks are not deterministic.
