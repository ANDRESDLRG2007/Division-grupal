# UniSplit

Aplicación web para organizar gastos compartidos entre compañeros de apartamento y grupos de amigos. Permite registrar cuentas, calcular saldos y decidir quién paga con una ruleta.

## Funciones

- Registrar gastos mensuales, elegir quién pagó y seleccionar quiénes participan en la división.
- Registrar gastos de salidas con contactos, categorías rápidas y una vista previa del valor por persona.
- Consultar balances y simplificar las transferencias pendientes.
- Usar la ruleta en los modos de pagador, tareas o lista personalizada, y compartir el resultado por WhatsApp.
- Elegir entre los temas Teal, Marino y Carbón desde la configuración.
- Guardar datos localmente y exportarlos o importarlos como archivos JSON.

Los montos se presentan con formato colombiano. Los datos se guardan en el almacenamiento local del navegador y no se sincronizan automáticamente entre dispositivos.

## Desarrollo local

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Para generar y verificar la compilación de producción:

```bash
npm run build
```

## Despliegue

El repositorio incluye `netlify.toml`. En Netlify, configura `npm run build` como comando de compilación y `dist` como directorio de publicación.
