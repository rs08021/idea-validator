# Idea Validator — Guía de despliegue

## ¿Qué necesitás?
- Cuenta en GitHub (gratis): https://github.com
- Cuenta en Vercel (gratis): https://vercel.com
- Cuenta en Anthropic (para la API key): https://console.anthropic.com
- Node.js instalado en tu compu: https://nodejs.org

---

## PASO 1: Instalar Node.js
1. Ir a https://nodejs.org
2. Descargar la versión LTS
3. Instalar normalmente
4. Verificar: abrir terminal y escribir `node --version`

---

## PASO 2: Probar la app en tu compu
1. Abrir la carpeta del proyecto en terminal
2. Ejecutar: `npm install`
3. Ejecutar: `npm run dev`
4. Abrir en el navegador: http://localhost:5173

---

## PASO 3: Subir a GitHub
1. Crear cuenta en https://github.com (si no tenés)
2. Crear nuevo repositorio → llamarlo "idea-validator"
3. Seguir las instrucciones de GitHub para subir el código:
```
git init
git add .
git commit -m "primera version"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/idea-validator.git
git push -u origin main
```

---

## PASO 4: Desplegar en Vercel
1. Ir a https://vercel.com
2. Crear cuenta con tu GitHub
3. Click "New Project"
4. Importar tu repositorio "idea-validator"
5. Click "Deploy" (Vercel detecta Vite automáticamente)
6. En 2 minutos tenés tu URL: https://idea-validator-xyz.vercel.app

---

## PASO 5: Agregar tu API Key de Anthropic
1. Ir a https://console.anthropic.com
2. Crear una API key
3. En Vercel → tu proyecto → Settings → Environment Variables
4. Agregar: `VITE_ANTHROPIC_KEY` = tu_api_key

> ⚠️ IMPORTANTE: La API key actual en el código es para desarrollo.
> Para producción, usar variables de entorno en Vercel.

---

## PASO 6: Instalarlo en tu celular como app
### Android:
1. Abrir la URL en Chrome
2. Menú (3 puntos) → "Agregar a pantalla de inicio"
3. ¡Listo! Aparece como ícono en tu celular

### iPhone:
1. Abrir la URL en Safari
2. Botón compartir → "Agregar a pantalla de inicio"
3. ¡Listo!

---

## ¿Preguntas?
Contactar al desarrollador que configuró este proyecto.
