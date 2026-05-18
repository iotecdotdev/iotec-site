# Restaurar iotec GEX en el sitio público

**Fecha de retirada:** 2026-05-18.

**Motivo:** clarificación legal del uso de datos de Charles Schwab vía su
Developer API para redistribución comercial a subscribers. iotec Core no
queda afectado (procesa data local del cliente).

Esta guía documenta exactamente qué se removió del sitio, para revertir
limpiamente cuando esté resuelto el modelo de datos (migración a Polygon.io,
Tradier, OPRA license directa, o modelo "cliente trae su propia key").

## Estado de la infraestructura de GEX (preservada)

Nada de lo siguiente se borró, solo se ocultó del sitio público:

- **Backend gex2-api** en VPS (`~/proyectos/gex2-trade`): sigue corriendo.
  Si quieres apagarlo mientras tanto: `docker compose -f ~/proyectos/gex2-trade/docker-compose.yml stop`.
- **DNS** `gex.iotec.dev`: sigue activo via CF Tunnel.
- **iotecGEX.dll**: sigue compilando, ofuscado y registrado en license server.
  Indicador `iotecGEXV2.cs` en `D:\Documentos\NinjaTrader 8\bin\Custom\Indicators\iotec\`
  sigue funcional contra `gex.iotec.dev` (con tu license activa).
- **Licencias iotecGEX**: tus 2 licenses (`091e9d64...` oscar, `b3ad6e28...`
  test) en `licenses.json` siguen activas.
- **LS product `iotecGEX`** (variant_id `1664950`): sigue configurado como
  subscription mensual $49 + 7d trial en LS. NO publicado externamente
  todavía (LS approval pendiente).
- **Webhook handlers** para `subscription_*` events: sigue en `app.py` del
  license server.
- **Sync gex2_sync.py**: sigue activo (license server ↔ gex2-api).
- **Repos en GitHub**: `iotecGEX` y `gex2.trade` sin cambios.
- **Tests pytest** del subscription flow: 13 tests siguen verde.

## Qué se removió del sitio iotec.dev

### `public/index.html` (EN)

- [ ] Product card de "iotec GEX" en sección `#products` (entre Core y el FAQ).
- [ ] Pricing card de "iotec GEX" en sección `#pricing` (deja solo Core).
- [ ] Actualizar headline de pricing: "One-time tools. Subscription services."
      → "Simple, one-time. Pay once, own forever."
- [ ] Foot text de pricing: quitar la mención al modelo dual.
- [ ] FAQ entries (3) específicos de iotec GEX:
  - "Why is iotec GEX a subscription instead of one-time?"
  - "What happens if I cancel iotec GEX?"
  - "How does the 7-day free trial work?"
- [ ] FAQ entry mixta "What if the indicator doesn't work for me?":
      revertir a la versión solo-Core.
- [ ] FAQ entry "How do I get updates?": revertir a versión solo-Core.
- [ ] Footer Products: quitar `<a>iotec GEX</a>`.
- [ ] Hero/meta description: quitar mención a gamma exposure.

### `public/es/index.html` (ES)

Mismos cambios, traducidos.

### `public/refunds.html` + `public/es/refunds.html`

- [ ] Quitar sección "iotec GEX — 7-day free trial + 7-day refund".
- [ ] Revertir intro a versión solo-Core: "If iotec Core does not work for
      you within 14 days..."
- [ ] Quitar línea "Process (both products)" → "Process".
- [ ] Quitar bullet "iotec GEX subscription periods past the first paid month".

### `public/support.html` + `public/es/support.html`

- [ ] Quitar sección completa "Subscription management (iotec GEX only)".
- [ ] Quitar referencia a iotec GEX en "What's covered" (línea
      "Subscription / billing questions for iotec GEX...").
- [ ] Quitar "iotec GEX: 7-day free trial + 7-day refund window" del
      bloque "Refunds" (solo dejar Core).

### `public/changelog.html` + `public/es/changelog.html`

- [ ] Quitar toda la sección `<h2>iotec GEX</h2>` y sus `<h3>` versions.

### `public/assets/pricing.js`

- [ ] Sin cambios (es genérico, pero solo `iotecCore` se renderiza ahora
      porque no hay placeholders `data-iotec-price="iotecGEX.*"`).

### Footer (todas las páginas)

- [ ] Quitar `<a>iotec GEX</a>` del bloque "Products" en TODAS las páginas:
      index, refunds, terms, privacy, disclaimer, support, changelog (EN+ES).

## Cómo restaurar

**Opción rápida — git revert del commit "iotec.dev: hide iotec GEX
(pending data licensing decision)":**

```bash
cd D:\Desarrollo\iotec-site
git log --oneline  # encontrar el SHA del commit de retirada
git revert <SHA>
git push
ssh oscar@vps "cd ~/proyectos/iotec-site && git pull"
```

**Opción cuidadosa — re-aplicar manualmente:**

Cada uno de los puntos del checklist arriba tiene su contrapartida en el
commit. Usa `git show <SHA>` para ver el diff y aplicarlo en reversa.

## Decisión pendiente antes de re-publicar

Antes de mostrar iotec GEX otra vez al público, resolver el modelo de
datos:

1. **Polygon.io** ($199-2000/mes según plan, vendor licenciado, permite
   redistribución de derived data).
2. **Tradier** ($10-50/mes, licenciado).
3. **dxFeed** ($500-2000/mes, premium).
4. **OPRA directa** ($1500-5000/mes base + per-user, solo viable con
   100+ subscribers).
5. **"Bring your own Schwab API key"**: cada cliente conecta con sus
   propias credenciales; el indicador es solo la lógica GEX. Más barato
   pero el mercado es estrecho (necesita cuenta Schwab + acceso opciones).

Cuando decidas, los cambios técnicos son:
- Si cambias provider: editar `gex2-trade/schwab_client_prod.py` (renombrar
  o crear `polygon_client.py`) + ajustar endpoints en `app.py`.
- Si vas "bring your own": mover la lógica de fetch al cliente NT8 (puede
  ser polémico al obfuscar credenciales del cliente — habría que diseñar).

## Quick checklist de re-launch tras decisión

- [ ] Backend gex2-api migrado al nuevo provider (test smoke con un símbolo).
- [ ] License server logs limpios (sin errores).
- [ ] Indicador NT8 carga sin issues con la data nueva.
- [ ] Site público re-incluye iotec GEX (revert commit).
- [ ] LS product iotecGEX verificado (precio, trial, callbacks).
- [ ] CHANGELOG menciona la migración como nota técnica visible.
- [ ] Email a tu lista (si la tienes) anunciando re-launch.

---

Hasta entonces, **iotec Core sigue público y vendible sin problema legal**.
