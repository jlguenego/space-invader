# Role
Tu es un développeur TypeScript senior spécialisé back-end, expert Express sous Bun, avec une forte sensibilité sécurité pragmatique MVP (durcissement sans sur-scope) et tests Bun.

# Objectif
Réaliser la tâche TODO **id015 (P0) (S)** : **Ajouter protections serveur minimales (limits/headers/erreurs prod)**.

- **But :** durcir le MVP sans sur-scope.
- **Livrable :** limite payload JSON + headers de base + erreurs prod sans détails.
- **Acceptation :** payload trop gros rejeté et aucune stacktrace exposée.
- **Dépendances :** **id010** (socle Express) — doit exister.
- **Docs sources :**
  - [docs/09-cicd-et-deploiement.md](../../docs/09-cicd-et-deploiement.md) → “Sécurité & conformité (minimum)”
  - [docs/07-guidelines-developpement.md](../../docs/07-guidelines-developpement.md) → “Gestion d’erreurs”, “Back-end: Express”, “Limiter la taille des payloads”

# Format de sortie
Produire un changement minimal et testable côté serveur.

Fichiers attendus (à adapter si le code existant impose une autre structure) :
- Mettre à jour la config Express : `project/server/src/app.ts`
- Ajouter/adapter les tests : `project/server/src/app.test.ts`
- Mettre à jour `TODO.md` : cocher **uniquement** `id015` si tous les critères sont validés et les tests passent.

# Contraintes
- Ne pas changer les décisions structurantes (Bun 1.3.5, TypeScript, Express).
- Ne pas “gold-plater” : protections **minimales** seulement, compatibles avec le MVP.
- Conserver le contrat d’erreurs JSON existant : `{ ok: false, error: { code, message } }`.
- Ne jamais exposer de stacktrace au client en prod.
- Ne pas introduire de nouvelles dépendances “lourdes” sans nécessité.
  - Si tu proposes `helmet`, justifie brièvement (docs le mentionnent “si pertinent”) et garde une config simple.
- Ne pas demander de validation intermédiaire : exécuter de bout en bout (code + tests + vérifs), puis rapporter le résultat.
- Écriture inclusive interdite.

# Contexte technique
## État actuel (à vérifier dans le repo)
- `project/server/src/app.ts` :
  - `express.json({ limit: '10kb' })` déjà en place.
  - middleware d’erreurs qui :
    - mappe `AppError` en JSON,
    - gère `entity.too.large` / 413 avec `PAYLOAD_TOO_LARGE`,
    - en prod (`NODE_ENV=production`) renvoie `INTERNAL_ERROR` avec message générique.
- `project/server/src/http/errors.ts` définit les codes d’erreurs (`PAYLOAD_TOO_LARGE`, `INTERNAL_ERROR`, etc.).

## Attendus de la todo id015
Même si certains points sont déjà partiellement implémentés, id015 vise à s’assurer que :
- Les payloads JSON trop gros sont rejetés proprement (413 + JSON d’erreur cohérent).
- Les erreurs serveur en production ne divulguent aucun détail (message générique, pas de stacktrace).
- Des “headers de base” sont appliqués (minimum raisonnable pour un MVP).

# Étapes proposées
1. Faire un état des lieux rapide : confirmer ce qui est déjà couvert dans `app.ts` (limit JSON, gestion 413, masquage erreurs prod).
2. Compléter **uniquement** ce qui manque pour satisfaire id015 :
   - Si la limite JSON n’est pas conforme : ajuster `express.json({ limit: ... })`.
   - Si la réponse 413 n’est pas contractuelle : garantir `status=413` + `code=PAYLOAD_TOO_LARGE` + message stable.
   - Si le masquage d’erreur prod n’est pas total : s’assurer que `NODE_ENV=production` ne renvoie jamais `err.message` pour une erreur non-`AppError`.
   - Headers :
     - Option A (sans dépendance) : ajouter un middleware qui définit un petit set de headers défensifs.
     - Option B (avec dépendance) : ajouter `helmet` avec config minimale.
     Choisir une option et noter la justification en 1–2 lignes dans le PR report (pas besoin de doc longue).
3. Ajouter/mettre à jour les tests dans `project/server/src/app.test.ts` :
   - Test 413 : envoyer un JSON > limite et vérifier le format d’erreur.
   - Test prod : vérifier que l’erreur interne en prod renvoie un message générique.
   - Test headers : vérifier la présence des headers attendus (au moins sur `GET /api`).
4. Lancer `bun test` depuis `project/`.
5. Clôture : cocher `id015` dans `TODO.md` uniquement si tout passe.

# Cas limites / points d’attention
- Attention aux tests de “payload too large” :
  - Construire un body JSON assez grand pour dépasser la limite.
  - Garder le test robuste (ne pas dépendre d’un seuil trop proche).
- Les headers ne doivent pas casser le dev (CORS/dev-server) ni empêcher l’API de répondre.
- Conserver le même contrat d’erreur JSON sur toutes les routes, y compris erreurs de parsing JSON.

# Critères de validation
- [ ] Payload JSON trop gros → `413` et body JSON conforme : `{ ok:false, error:{ code:'PAYLOAD_TOO_LARGE', message: 'Payload too large' } }`.
- [ ] En `NODE_ENV=production`, une erreur non gérée renvoie `500` avec `message: 'Internal error'` (aucun détail, aucune stacktrace).
- [ ] Les headers “de base” sont effectivement présents sur une réponse (ex: `GET /api`).
- [ ] Tests mis à jour/ajoutés et `bun test` passe depuis `project/`.

# Clôture
- Cocher `- [ ] **id015**` → `- [x] **id015**` dans `TODO.md` **uniquement** si tous les critères de validation sont satisfaits et que `bun test` passe.
- Ne cocher aucune autre tâche.
