# Runbook incidents (MVP)

Ce runbook vise à diagnostiquer et résoudre rapidement les incidents les plus probables en production.

Contexte (rappel) :

- Déploiement : VPS Debian (OVH), **mono-instance**.
- HTTPS : terminaison sur le host via **Nginx + Certbot** pour `space-invader.jlg-consulting.com`.
- App : conteneur Docker Compose `app` (Express sous Bun) exposé en local sur `127.0.0.1:9999`.
- Persistance : bind mount `./server/data` (host) → `/app/server/data` (conteneur).

Référence topologie et commandes de déploiement : [project/docs/deploy.md](deploy.md).

---

## 0) Pré-requis / accès

Sur le VPS :

- Avoir une session SSH.
- Se placer dans le dossier Compose :

```bash
cd "$HOME/space-invader/project"
```

Commandes utiles (socle) :

```bash
# État des services
docker compose ps

# Logs applicatifs (stdout/stderr)
docker compose logs --tail=300 app

# Test upstream local (bypass Nginx)
curl -I http://127.0.0.1:9999/
curl -i http://127.0.0.1:9999/api

# Test public HTTPS (via Nginx)
curl -I https://space-invader.jlg-consulting.com/
curl -i https://space-invader.jlg-consulting.com/api/leaderboard/day
```

Note : les logs sont en JSON (une ligne par événement) et incluent des champs `level`, `component`, `event`.
Exemples d’`event` fréquents :

- `http.validation_error` (400)
- `http.payload_too_large` (413)
- `http.invalid_json` (400)
- `http.internal_error` (500)
- `scores.io_error` (lecture/écriture fichier)
- `scores.parse_error` (JSON des scores invalide)

Filtrage rapide des erreurs :

```bash
docker compose logs --tail=1000 app | grep '"level":"error"' || true
```

---

## 1) Incident — Site down / ne répond plus

### Symptômes

- Le navigateur affiche un timeout / “site unreachable”.
- `curl` vers le domaine échoue (DNS/TLS/connexion).

### Vérifier

1. Depuis une machine extérieure (ou depuis le VPS si tu veux un signal brut) :

```bash
curl -I http://space-invader.jlg-consulting.com/
curl -I https://space-invader.jlg-consulting.com/
```

2. Sur le VPS : vérifier Nginx (HTTPS)

```bash
sudo systemctl status nginx --no-pager
sudo nginx -t
sudo journalctl -u nginx --no-pager -n 200
sudo ss -lntp | egrep ':80 |:443 ' || true
```

3. Sur le VPS : vérifier l’upstream applicatif (bypass Nginx)

```bash
curl -I http://127.0.0.1:9999/
curl -i http://127.0.0.1:9999/api

cd "$HOME/space-invader/project"
docker compose ps
```

4. Sur le VPS : vérifier les logs de l’app (crash loop / erreurs fatales)

```bash
docker compose logs --tail=300 app
```

5. Sur le VPS : vérifier Certbot / certificat

```bash
sudo certbot certificates || true
sudo certbot renew --dry-run || true
```

6. (Si suspect réseau) vérifier UFW

```bash
sudo ufw status verbose || true
```

### Actions

- Si le conteneur `app` est arrêté / redémarre en boucle :

```bash
cd "$HOME/space-invader/project"
docker compose logs --tail=300 app

docker compose up -d --build

docker compose ps
```

- Si l’upstream `127.0.0.1:9999` répond mais le domaine HTTPS non :
  - Redémarrer Nginx après validation config :

```bash
sudo nginx -t
sudo systemctl restart nginx
```

- Si le certificat est expiré / cassé :
  - D’abord re-tester le renouvellement, puis relancer Certbot (attention : nécessite TCP:80 joignable).

```bash
sudo certbot renew --dry-run
# En dernier recours (interactif) :
# sudo certbot --nginx -d space-invader.jlg-consulting.com
```

### Escalade / notes

- Si `docker compose logs` montre des `http.internal_error` répétés sans cause évidente, suspecter un problème de données (`scores.json`), de disque, ou une régression ; voir l’incident “POST /api/scores en erreur”.

---

## 2) Incident — `POST /api/scores` en erreur

### Symptômes

- L’UI indique que l’enregistrement a échoué.
- Le endpoint renvoie `500` (ou plus rarement `400`).

### Vérifier

1. Reproduire l’appel (depuis le VPS pour éviter les effets DNS/TLS)

```bash
# Attendu : HTTP/1.1 201
curl -i http://127.0.0.1:9999/api/scores \
  -H 'content-type: application/json' \
  -d '{"pseudo":"Test","score":123}'
```

Interprétation :

- `201` → OK (incident côté client / réseau).
- `400` → input invalide. La réponse contient typiquement `{"error":{"code":"VALIDATION_ERROR",...}}`.
- `413` → payload trop gros.
- `500` → incident serveur (I/O fichier, JSON corrompu, disque plein, etc.).

2. Inspecter les logs (chercher `http.internal_error`, `scores.io_error`, `scores.parse_error`)

```bash
cd "$HOME/space-invader/project"
docker compose logs --tail=500 app

docker compose logs --tail=1000 app | egrep 'http\.internal_error|scores\.io_error|scores\.parse_error' || true
```

3. Vérifier la persistance et les permissions (host)

```bash
cd "$HOME/space-invader/project"
ls -la server/data
ls -la server/data/scores.json* || true
```

4. Vérifier la persistance côté conteneur

