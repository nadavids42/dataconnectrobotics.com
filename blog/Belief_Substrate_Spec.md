# Belief-State Substrate MVP Spec

## 1. Purpose

Build a persistent belief substrate (an explicit internal world model) that:

- Stores structured beliefs  
- Updates them incrementally from graded evidence  
- Decays toward priors when not reinforced  
- Resolves mutually exclusive contradictions via competition  
- Retrieves belief neighborhoods to constrain downstream reasoning/generation  

The system is designed to promote cross-session coherence through explicit epistemic state.

---

## 2. MVP Success Criteria

The MVP is successful if the system satisfies all of the following:

- **Persistence**: Beliefs survive process restarts (SQLite store working).
- **Structured beliefs**: Claims are stored as  
  `(subject, relation, object/value)`  
  plus confidence, timestamps, status, and provenance links.
- **Evidence ingestion**: Accept evidence as  
  `(candidate belief + support s ∈ [-1,1] + reliability ρ ∈ [0,1] + source)`.
- **Belief dynamics**: Update rule, decay, and exclusivity normalization are implemented for flagged relations.
- **Contradiction surfacing**: The system can report conflicts when more than one high-confidence belief exists in an exclusivity group.
- **Neighborhood retrieval**: Given an entity, return top-K beliefs ranked by confidence and recency (0-hop + optional 1-hop expansion).
- **Toy demo**: A scripted environment demonstrates:
  - Belief formation
  - Contradiction
  - Reinforcement-driven stabilization
  - Decay behavior
  - Metrics (accuracy vs ground truth + contradiction rate)

---

## 3. Core Concepts

### 3.1 Entity

Represents a persistent node in the belief graph.

**Fields:**
- `entity_id` (uuid/int)
- `canonical_name` (string)
- `type` (enum: person | organization | project | place | artifact | concept)
- `aliases` (optional; separate table or JSON list)
- `created_at`
- `updated_at`

**MVP Entity Types:**
- person
- organization
- project
- place
- artifact
- concept

**Design Notes:**
- Entity types are informational only (not behavior-defining).
- Relation semantics determine exclusivity behavior.
- Additional types may be added in v2 without schema redesign.

---

### 3.2 Belief (Claim)

A belief is a structured claim:

$$
(subject, relation, object)
$$

plus associated metadata.

**Fields:**
- `belief_id`
- `subject_entity_id` (FK → entities)
- `relation_id` (FK → relations)
- `object_entity_id` (FK → entities, nullable)
- `object_value` (nullable; literal string/number/bool stored as text for MVP)
- `confidence w ∈ [0,1]`
- `created_at`
- `updated_at`
- `last_seen_at` (optional)
- `status` (active | superseded | rejected)
- `exclusivity_key` (nullable; used only when relation.is_exclusive = true)

**Constraints:**
- Exactly one of (`object_entity_id`, `object_value`) must be non-null.
- If `relation.is_exclusive = true`:

$$
exclusivity\\_key = \text{hash}(subject\\_entity\\_id + relation\\_id)
$$

otherwise `null`.

**Belief Status Semantics:**
- `active`: part of the belief state (with varying confidence)
- `superseded`: replaced by a newer belief (kept for history/provenance)
- `rejected`: explicitly disconfirmed

**Developing Beliefs (MVP Interpretation)**  
There is no separate “developing” status. Development is represented by confidence bands:

- emerging: \( w < 0.65 \)
- committed: \( w \ge 0.65 \)
- disfavored: \( w \le 0.35 \)

(Thresholds tunable.)

---

### 3.3 Evidence

Evidence represents a graded support signal for a candidate belief.

**Fields:**
- `evidence_id`
- `belief_fingerprint` (subject, relation, object)
- `support s ∈ [-1,1]`
  - positive = supports
  - negative = contradicts
- `reliability ρ ∈ [0,1]`
- `source_id`
- `observed_at`
- `notes` (optional)

**Mapping to target confidence:**

$$
\hat{w} = \frac{1 + s}{2}
$$

---

### 3.4 Relation

Relations are first-class objects stored in a `relations` table.

**Fields:**
- `relation_id`
- `name` (unique; e.g., "works_for_current", "capital_of")
- `is_exclusive` (bool; default false)
- `default_prior_mu` (nullable; reserved for v2)
- `notes` (optional)

---

### Priors (μ)

- MVP uses a single global prior: \( \mu = 0.5 \)
- Relation-level priors are reserved for v2 via `relations.default_prior_mu`.

---

## 4. Dynamics (Update Engine)

### Parameters (MVP Defaults)

