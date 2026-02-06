# id047 — Ajouter un suivi de la taille de `server/data/scores.json` (log simple)

- **ID :** id047
- **Priorité :** P1
- **Taille :** S
- **Dépendances :** id012 (score repository — mutex + écriture atomique, ✅ fait), id016 (logs serveur exploitables, ✅ fait)

---

## Role

Tu es un développeur back-end TypeScript expérimenté, spécialisé dans l'observabilité applicative et la maintenance opérationnelle de services mono-instance. Tu maîtrises Bun 1.3.5, Express, et les patterns de logging structuré JSON sur stdout/stderr.

---

## Objectif

Ajouter un mécanisme de suivi de la taille du fichier `scores.json` via des logs structurés, afin de permettre une surveillance manuelle de la croissance des données en production (MVP mono-instance, pas de métriques/alerting automatisé).

Le log doit être émis :

- **au démarrage du serveur** (taille initiale),
- **périodiquement** (intervalle raisonnable, ex : toutes les heures) pour suivre l'évolution sans overhead.

L'objectif est purement opérationnel : rendre la taille visible dans les logs stdout/stderr pour qu'un opérateur puisse détecter une croissance anormale et agir manuellement (compaction, archivage — cf. id053 post-MVP).

---

## Format de sortie

### Fichiers à créer ou modifier

1. **Créer** (ou intégrer dans un fichier existant) un module/fonction de monitoring de la taille du fichier scores dans `project/server/src/` (par ex. `project/server/src/storage/scores-size-monitor.ts` ou directement dans `score-repository.ts` si plus cohérent).

2. **Modifier** `project/server/src/index.ts` (ou `app.ts`) pour :
   - Déclencher le log de taille au démarrage.
   - Mettre en place un intervalle périodique (ex : `setInterval`).
   - Nettoyer le timer au shutdown (`SIGINT`/`SIGTERM`).

3. **Créer** un fichier de test `project/server/src/storage/scores-size-monitor.test.ts` (ou intégrer les tests dans un fichier existant) pour valider le comportement.

4. **Mettre à jour** `TODO.md` : cocher `id047` une fois tous les critères remplis.

---

## Contraintes

### Fonctionnelles

- Le log de taille doit utiliser le logger structuré JSON existant (`project/server/src/logger.ts` — `createLogger` / `Logger`).
- Le log doit contenir au minimum :
  - `event` : identifiant structuré (ex : `scores.file_size`),
  - `sizeBytes` : taille en octets (number),
  - `sizeHuman` : taille lisible (ex : `"1.2 MB"`),
  - `scoresPath` : chemin du fichier,
  - `component` : `score-repository` ou similaire.
- Niveau de log : `info`.
- Si le fichier n'existe pas encore au moment du check (cas premier démarrage avant la première écriture), logger un `warn` indiquant l'absence du fichier (pas une erreur bloquante).
- Si `fs.stat` échoue pour une autre raison (permissions, I/O), logger un `warn` avec les détails de l'erreur (via `serializeError`), sans crasher le serveur.

### Techniques

- **Runtime :** Bun 1.3.5, TypeScript.
- **Pas de dépendance externe** pour cette fonctionnalité (uniquement `node:fs/promises` et le logger existant).
- L'intervalle périodique doit être configurable via une constante exportée (ex : `SCORES_SIZE_CHECK_INTERVAL_MS`, valeur par défaut : `3_600_000` soit 1h). Ne pas utiliser de variable d'environnement pour le MVP.
- Le timer doit être nettoyé proprement au shutdown pour éviter que le process ne reste suspendu.
- Ne pas introduire de `setInterval` qui empêcherait le process de s'arrêter : utiliser `unref()` sur le timer ou le nettoyer explicitement dans le handler de shutdown.
- Ne pas lire le contenu du fichier : utiliser `fs.stat()` pour obtenir la taille sans overhead I/O.

### Style

- Fichiers en `kebab-case`.
- Fonctions en `camelCase`.
- Fonctions courtes, testables, pures quand possible.
- Exporter la fonction de formatage de taille pour la tester indépendamment.

---

## Contexte technique

### Logger existant

Le logger du projet (`project/server/src/logger.ts`) :

- Expose `createLogger(options?)` qui retourne un objet `Logger` avec `debug`, `info`, `warn`, `error`, `child`.
- Chaque log est un objet JSON écrit sur stdout (info/debug) ou stderr (warn/error).
- Champs structurés : `ts`, `level`, `msg`, et champs libres additionnels.
- `serializeError(err)` est disponible pour sérialiser les erreurs.

### Score Repository existant

Le module `project/server/src/storage/score-repository.ts` :

