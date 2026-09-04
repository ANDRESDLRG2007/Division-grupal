# 🎓 UniSplit — Cuentas Claras, Amigos & Roomies 💸

Aplicación web progresiva (PWA / WebView First) diseñada para **estudiantes universitarios** para gestionar los gastos mensuales de apartamento compartido (roomies), salidas grupales (el parche) y tomar decisiones justas y divertidas con la **Ruleta Universitaria 🎰**.

---

## ✨ Características Principales

### 🏠 1. Gastos de Apartamento (Mensual)
- **Gestión de Roomies:** Agrega, edita y asigna avatares universitarios personalizados (`🐼`, `🦊`, `🚀`, `⚡`, etc.).
- **Atajos rápidos de gastos:** Arriendo, WiFi Fibra, Luz/Gas/Agua, Mercado Común, Aseo, etc.
- **División inteligente en tiempo real:** Selector de pagador y participantes con previsualización del monto exacto por cabeza.
- **Algoritmo de simplificación de deudas:** Calcula la menor cantidad de transferencias posibles para que todos queden en paz y salvo.

### 🍕 2. Salidas Grupales (El Parche)
- **Gestión de Amigos:** Agrega contactos de tu grupo o parche de la universidad.
- **Atajos de salidas:** Polas / Cervezas 🍻, Pizza / Hamburguesas 🍔, Uber / Taxi 🚕, Cine / Cover 🎟️, Café de estudio ☕.
- **Ranking de consumo:** Descubre quién es el más rumbero o el que más salidas acumula.

### 🎰 3. Ruleta Universitaria Interactiva
- **Modos de juego:**
  1. *¿Quién paga la cuenta? 💸* (Usa automáticamente los integrantes de la salida o del apartamento).
  2. *Ruleta de Castigos 🧽* (Lavar la loza, sacar la basura, ir por el hielo 🧊, poner la música 🎵, traer las polas 🍻, hacer café a las 6am ☕).
  3. *Ruleta Personalizada ✏️* (Escribe cualquier opción o reto).
- **Física suave & Web Audio:** Sonido dinámico de giro (*tic-tic-tic*) que desacelera con la rueda, fanfarria de ganador y lluvia de confeti 🎉.
- **Botón directo a WhatsApp:** Comparte el resultado y el meme universitario en el grupo con 1 tap.

### 📊 4. Balances, Cobro por WhatsApp y Recibo Térmico
- **Botón "Cobrar por WhatsApp":** Genera un mensaje formateado con emojis listo para enviar al deudor (Nequi, Daviplata, Bancolombia, Bizum).
- **Generador de Ticket de Paz y Salvo 🧾:** Vista de recibo estilo térmico para descargar o capturar.
- **Saldar Cuentas del Mes:** Botón seguro con confirmación para liquidar el mes y empezar en limpio.

### 💾 5. Respaldo y Persistencia
- Guarda automáticamente todo en `localStorage`.
- Exporta e importa tus datos en formato `.json` desde el botón de ajustes ⚙️.

---

## 🚀 Despliegue en Netlify

El proyecto ya incluye `netlify.toml` con configuración de SPA redirects y compresión.

### Pasos para desplegar:
1. Sube este repositorio a **GitHub**.
2. Entra a [Netlify](https://app.netlify.com/) y haz clic en **"Add new site" > "Import an existing project"**.
3. Selecciona tu repositorio de GitHub.
4. Netlify detectará automáticamente:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Haz clic en **Deploy Site** ¡y listo!

---

## 📱 Uso en WebView Móvil (Flutter / Android / iOS / Capacitor)

La interfaz está diseñada con enfoque **Mobile First**, soporte para `viewport-fit=cover`, safe-area insets (notches), respuesta háptica (`navigator.vibrate`) y efectos de sonido nativos (Web Audio API).

### URL para tu WebView:
Una vez desplegado en Netlify, simplemente carga la URL pública en tu componente WebView:

```dart
// Ejemplo en Flutter
InAppWebView(
  initialUrlRequest: URLRequest(url: WebUri("https://tu-sitio.netlify.app")),
  initialSettings: InAppWebViewSettings(
    javaScriptEnabled: true,
    useShouldOverrideUrlLoading: true,
  ),
)
```

```kotlin
// Ejemplo en Android (Kotlin)
webView.settings.javaScriptEnabled = true
webView.settings.domStorageEnabled = true // Necesario para localStorage
webView.loadUrl("https://tu-sitio.netlify.app")
```

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
