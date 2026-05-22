# Scout Profiles Lab

App web para explorar perfiles tacticos de jugadoras a partir del CSV final del analisis de clustering.

## Estructura

- `server.py`: backend local y logica estadistica principal.
- `api/index.py`: adaptador FastAPI para desplegar la API en Vercel.
- `web/index.html`: estructura de la interfaz.
- `web/styles.css`: estilos visuales.
- `web/app.js`: interaccion del front end y llamadas a la API.
- `data/perfiles_finales.csv`: dataset principal de jugadoras.
- `data/jugadoras_hibridas_fa_pam.csv`: datos auxiliares de perfiles hibridos/atipicos.
- `vercel.json`: configuracion de rutas para Vercel.

## Ejecutar en local

```powershell
pip install -r requirements.txt
python server.py
```

Despues abre:

```text
http://localhost:8081
```

La version local usa `server.py`, que sirve el front end y las rutas `/api`.

## Desplegar en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel, crea un proyecto nuevo e importa ese repositorio.
3. Usa la configuracion por defecto. El archivo `vercel.json` ya redirige:
   - `/api/...` a `api/index.py`
   - `/` y los archivos estaticos a la carpeta `web/`
4. Vercel instalara las dependencias de `requirements.txt` y publicara la app.

## Funcionalidades

- Busqueda de jugadoras por nombre, seleccion/equipo y posicion.
- Ficha individual con radar, cluster interpretado, medoide y jugadoras similares.
- Creacion de perfiles personalizados mediante metricas y pesos.
- Comparativa entre jugadoras de la misma posicion.
- Detector de hibridez: mide cuanto combina una jugadora dos rasgos tacticos elegidos.
- Glosario y ayudas contextuales en las metricas.

## Datos

El CSV principal debe estar en:

```text
data/perfiles_finales.csv
```

Debe incluir, como minimo:

- nombre de jugadora
- equipo o seleccion
- posicion/grupo de clustering
- cluster final
- metricas numericas usadas en los radares, perfiles y comparativas

## Nota

La app no recalcula el clustering. Parte de los resultados ya exportados desde el notebook y los convierte en una herramienta interactiva para interpretar perfiles, comparar jugadoras y crear busquedas de scouting.