```bash
cd "$HOME/space-invader/project"
docker compose exec app ls -la /app/server/data
```

5. Vérifier l’espace disque

```bash
df -h
cd "$HOME/space-invader/project"
docker compose exec app df -h
```

6. Vérifier la validité JSON de `scores.json`

```bash
cd "$HOME/space-invader/project"
# Si python3 est disponible (souvent présent sur Debian)
python3 -m json.tool server/data/scores.json > /dev/null
```

Alternative si pas de Python :

```bash
cd "$HOME/space-invader/project"
cat server/data/scores.json | head -n 5
```

7. Cas particulier : présence de `scores.json.tmp`

- Le serveur écrit d’abord `scores.json.tmp`, puis renomme en `scores.json`.
- Un `.tmp` persistant peut indiquer un arrêt au mauvais moment.

```bash
cd "$HOME/space-invader/project"
ls -la server/data/scores.json.tmp || true
```

### Actions

- Si disque plein : libérer de l’espace (logs, images Docker, etc.), puis redémarrer.

```bash
cd "$HOME/space-invader/project"
docker compose restart app
```

- Si permissions incorrectes sur le bind mount : corriger l’ownership/permissions du dossier data.

```bash
cd "$HOME/space-invader/project"
# Exemple (adapter user/group selon ton VPS)
sudo chown -R $USER:$USER server/data
sudo chmod 0750 server/data
```

- Si `scores.json` est invalide (`scores.parse_error`) :
  1. Sauvegarder **avant toute action**
  2. Restaurer un JSON valide (idéalement depuis `scores.json.tmp` si celui-ci est valide)

```bash
cd "$HOME/space-invader/project"
cp -a server/data/scores.json "server/data/scores.json.bak.$(date +%Y%m%d-%H%M%S)" || true
cp -a server/data/scores.json.tmp "server/data/scores.json.tmp.bak.$(date +%Y%m%d-%H%M%S)" || true

# Si le .tmp est valide et le .json non valide :
python3 -m json.tool server/data/scores.json.tmp > /dev/null
mv -f server/data/scores.json.tmp server/data/scores.json
```

- Si aucun fichier valide n’est récupérable :
  - Remise à zéro (perte de scores) — acceptable MVP, mais à documenter comme incident “données perdues”.

```bash
cd "$HOME/space-invader/project"
cp -a server/data/scores.json "server/data/scores.json.bak.$(date +%Y%m%d-%H%M%S)" || true
printf '{\n  "version": 1,\n  "scores": []\n}\n' > server/data/scores.json
```

Puis redémarrer :

```bash
cd "$HOME/space-invader/project"
docker compose restart app
```

---

## 3) Incident — Classement vide “alors qu’il y a des scores”

### Symptômes

- `GET /api/leaderboard/day` renvoie `entries: []`.
- Un opérateur constate que `server/data/scores.json` contient des scores.

### Vérifier

1. Vérifier ce que renvoie l’API (dayKey de référence)

```bash
curl -i https://space-invader.jlg-consulting.com/api/leaderboard/day
```

2. Comprendre la règle (important)

- Le leaderboard est **top 10 du jour** basé sur **Europe/Paris**.
- Après minuit (Europe/Paris), le leaderboard peut être vide même si des scores existent (ils appartiennent au jour précédent).

3. Vérifier si le fichier contient des scores pour le `dayKeyParis` courant

```bash
cd "$HOME/space-invader/project"
python3 - <<'PY'
import json
from collections import Counter
p = 'server/data/scores.json'
with open(p, 'r', encoding='utf-8') as f:
    data = json.load(f)

scores = data.get('scores', [])
print('version:', data.get('version'))
print('count:', len(scores))

c = Counter(s.get('dayKeyParis') for s in scores if isinstance(s, dict))
print('dayKeyParis counts (top 10):')
for k, v in c.most_common(10):
    print(f'  {k}: {v}')
PY
```

4. Vérifier l’horloge système du VPS (NTP)

Même si le calcul “jour Paris” est explicite, une horloge VPS très décalée peut rendre le `dayKeyParis` incohérent avec la réalité.

```bash
timedatectl
# Selon Debian :
# timedatectl timesync-status
```

5. Vérifier que les données viennent bien du bind mount attendu

```bash
cd "$HOME/space-invader/project"
ls -la server/data

docker compose exec app ls -la /app/server/data
```

### Actions

- Si le leaderboard est vide car on est passé à un nouveau jour (Europe/Paris) :
  - Aucune action technique requise (comportement attendu MVP).

- Si l’horloge VPS est incorrecte :
  - Réactiver/corriger la synchro NTP (selon configuration VPS) puis redémarrer le service app.

```bash
cd "$HOME/space-invader/project"
docker compose restart app
```

- Si le dossier monté n’est pas celui attendu (bind mount cassé / mauvais répertoire de lancement) :
  - Vérifier que tu exécutes Compose depuis `.../project`.
  - Vérifier le mapping dans `project/docker-compose.yml` et la présence du bind mount `./server/data:/app/server/data`.

---

## 4) Annexes — commandes de référence

### Nginx / Certbot

```bash
sudo systemctl status nginx --no-pager
sudo nginx -t
sudo systemctl reload nginx
sudo journalctl -u nginx --no-pager -n 200

sudo certbot certificates || true
sudo certbot renew --dry-run || true
```

### Docker Compose

```bash
cd "$HOME/space-invader/project"

docker compose ps

docker compose logs --tail=300 app

docker compose up -d --build

docker compose restart app
```
