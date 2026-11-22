# Guide Ultime : Exposer votre Serveur Maison sans Révéler votre IP Publique

Ce guide résout exactement votre problématique : vous avez un serveur physique chez vous (sur votre réseau local privé, ex: `192.168.1.50`), accessible en SSH, et vous voulez rendre le site web **ALLWONE** accessible publiquement sur Internet **sans ouvrir de port sur votre box** et **sans exposer votre adresse IP privée ou publique**.

---

## 🌟 Méthode 1 (Recommandée) : Cloudflare Tunnel (`cloudflared`)

### Pourquoi c'est la meilleure solution ?
1. **Zéro port ouvert** sur votre box Internet (aucun NAT / redirection de port 80/443).
2. **Votre adresse IP est 100% masquée** : les internautes et les scanners voient uniquement les adresses IP d'Anycast Cloudflare.
3. **Certificat SSL / HTTPS automatique et gratuit**.
4. **Protection anti-DDoS, WAF et cache CDN mondial**.
5. **100% gratuit** (fonctionne avec n'importe quel nom de domaine géré sur Cloudflare).

```
[Visiteur Internet] 
         │ (https://allwone.fm)
         ▼
[Réseau Edge Cloudflare (WAF + SSL + DDoS Shield)]
         │
         │ 🔒 Tunnel sortant chiffré (Cloudflare Tunnel)
         ▼
[Votre Box Internet (ZÉRO port ouvert, IP cachée)]
         │
         ▼
[Votre Serveur Maison (192.168.1.x)]
         │
         ▼
[Conteneur Nginx ALLWONE (localhost:8080)]
```

---

### Étape 1 : Installer `cloudflared` sur votre serveur maison

Connectez-vous en SSH à votre serveur :
```bash
ssh user@192.168.1.50
```

Puis installez le client officiel `cloudflared` :

**Sur Debian / Ubuntu / Linux Mint :**
```bash
# Téléchargement du paquet .deb
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Installation
sudo dpkg -i cloudflared.deb
```

**Sur Raspberry Pi (ARM64) :**
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb
```

---

### Étape 2 : Connecter votre compte Cloudflare

Exécutez :
```bash
cloudflared tunnel login
```
Un lien s'affiche dans votre terminal. Ouvrez-le dans votre navigateur et sélectionnez votre nom de domaine (ex: `allwone.fm`). Le certificat `cert.pem` sera automatiquement téléchargé dans `~/.cloudflared/`.

---

### Étape 3 : Créer le tunnel sécurisé

Créez le tunnel nommé `allwone-tunnel` :
```bash
cloudflared tunnel create allwone-tunnel
```
Notez l'**ID du tunnel** (une chaîne comme `6c8f4321-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

---

### Étape 4 : Configurer le routage vers votre site local

Liez votre sous-domaine ou domaine au tunnel :
```bash
# Exemple avec allwone.fm ou sub.domaine.com
cloudflared tunnel route dns allwone-tunnel allwone.fm
```

Créez le fichier de configuration :
```bash
nano ~/.cloudflared/config.yml
```

Collez le contenu suivant (remplacez `<VOTRE_TUNNEL_ID>` par l'ID obtenu à l'étape 3) :
```yaml
tunnel: allwone-tunnel
credentials-file: /home/wahid/.cloudflared/<VOTRE_TUNNEL_ID>.json

ingress:
  # Route vers le site ALLWONE (Nginx Docker écoute sur le port 8080)
  - hostname: allwone.fm
    service: http://localhost:8080

  # Règle par défaut obligatoire
  - service: http_status:404
```

---

### Étape 5 : Démarrer le service en arrière-plan permanent

Installez `cloudflared` comme service système (pour qu'il redémarre automatiquement avec votre serveur) :
```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

Vérifiez le statut :
```bash
sudo systemctl status cloudflared
```

**C'est terminé !** Votre site web `https://allwone.fm` est désormais accessible mondialement en HTTPS sécurisé, directement servi par votre machine locale, sans que personne ne puisse connaître votre adresse IP de box internet !
