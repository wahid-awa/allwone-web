# ALLWONE · Animated Logo Portal

Minimalist web experience featuring the animated vector emblem of **ALLWONE** (Média · Radio · Label · Communauté).

## Features
- **Interactive Moving Logo**: Organic floating 3D perspective tracking cursor motion.
- **Chain Reaction (*Chaîne Design*)**: Hovering any of the 6 spectrum squares triggers a domino ripple wave across adjacent squares with spring physics.
- **Light Beam & Knot Glow**: Dynamic energy ray descending into the central Arabic *Waw* (و) braids, illuminating them in the corresponding neon hue.
- **Harmonic Audio Synth**: Built-in Web Audio API synthesizer triggering pentatonic ambient tones for each color.
- **Zero bloat**: Pure, minimal landing experience.

## Tech Stack
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment & Tunneling
Complete deployment guides and scripts to host this site on a private home server (without exposing your IP) are included in the [`deploy/`](./deploy/) directory:
- [Cloudflare Tunnel Guide (Zero Port, Hidden IP)](./deploy/CLOUDFLARE_TUNNEL_GUIDE.md)
- [VPS Reverse Proxy Guide (FRP / SSH Tunnel)](./deploy/VPS_REVERSE_PROXY_GUIDE.md)
- [Docker Compose & Nginx Configuration](./deploy/docker-compose.yml)
- [1-Click PowerShell Deployment Script](./deploy/deploy.ps1)
- [1-Click Bash Deployment Script](./deploy/deploy.sh)
