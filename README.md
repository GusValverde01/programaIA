# Búsqueda No Informada - Árbol de Decisión

Programa web para crear árboles de decisión y ejecutar algoritmos de búsqueda no informada.

## Características

- **Creación de árboles**: Interfaz para definir nodos y conexiones
- **Validación**: Verificación de estructura válida y detección de ciclos
- **Visualización**: Gráfico interactivo del árbol
- **Búsqueda DFS**: Búsqueda por profundidad
- **Búsqueda BFS**: Búsqueda por amplitud
- **Identificadores**: Nodos con letras y/o números
- **Resumen**: Camino recorrido y estadísticas

## Pruebas de Funcionamiento
![image](https://github.com/user-attachments/assets/ee971ecd-12c7-4497-ac53-f5d9b03fbe7d)


## Instalación

1. Instalar Flask:
```bash
pip install Flask
```

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Ejecutar aplicación:
```bash
python app.py
```

3. Abrir navegador en: http://localhost:5000

## Uso

1. **Crear Árbol**:
   - Definir nodo raíz (ej: "A", "1", "ROOT")
   - Agregar conexiones padre → hijo
   - Generar árbol

2. **Búsqueda**:
   - Seleccionar nodo objetivo
   - Ejecutar DFS o BFS
   - Ver camino recorrido

## Validaciones

- Nodos deben ser alfanuméricos
- No se permiten ciclos
- Estructura jerárquica válida
- Nodos únicos por árbol
