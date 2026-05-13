# TFG Perfiladoras

App web local en Java para explorar perfiles de jugadoras.

## 1. Exportar los datos desde Colab

En el notebook, cuando decidas el metodo final, deja una celda como esta:

```python
metodo_final = resultados_pam_sinpca      # cambia por tu metodo elegido
col_cluster_final = "cluster"             # cluster, cluster_pca, cluster_hier o cluster_fa

dfs_final = []
for pos, res in metodo_final.items():
    df_pos = res["df"].copy()
    df_pos["grupo_pos_clustering"] = pos
    df_pos["cluster_final"] = df_pos[col_cluster_final]
    dfs_final.append(df_pos)

df_final = pd.concat(dfs_final, ignore_index=True)
df_final.to_csv("perfiles_finales.csv", index=False, encoding="utf-8-sig")
```

Descarga `perfiles_finales.csv` desde Colab y colocalo en:

```text
data/perfiles_finales.csv
```

## 2. Ejecutar la app

Desde esta carpeta:

```powershell
javac -encoding UTF-8 -d out src/main/java/tfg/App.java
java -cp out tfg.App
```

Abre:

```text
http://localhost:8080
```

## Que incluye

- Buscador de jugadoras por nombre o equipo.
- Perfil de cluster para una jugadora.
- Radar interactivo con percentiles de la jugadora vs media de su cluster.
- Jugadoras similares dentro de la misma posicion.
- Modo supervisado: eliges metricas y pesos, y la app calcula un score de encaje.

## Nota metodologica

Una silueta entre 0.15 y 0.25 no invalida automaticamente el TFG si los clusters tienen lectura futbolistica. En datos de rendimiento deportivo es normal que los perfiles sean continuos y se solapen. Conviene reforzar la validacion con interpretabilidad: medias por cluster, medoides, estabilidad por bootstrap, separacion visual PCA/UMAP y validacion cualitativa de jugadoras conocidas.
