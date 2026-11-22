# Méthode 2 : Tunnel via VPS Externe (FRP / WireGuard / SSH Reverse Tunnel)

Si vous possédez un petit VPS externe (ex: VPS OVH à 3€/mois, Hetzner, Scaleway ou Oracle Cloud Free Tier) qui dispose d'une adresse IP publique fixe :

Le principe consiste à faire du VPS votre **bouclier public**. Tout le trafic arrive sur l'IP publique du VPS, qui redirige le trafic de manière chiffrée vers votre serveur maison via un tunnel point à point.

---

## Architecture

```
[Visiteurs Internet] 
         │ (https://allwone.fm)
         ▼
[VPS Externe (IP Publique : 51.xx.xx.xx)] ── Nginx Public avec Certbot SSL
         │
         │ 🔒 Tunnel Chiffré (FRP / WireGuard / SSH -R)
         ▼
[Votre Box Internet (Zéro port web ouvert)]
         │
         ▼
[Votre Serveur Maison (192.168.1.x)] ── Nginx Local ALLWONE (localhost:8080)
```

---

## Option A : FRP (Fast Reverse Proxy) — Simple et Performant

FRP est conçu spécialement pour exposer des services situés derrière des NAT ou des pare-feux domestiques.

### 1. Sur le VPS (Serveur FRP : `frps`)
Téléchargez FRP :
```bash
wget https://github.com/fatedier/frp/releases/download/v0.61.0/frp_0.61.0_linux_amd64.tar.gz
tar -zxvf frp_0.61.0_linux_amd64.tar.gz
cd frp_0.61.0_linux_amd64
```

Créez le fichier de configuration `frps.toml` :
```toml
bindPort = 7000
auth.token = "votre_cle_secrete_ultra_securisee_12345"

# Port virtuel HTTP public
vhostHTTPPort = 8080
```

Lancez `frps` :
```bash
./frps -c ./frps.toml
```

### 2. Sur votre Serveur Maison (Client FRP : `frpc`)
Sur votre serveur physique chez vous, téléchargez également FRP et créez `frpc.toml` :
```toml
serverAddr = "IP_DE_VOTRE_VPS"
serverPort = 7000
auth.token = "votre_cle_secrete_ultra_securisee_12345"

[[proxies]]
name = "allwone-web"
type = "http"
localIP = "127.0.0.1"
localPort = 8080
customDomains = ["allwone.fm"]
```

Lancez le client :
```bash
./frpc -c ./frpc.toml
```

---

## Option B : Tunnel SSH Inversé avec `autossh` (Zéro installation supplémentaire)

Si vous ne voulez installer aucun logiciel supplémentaire, SSH lui-même peut relayer le trafic !

Sur votre serveur maison, installez `autossh` (qui reconnecte automatiquement la session en cas de coupure Internet) :
```bash
sudo apt install autossh
```

Créez un service systemd `/etc/systemd/system/ssh-tunnel.service` :
```ini
[Unit]
Description=SSH Reverse Tunnel to VPS
After=network.target

[Service]
User=wahid
ExecStart=/usr/bin/autossh -M 0 -N -q -o "ServerAliveInterval 30" -o "ServerAliveCountMax 3" -R 8080:localhost:8080 user@IP_DE_VOTRE_VPS -i /home/wahid/.ssh/id_rsa
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activez le service :
```bash
sudo systemctl enable --now ssh-tunnel
```

Sur le VPS, Nginx renvoie simplement les requêtes vers `127.0.0.1:8080` :
```nginx
server {
    server_name allwone.fm;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Votre IP maison est 100% protégée et invisible !
