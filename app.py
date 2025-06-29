from flask import Flask, render_template, request, jsonify
import json
from collections import deque

app = Flask(__name__)

class TreeNode:
    def __init__(self, node_id, data=None):
        self.id = node_id
        self.data = data
        self.children = []
        self.parent = None
    
    def add_child(self, child):
        child.parent = self
        self.children.append(child)

class DecisionTree:
    def __init__(self):
        self.root = None
        self.nodes = {}
    
    def create_tree(self, tree_data):
        """Crear árbol desde datos del formulario"""
        try:
            if not tree_data or 'root' not in tree_data:
                return False, "No se proporcionó nodo raíz"
            
            root_id = tree_data['root']
            self.root = TreeNode(root_id, tree_data.get('root_data', ''))
            self.nodes[root_id] = self.root
            
            # Procesar conexiones padre-hijo
            connections = tree_data.get('connections', [])
            for conn in connections:
                parent_id = conn['parent']
                child_id = conn['child']
                child_data = conn.get('data', '')
                
                if parent_id not in self.nodes:
                    return False, f"Nodo padre '{parent_id}' no existe"
                
                if child_id in self.nodes:
                    return False, f"Nodo '{child_id}' ya existe (ciclo detectado)"
                
                child_node = TreeNode(child_id, child_data)
                self.nodes[child_id] = child_node
                self.nodes[parent_id].add_child(child_node)
            
            return True, "Árbol creado exitosamente"
        
        except Exception as e:
            return False, f"Error al crear árbol: {str(e)}"
    
    def to_vis_format(self):
        """Convertir árbol a formato vis.js"""
        nodes = []
        edges = []
        
        for node_id, node in self.nodes.items():
            label = f"{node_id}"
            if node.data:
                label += f"\n{node.data}"
            
            nodes.append({
                'id': node_id,
                'label': label,
                'color': {'background': '#e1f5fe' if node == self.root else '#f3e5f5'}
            })
            
            for child in node.children:
                edges.append({
                    'from': node_id,
                    'to': child.id,
                    'arrows': 'to'
                })
        
        return {'nodes': nodes, 'edges': edges}
    
    def depth_first_search(self, target):
        """Búsqueda por profundidad"""
        if not self.root:
            return [], "Árbol vacío"
        
        visited = []
        stack = [self.root]
        
        while stack:
            current = stack.pop()
            visited.append(current.id)
            
            if current.id == target:
                return visited, f"Nodo '{target}' encontrado"
            
            # Agregar hijos en orden inverso para mantener orden izquierda-derecha
            for child in reversed(current.children):
                stack.append(child)
        
        return visited, f"Nodo '{target}' no encontrado"
    
    def breadth_first_search(self, target):
        """Búsqueda por amplitud"""
        if not self.root:
            return [], "Árbol vacío"
        
        visited = []
        queue = deque([self.root])
        
        while queue:
            current = queue.popleft()
            visited.append(current.id)
            
            if current.id == target:
                return visited, f"Nodo '{target}' encontrado"
            
            for child in current.children:
                queue.append(child)
        
        return visited, f"Nodo '{target}' no encontrado"

# Instancia global del árbol
decision_tree = DecisionTree()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create_tree', methods=['POST'])
def create_tree():
    try:
        data = request.json
        success, message = decision_tree.create_tree(data)
        
        if success:
            tree_vis = decision_tree.to_vis_format()
            return jsonify({
                'success': True,
                'message': message,
                'tree': tree_vis
            })
        else:
            return jsonify({
                'success': False,
                'message': message
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error del servidor: {str(e)}"
        })

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        algorithm = data.get('algorithm')
        target = data.get('target')
        
        if algorithm == 'dfs':
            path, message = decision_tree.depth_first_search(target)
        elif algorithm == 'bfs':
            path, message = decision_tree.breadth_first_search(target)
        else:
            return jsonify({
                'success': False,
                'message': 'Algoritmo no válido'
            })
        
        return jsonify({
            'success': True,
            'path': path,
            'message': message
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error en búsqueda: {str(e)}"
        })

if __name__ == '__main__':
    app.run(debug=True)
