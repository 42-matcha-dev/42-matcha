
gestionnaire de paquet:
    - kazuma: macOS - brew
    - Etienne: Linux - apt

version fixe: v20.19.0

typescript (a configurer dans backend egalement)
express js (en backend)
next js et react js (frontend)

npm install cors


# Installer typescript backend
dans backend (cd backend)
npm install -D typescript tsx @types/node
npx tsc --init

# Etape 1: Créer le dossier frontend avec Next.js
command: npx create-next-app@latest frontend
pour les options demander:
    TypeScript : oui (recommandé pour un projet propre)
    App Router : oui (plus moderne que Pages Router)
    Tailwind : oui ou non, selon tes préférences UI
    ESLint : oui
    src/ directory : oui
    Import alias : @/

# Etape 2: Installer et initialiser Express dans le projet racine
mkdir backend
cd backend
npm init -y
npm install express

# Etape 3: Lancer les deux serveurs

Tu as maintenant deux serveurs :
- frontend/ (Next.js - React)
- backend/ (Express - API)

Ouvre deux terminaux :

➤ Terminal 1 (Frontend - Next.js)
- cd frontend
- npm run dev

Cela lance Next.js sur http://localhost:3000

➤ Terminal 2 (Backend - Express)
- cd backend
- node server.js

Cela lance Express sur http://localhost:5000