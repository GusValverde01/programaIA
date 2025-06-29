let network = null;
let currentTree = null;

document.addEventListener('DOMContentLoaded', function() {
    // Manejar envío del formulario
    document.getElementById('treeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createTree();
    });
    
    // Permitir búsqueda con Enter
    document.getElementById('searchTarget').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch('dfs');
        }
    });
});

function addConnection() {
    const connectionsDiv = document.getElementById('connections');
    const newConnection = document.createElement('div');
    newConnection.className = 'connection';
    newConnection.innerHTML = `
        <input type="text" placeholder="Padre" class="parent">
        <span>→</span>
        <input type="text" placeholder="Hijo" class="child">
        <input type="text" placeholder="Datos (opcional)" class="data">
        <button type="button" onclick="removeConnection(this)">×</button>
    `;
    connectionsDiv.appendChild(newConnection);
}

function removeConnection(button) {
    const connections = document.querySelectorAll('.connection');
    if (connections.length > 1) {
        button.parentElement.remove();
    }
}

function createTree() {
    const rootNode = document.getElementById('rootNode').value.trim();
    const rootData = document.getElementById('rootData').value.trim();
    
    if (!rootNode) {
        showMessage('Por favor ingrese un nodo raíz', 'error');
        return;
    }
    
    // Validar que el nodo raíz sea alfanumérico
    if (!/^[a-zA-Z0-9]+$/.test(rootNode)) {
        showMessage('El nodo raíz debe contener solo letras y números', 'error');
        return;
    }
    
    const connections = [];
    const connectionElements = document.querySelectorAll('.connection');
    
    for (let conn of connectionElements) {
        const parent = conn.querySelector('.parent').value.trim();
        const child = conn.querySelector('.child').value.trim();
        const data = conn.querySelector('.data').value.trim();
        
        if (parent && child) {
            // Validar que los nodos sean alfanuméricos
            if (!/^[a-zA-Z0-9]+$/.test(parent) || !/^[a-zA-Z0-9]+$/.test(child)) {
                showMessage('Los identificadores de nodos deben contener solo letras y números', 'error');
                return;
            }
            
            connections.push({
                parent: parent,
                child: child,
                data: data
            });
        }
    }
    
    const treeData = {
        root: rootNode,
        root_data: rootData,
        connections: connections
    };
    
    fetch('/create_tree', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(treeData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            visualizeTree(data.tree);
            currentTree = data.tree;
        } else {
            showMessage(data.message, 'error');
            clearVisualization();
        }
    })
    .catch(error => {
        showMessage('Error de conexión: ' + error.message, 'error');
        clearVisualization();
    });
}

function visualizeTree(treeData) {
    const container = document.getElementById('treeVisualization');
    
    const options = {
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed',
                shakeTowards: 'leaves'
            }
        },
        edges: {
            arrows: {
                to: { enabled: true, scaleFactor: 1.2 }
            },
            color: '#2c3e50',
            width: 2
        },
        nodes: {
            shape: 'box',
            margin: 10,
            font: {
                size: 16,
                color: '#2c3e50'
            },
            borderWidth: 2,
            borderWidthSelected: 3
        },
        physics: {
            enabled: false
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true
        }
    };
    
    network = new vis.Network(container, treeData, options);
    
    // Evento para resaltar nodos
    network.on("selectNode", function(params) {
        const nodeId = params.nodes[0];
        if (nodeId) {
            document.getElementById('searchTarget').value = nodeId;
        }
    });
}

function clearVisualization() {
    const container = document.getElementById('treeVisualization');
    container.innerHTML = '';
    network = null;
    currentTree = null;
}

function performSearch(algorithm) {
    const target = document.getElementById('searchTarget').value.trim();
    
    if (!target) {
        showSearchResult('Por favor ingrese un nodo a buscar', null, 'error');
        return;
    }
    
    if (!currentTree) {
        showSearchResult('Primero debe generar un árbol', null, 'error');
        return;
    }
    
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            algorithm: algorithm,
            target: target
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const algorithmName = algorithm === 'dfs' ? 'Búsqueda por Profundidad (DFS)' : 'Búsqueda por Amplitud (BFS)';
            showSearchResult(algorithmName, data.path, 'success', data.message);
            highlightSearchPath(data.path);
        } else {
            showSearchResult('Error en búsqueda', null, 'error', data.message);
        }
    })
    .catch(error => {
        showSearchResult('Error de conexión', null, 'error', error.message);
    });
}

function highlightSearchPath(path) {
    if (!network || !path || path.length === 0) return;
    
    // Crear nueva estructura de datos con nodos resaltados
    const nodes = currentTree.nodes.map(node => {
        const isInPath = path.includes(node.id);
        return {
            ...node,
            color: {
                background: isInPath ? '#ffeb3b' : (node.color ? node.color.background : '#f3e5f5'),
                border: isInPath ? '#ff9800' : '#666'
            },
            borderWidth: isInPath ? 3 : 2
        };
    });
    
    const updatedData = {
        nodes: nodes,
        edges: currentTree.edges
    };
    
    network.setData(updatedData);
}

function showSearchResult(title, path, type, message = '') {
    const resultsDiv = document.getElementById('searchResults');
    
    let pathHtml = '';
    if (path && path.length > 0) {
        pathHtml = `
            <div class="search-path">
                Camino recorrido: ${path.join(' → ')}
            </div>
            <p><strong>Nodos visitados:</strong> ${path.length}</p>
        `;
    }
    
    resultsDiv.innerHTML = `
        <div class="search-result">
            <h4>${title}</h4>
            ${pathHtml}
            ${message ? `<p><em>${message}</em></p>` : ''}
        </div>
    `;
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('treeMessage');
    messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
    
    // Auto-hide después de 5 segundos
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}
