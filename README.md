# iotec-site

Landing pública de iotec en `https://iotec.dev`. Estática (HTML + CSS), servida
por Caddy en el VPS junto a `iotecLicense`.

## Layout

```
public/
├── index.html
└── assets/
    ├── style.css
    ├── logo.svg
    └── screenshots/
```

## Deploy

El VPS clona este repo en `~/proyectos/iotec-site/`. Caddy sirve los archivos
estáticos en `iotec.dev` (apex).

Actualizar contenido:
```bash
# Editar local, commit, push
# Luego en VPS:
ssh Contabo-Nuevo-Oscar "cd ~/proyectos/iotec-site && git pull"
```

Caddy sirve desde disco, no requiere reinicio.
