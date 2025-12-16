LV Mecánica - Web PWA generador de boletas (sin base de datos)
=============================================================

Qué contiene:
- index.html   -> Interfaz PWA y lógica cliente
- styles.css   -> Estilos
- app.js       -> Lógica para añadir productos, calcular importes y generar PDF (jsPDF + autotable via CDN)
- manifest.json -> PWA manifest
- service-worker.js -> Caché básico para PWA
- icon-192.png, icon-512.png -> íconos de ejemplo (simples)

Características:
- Funciona en PC y Android (navegadores modernos).
- No requiere servidor PHP ni base de datos.
- Genera PDF en el cliente (descarga directa).
- PWA instalable en Android como "app" (usar https o servir desde localhost).

Cómo usar en PC (modo desarrollo / local):
1. Descomprime el ZIP.
2. Lo más simple: abrir una terminal en la carpeta y ejecutar un servidor estático.
   - Con Python 3: `python -m http.server 8000`
   - Con Node: `npx serve` o usar Live Server de VS Code.
3. Abrir en el navegador: http://localhost:8000
4. Añade cliente, productos y haz clic en "Generar boleta (PDF)". Se descargará el PDF.

Cómo instalar en Android (PWA):
- Sirve la carpeta en un dominio https o en localhost.
- Abre la página en Chrome en Android.
- El navegador te sugerirá "Agregar a pantalla de inicio" o en el menú 'Agregar a pantalla de inicio'.
- La app se instalará y podrá abrirse como aplicación nativa.

Notas:
- La generación de PDF usa jsPDF y jsPDF-AutoTable mediante CDN. Necesitas conexión a internet la primera vez.
- Si quieres que funcione completamente offline (sin CDN), puedo añadir las librerías jsPDF localmente en el ZIP.
- Si quieres personalizar el diseño exacto del dibujo que subiste (círculo grande, colores, tipografía), lo adapto.

Si quieres, ahora:
1) Te incluyo las librerías jsPDF localmente para funcionamiento 100% offline.
2) O te hago una versión con numeración automática de boletas (sin base de datos, usando localStorage).
3) O hago ajuste visual exacto a tu dibujo.

Dime cuál quieres y lo agrego.
