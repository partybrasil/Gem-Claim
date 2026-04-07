# Gem-Claim

Gem-Claim es una PWA frontend-only para rastrear juegos y bundles gratuitos por tiempo limitado desde GamerPower, con fallback local si la API falla por CORS o disponibilidad. Toda la persistencia se resuelve en localStorage: juegos sincronizados, keys del usuario, filtros, vista y purgas.

## Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- vite-plugin-pwa

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Características principales

- Dashboard fijo con estética cyberpunk/glassmorphism
- Vista Grid y Lista con transiciones fluidas
- Búsqueda por título, plataformas y tags enriquecidos
- Refresh con comparación incremental y badge de nuevos
- Purga de expirados respetando las keys guardadas
- Guardado y copiado de keys por giveaway
- Fallback mock cuando la API pública no responde en navegador
- Selector de cursores gamer persistente
- Temas visuales persistentes y sound FX opcionales generados con Web Audio API
- Configuración lista para GitHub Pages con `base: './'`

## GitHub Pages clásico

No necesitas GitHub Actions ni workflows para que funcione en GitHub Pages clásico. Pero GitHub Pages no ejecuta `npm run build` por ti: solo sirve archivos estáticos ya generados.

Este repo ya está adaptado para ese modelo:

- El código fuente vive en `app/`.
- `npm run build` compila primero en `dist/` y luego copia el resultado publicado a la raíz del repo.
- Así puedes elegir `main` como source branch y `/ (root)` como carpeta en GitHub Pages.

Flujo manual clásico:

1. Ejecuta `npm run build` en local.
2. Revisa que en la raíz existan `index.html`, `assets/`, `sw.js` y `manifest.webmanifest`.
3. Haz commit y push de esos artefactos en `main`.
4. En GitHub Pages selecciona la rama `main` y la carpeta `/ (root)`.

Opciones típicas sin Actions:

- Publicar desde una rama dedicada como `gh-pages`, subiendo allí únicamente el contenido compilado.
- Publicar desde `main` si el repositorio contiene el sitio estático compilado en la raíz, que es justo el esquema actual.

Conclusión práctica: workflows no son obligatorios. Solo hacen automática una tarea que en modo clásico puedes hacer manualmente sin problema.