- Expose `createScoreRepository(options?)` qui retourne `{ readAll, append, getFilePath }`.
- `getFilePath()` retourne le chemin absolu de `scores.json`.
- Le chemin par défaut est `process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data')` + `/scores.json`.
- Le repository utilise déjà un logger child avec `{ component: 'score-repository', scoresPath }`.

### Point d'entrée serveur

`project/server/src/index.ts` :

- Crée un logger racine `createLogger({ baseFields: { component: 'server' } })`.
- Crée l'app via `createApp({ logger })`.
- Écoute sur `host:port`.
- Gère le shutdown graceful via `SIGINT`/`SIGTERM`.

### App Express

`project/server/src/app.ts` :

- `createApp({ logger })` retourne l'app Express configurée.
- Le score repository est créé dans `createApp` (ou dans les routes).

### Docs sources

- `docs/10-exploitation-et-maintenance.md` → section "4.1 Signaux à surveiller" : mentionne explicitement "Taille du fichier `scores.json` (croissance continue)" comme signal à surveiller.
- `docs/10-exploitation-et-maintenance.md` → section "6.1 Croissance des données" : risque MVP identifié, mitigation post-MVP (id053).

---

## Étapes proposées

1. **Créer une fonction `formatFileSize(bytes: number): string`** — convertit des octets en chaîne lisible (B, KB, MB, GB). Fonction pure, facilement testable.

2. **Créer une fonction `checkScoresFileSize(scoresPath: string, logger: Logger): Promise<void>`** — effectue `fs.stat()`, log la taille. Gère le cas fichier inexistant (warn) et les erreurs I/O (warn sans crash).

3. **Créer une fonction `startScoresSizeMonitor(options: { scoresPath: string; logger: Logger; intervalMs?: number }): { stop: () => void }`** — appelle `checkScoresFileSize` immédiatement (au démarrage), puis met en place un `setInterval`. Retourne un objet avec une méthode `stop()` pour le nettoyage. Appeler `timer.unref()` pour ne pas bloquer le shutdown.

4. **Intégrer dans `index.ts`** — après le démarrage du serveur, démarrer le monitor. Appeler `stop()` dans le handler de shutdown.

5. **Écrire les tests** :
   - `formatFileSize` : 0 B, < 1 KB, KB, MB, GB.
   - `checkScoresFileSize` : fichier existant → log info avec taille, fichier inexistant → log warn, erreur stat → log warn.
   - `startScoresSizeMonitor` : vérifie qu'un log est émis immédiatement au démarrage. Vérifie que `stop()` nettoie le timer.

6. **Vérifier** : `bun test`, `bun run typecheck`, `bun run lint`.

7. **Cocher** `id047` dans `TODO.md`.

---

## Cas limites

- **Fichier inexistant** (premier démarrage, avant tout `POST /api/scores`) : ne pas crasher, logger un warn.
- **Erreur de permissions** sur `fs.stat()` : ne pas crasher, logger un warn avec détails.
- **Fichier vide** (0 octets) : logger normalement avec `sizeBytes: 0`.
- **Très gros fichier** (ex : 100 MB+) : le log doit afficher la taille correctement (pas de troncature int32).
- **Shutdown avant le premier tick du timer** : `stop()` doit fonctionner même si le timer n'a pas encore tiré.
- **Concurrence avec les écritures** : `fs.stat()` ne prend pas de lock, ce qui est acceptable (on lit une approximation de la taille, pas la valeur exacte au byte près).

---

## Critères de validation

- [ ] Un log structuré JSON de niveau `info` contenant `event: "scores.file_size"`, `sizeBytes`, `sizeHuman`, `scoresPath` est émis au démarrage du serveur.
- [ ] Un log identique est émis périodiquement (intervalle configurable, défaut 1h).
- [ ] Si le fichier `scores.json` n'existe pas, un log `warn` est émis à la place (pas de crash).
- [ ] Si `fs.stat()` échoue (I/O), un log `warn` est émis avec les détails de l'erreur (pas de crash).
- [ ] La fonction `formatFileSize` est exportée et testée (0 B, KB, MB, GB).
- [ ] Le timer est nettoyé au shutdown (`SIGINT`/`SIGTERM`) ou utilise `unref()`.
- [ ] `bun test` passe (tous les tests existants + nouveaux).
- [ ] `bun run typecheck` passe sans erreur.
- [ ] `bun run lint` passe sans erreur.
- [ ] La case `id047` dans `TODO.md` est cochée `- [x]`.

---

## Clôture

Cocher la case `- [ ]` → `- [x]` de la tâche `id047` dans `TODO.md` **uniquement si** tous les critères de validation ci-dessus sont satisfaits. Ne cocher aucune autre tâche.