- Learning rate: \( \alpha = 0.3 \)
- Decay rate per conversation turn: \( \lambda = 0.002 \)
- Global prior: \( \mu = 0.5 \)
- Exclusivity epsilon: \( \varepsilon = 1 \times 10^{-6} \)

**Turn Definition:**  
A “turn” = one user–assistant interaction (conversation turn).

---

### 4.1 Update Rule (Smoothing)

Given current confidence \( w \) and target \( \hat{w} \):

$$
\eta = \alpha \cdot \rho
$$

$$
w_{\text{new}} = (1 - \eta) w + \eta \hat{w}
$$

This ensures:
- Smooth belief evolution
- Resistance to single noisy updates
- Convergence under repeated consistent evidence

---

### 4.2 Decay

Beliefs decay toward the global prior \( \mu \):

$$
w_{\text{decay}} = (1 - \lambda \Delta t) w_{\text{new}} + (\lambda \Delta t) \mu
$$

MVP simplification:
- \( \Delta t \) = number of conversation turns
- Decay applied discretely
- \( \lambda \) is tunable

---

### 4.3 Exclusivity (Mutual Exclusion Groups)

Beliefs compete when they share:

$$
(subject, relation)
$$

but differ in object.

Define:

$$
exclusivity\\_key = \text{hash}(subject\\_entity\\_id + relation\\_id)
$$

After updates:

\[
w_i \leftarrow \frac{w_i}{\sum_j w_j + \varepsilon}
\]

Applied only to relations flagged as exclusive (e.g., `capital_of`, `works_for_current`, `lives_in`, `born_in`).

---

### 4.4 Provenance Retention

For each belief:
- Store last \( N = 10 \) evidence links
- Enable “why do we believe this?” queries

Evidence table remains append-only.

---

## 5. MVP Relations (Initial Seed List)

### General / Structural (Non-Exclusive)
- is_a
- related_to
- part_of
- depends_on

### People / Life
- works_for_current (exclusive)
- worked_for (non-exclusive)
- role_on (non-exclusive)
- lives_in (exclusive)
- born_in (exclusive)

### Organization / Project
- owns
- offers
- located_in (optional)

### Project / Concept / Artifact
- implements
- uses
- documents

**Exclusive Relations (MVP):**
- works_for_current
- lives_in
- born_in
- capital_of (for toy-world demo)

---

## 6. Storage Choice (MVP)

SQLite as system of record.

**Tables:**
- entities
- beliefs
- relations
- sources
- evidence
- belief_evidence_link

**Indexes:**
- beliefs(subject_entity_id, relation_id)
- beliefs(exclusivity_key)
- entities(canonical_name)
- evidence(observed_at)

---

## 7. Retrieval (Belief Neighborhood)

### Ranking Formula

\[
\text{recency\_weight} = e^{-k \cdot \text{age\_in\_turns}}, \quad k = 0.05
\]

\[
\text{hop\_penalty} =
\begin{cases}
1.0 & \text{(0-hop)} \\
0.7 & \text{(1-hop)}
\end{cases}
\]

\[
\text{score} = (w^p) \cdot \text{recency\_weight} \cdot \text{hop\_penalty}
\]

with \( p = 2.0 \) (confidence emphasis).

Return:
- Top \( K = 20 \) beliefs.

---

## 8. Toy World (Validation Scenario) — Option A: Places

**Ground Truth:**
- Paris → France
- Rome → Italy
- Berlin → Germany

**Metrics (each step):**
- Belief accuracy: \( \arg\max_w(\text{capital\_of}) \) matches ground truth
- Contradiction rate:
  - ≥2 candidates with \( w \ge 0.55 \), OR
  - Within \( \Delta = 0.10 \)

---

## 9. Non-Goals (Forward-Compatible)

Excluded from MVP but architecturally supported:

- No NLP evidence extraction
- No embeddings in retrieval
- No graph database backend
- No learned update parameters
- No wall-clock-time decay
- No UI beyond CLI/testing scripts
- No agentic planning loop
- No multi-dimensional confidence
- No temporal validity intervals beyond timestamps

---

## 10. Belief Identity (MVP)

Beliefs are canonical and uniquely identified by:

\[
(subject\_entity\_id, relation\_id, object\_entity\_id/object\_value)
\]

Database constraint:

\[
\text{UNIQUE}(subject\_entity\_id, relation\_id, object\_entity\_id, object\_value)
\]

Forward-compatible with future belief instances via `belief_group_id`.

---

## 11. Open Questions / Phase 2

- Improved entity resolution
- Contradiction detection beyond exclusivity
- Relation canonicalization
- Embedding-based retrieval
- Learned reliability estimation
