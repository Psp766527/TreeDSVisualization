/**
 * Tree Visualizer - SVG-based visualization engine
 */
class TreeVisualizer {
    constructor(svgElement, options = {}) {
        this.svg = svgElement;
        this.options = {
            nodeRadius: 20,
            levelHeight: 80,
            nodeSpacing: 60,
            animationDuration: 500,
            colors: {
                default: '#4A90E2',
                highlight: '#F39C12',
                selected: '#27AE60',
                traversed: '#3498DB',
                error: '#E74C3C',
                avl: {
                    balanced: '#27AE60',
                    unbalanced: '#E74C3C'
                },
                rb: {
                    red: '#E74C3C',
                    black: '#2C3E50'
                },
                heap: {
                    min: '#27AE60',
                    max: '#E74C3C'
                }
            },
            ...options
        };
        
        this.currentTree = null;
        this.animationQueue = [];
        this.isAnimating = false;
        this.highlightedNodes = new Set();
        this.selectedNodes = new Set();
        this.traversedNodes = new Set();
        this.isRendering = false;
        
        this.initializeSVG();
    }
    
    // Initialize SVG container
    initializeSVG() {
        // Clear existing content
        this.svg.innerHTML = '';
        
        // Set up SVG dimensions
        this.updateSVGDimensions();
        
        // Add styles
        this.addStyles();
        
        // Create main group
        this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.mainGroup.setAttribute('class', 'tree-main-group');
        this.svg.appendChild(this.mainGroup);
        
        // Add resize observer
        this.addResizeObserver();
    }
    
    // Update SVG dimensions
    updateSVGDimensions() {
        const rect = this.svg.getBoundingClientRect();
        const width = Math.max(400, rect.width);
        const height = Math.max(300, rect.height);
        
        // Only update if dimensions actually changed
        if (this.svg.getAttribute('width') !== width.toString() || 
            this.svg.getAttribute('height') !== height.toString()) {
            this.svg.setAttribute('width', width);
            this.svg.setAttribute('height', height);
            this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
    }
    
    // Add resize observer for responsive updates
    addResizeObserver() {
        // Temporarily disable resize observer to prevent continuous updates
        // Will only update on manual window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateSVGDimensions();
                if (this.currentTree && this.currentTree.root) {
                    this.visualize(this.currentTree, this.treeType);
                }
            }, 300); // 300ms debounce for manual resize only
        });
    }
    
    // Add CSS styles for SVG elements
    addStyles() {
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .tree-node {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .tree-node:hover {
                transform: scale(1.1);
            }
            .tree-node.highlighted {
                animation: pulse 1s infinite;
            }
            .tree-node.selected {
                stroke-width: 3px;
            }
            .tree-node.traversed {
                stroke-width: 2px;
            }
            .tree-edge {
                stroke: #34495e;
                stroke-width: 2;
                fill: none;
                transition: all 0.3s ease;
            }
            .tree-edge.highlighted {
                stroke: #F39C12;
                stroke-width: 3;
            }
            .tree-text {
                font-family: 'Segoe UI', sans-serif;
                font-size: 12px;
                font-weight: bold;
                text-anchor: middle;
                dominant-baseline: middle;
                pointer-events: none;
                fill: white;
            }
            .tree-info {
                font-family: 'Segoe UI', sans-serif;
                font-size: 10px;
                text-anchor: middle;
                dominant-baseline: middle;
                pointer-events: none;
                fill: #7f8c8d;
            }
            .tree-label {
                font-family: 'Segoe UI', sans-serif;
                font-size: 9px;
                text-anchor: middle;
                dominant-baseline: middle;
                pointer-events: none;
                fill: #95a5a6;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0); }
                to { opacity: 1; transform: scale(1); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0); }
            }
            .fade-in {
                animation: fadeIn 0.5s ease-out;
            }
            .fade-out {
                animation: fadeOut 0.5s ease-out;
            }
        `;
        this.svg.appendChild(style);
    }
    
    // Visualize a tree
    visualize(tree, treeType = 'binary-tree') {
        // Prevent multiple simultaneous renders
        if (this.isRendering) return;
        
        this.isRendering = true;
        
        try {
            this.currentTree = tree;
            this.treeType = treeType;
            
            // Clear previous visualization
            this.clearVisualization();
            
            if (!tree || !tree.root) {
                this.showEmptyTree();
                return;
            }
            
            // Get tree structure
            const treeStructure = this.getTreeStructure(tree);
            
            if (!treeStructure) {
                this.showEmptyTree();
                return;
            }
            
            // Calculate layout
            const layout = this.calculateLayout(treeStructure);
            
            // Render tree
            this.renderTree(treeStructure, layout);
            
            // Update info display
            this.updateTreeInfo(tree);
        } finally {
            this.isRendering = false;
        }
    }
    
    // Get tree structure based on type
    getTreeStructure(tree) {
        switch (this.treeType) {
            case 'heap':
            case 'min-heap':
            case 'max-heap':
                return tree.getTreeStructure();
            case 'b-tree':
                return tree.getTreeStructure();
            case 'trie':
                return tree.getTreeStructure();
            default:
                return tree.getTreeStructure();
        }
    }
    
    // Calculate node positions
    calculateLayout(treeStructure) {
        if (!treeStructure) return {};
        
        const layout = {};
        const levels = {};
        
        // First pass: calculate positions for binary trees
        if (this.isBinaryTree()) {
            this.calculateBinaryTreeLayout(treeStructure, layout, levels);
        }
        // Handle other tree types
        else if (this.treeType === 'b-tree') {
            this.calculateBTreeLayout(treeStructure, layout, levels);
        }
        else if (this.treeType === 'trie') {
            this.calculateTrieLayout(treeStructure, layout, levels);
        }
        
        return layout;
    }
    
    // Calculate layout for binary trees
    calculateBinaryTreeLayout(node, layout, levels, x = 0, y = 0, level = 0) {
        if (!node) return;
        
        // Store position
        layout[node.id] = { x, y, level };
        
        // Track levels
        if (!levels[level]) levels[level] = [];
        levels[level].push(node.id);
        
        // Calculate child positions with better spacing
        const treeHeight = this.getTreeHeight();
        const horizontalSpacing = Math.max(60, Math.pow(2, Math.max(0, treeHeight - level - 1)) * 40);
        const verticalSpacing = this.options.levelHeight;
        
        if (node.left) {
            const leftX = x - horizontalSpacing;
            this.calculateBinaryTreeLayout(node.left, layout, levels, leftX, y + verticalSpacing, level + 1);
        }
        
        if (node.right) {
            const rightX = x + horizontalSpacing;
            this.calculateBinaryTreeLayout(node.right, layout, levels, rightX, y + verticalSpacing, level + 1);
        }
    }
    
    // Calculate layout for B-tree
    calculateBTreeLayout(node, layout, levels, x = 0, y = 0, level = 0) {
        if (!node) return;
        
        const nodeWidth = node.keys.length * 15 + 20;
        layout[node.id] = { x, y, level, width: nodeWidth, keys: node.keys };
        
        if (!levels[level]) levels[level] = [];
        levels[level].push(node.id);
        
        // Calculate child positions
        const childSpacing = nodeWidth + 20;
        const startX = x - (node.children.length - 1) * childSpacing / 2;
        
        for (let i = 0; i < node.children.length; i++) {
            const childX = startX + i * childSpacing;
            this.calculateBTreeLayout(node.children[i], layout, levels, childX, y + this.options.levelHeight, level + 1);
        }
    }
    
    // Calculate layout for Trie
    calculateTrieLayout(node, layout, levels, x = 0, y = 0, level = 0) {
        if (!node) return;
        
        layout[node.id] = { x, y, level, value: node.value, isEndOfWord: node.isEndOfWord };
        
        if (!levels[level]) levels[level] = [];
        levels[level].push(node.id);
        
        // Calculate child positions
        const children = node.children || [];
        const childSpacing = 40;
        const startX = x - (children.length - 1) * childSpacing / 2;
        
        for (let i = 0; i < children.length; i++) {
            const childX = startX + i * childSpacing;
            this.calculateTrieLayout(children[i].node, layout, levels, childX, y + this.options.levelHeight, level + 1);
        }
    }
    
    // Get tree height for layout calculations
    getTreeHeight() {
        if (!this.currentTree) return 0;
        return this.currentTree.getStats().height || 0;
    }
    
    // Check if current tree is a binary tree
    isBinaryTree() {
        return ['binary-tree', 'bst', 'avl', 'red-black', 'full-binary', 'perfect-binary', 'complete-binary', 'balanced-binary'].includes(this.treeType);
    }
    
    // Render the tree
    renderTree(treeStructure, layout) {
        // Clear previous content
        this.mainGroup.innerHTML = '';
        
        // Center the layout
        this.centerLayout(layout);
        
        // Render edges first (so they appear behind nodes)
        this.renderEdges(treeStructure, layout);
        
        // Render nodes
        this.renderNodes(treeStructure, layout);
    }
    
    // Center the tree layout in the viewport
    centerLayout(layout) {
        if (!layout || Object.keys(layout).length === 0) return;
        
        // Use fixed dimensions to prevent continuous updates
        const svgWidth = 800;
        const svgHeight = 600;
        
        // Find bounds of all nodes
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        for (let nodeId in layout) {
            const node = layout[nodeId];
            minX = Math.min(minX, node.x);
            maxX = Math.max(maxX, node.x);
            minY = Math.min(minY, node.y);
            maxY = Math.max(maxY, node.y);
        }
        
        // Calculate tree dimensions
        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        
        // Calculate center offset - only if tree has valid dimensions
        if (treeWidth > 0 || treeHeight > 0) {
            const centerX = svgWidth / 2;
            const centerY = svgHeight / 2;
            
            // Calculate offset to center the tree
            const offsetX = centerX - (minX + treeWidth / 2);
            const offsetY = Math.max(80, centerY - treeHeight / 2); // Leave some top margin
            
            // Apply offset to all nodes
            for (let nodeId in layout) {
                layout[nodeId].x += offsetX;
                layout[nodeId].y += offsetY;
            }
        }
    }
    
    // Render edges between nodes
    renderEdges(node, layout, parentLayout = null) {
        if (!node) return;
        
        const currentLayout = layout[node.id];
        if (!currentLayout) return;
        
        // Draw edge from parent
        if (parentLayout) {
            const edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            edge.setAttribute('class', 'tree-edge');
            edge.setAttribute('x1', parentLayout.x);
            edge.setAttribute('y1', parentLayout.y);
            edge.setAttribute('x2', currentLayout.x);
            edge.setAttribute('y2', currentLayout.y);
            
            this.mainGroup.appendChild(edge);
        }
        
        // Draw edges to children
        if (this.isBinaryTree()) {
            if (node.left) {
                this.renderEdges(node.left, layout, currentLayout);
            }
            if (node.right) {
                this.renderEdges(node.right, layout, currentLayout);
            }
        } else if (this.treeType === 'b-tree') {
            if (node.children) {
                for (let child of node.children) {
                    this.renderEdges(child, layout, currentLayout);
                }
            }
        } else if (this.treeType === 'trie') {
            if (node.children) {
                for (let child of node.children) {
                    this.renderEdges(child.node, layout, currentLayout);
                }
            }
        }
    }
    
    // Render nodes
    renderNodes(node, layout, parentLayout = null) {
        if (!node) return;
        
        const currentLayout = layout[node.id];
        if (!currentLayout) return;
        
        // Create node group
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'tree-node-group');
        nodeGroup.setAttribute('transform', `translate(${currentLayout.x}, ${currentLayout.y})`);
        
        // Create node based on type
        if (this.treeType === 'b-tree') {
            this.createBTreeNode(nodeGroup, node, currentLayout);
        } else if (this.treeType === 'trie') {
            this.createTrieNode(nodeGroup, node, currentLayout);
        } else {
            this.createBinaryTreeNode(nodeGroup, node, currentLayout);
        }
        
        this.mainGroup.appendChild(nodeGroup);
        
        // Render children
        if (this.isBinaryTree()) {
            if (node.left) {
                this.renderNodes(node.left, layout, currentLayout);
            }
            if (node.right) {
                this.renderNodes(node.right, layout, currentLayout);
            }
        } else if (this.treeType === 'b-tree') {
            if (node.children) {
                for (let child of node.children) {
                    this.renderNodes(child, layout, currentLayout);
                }
            }
        } else if (this.treeType === 'trie') {
            if (node.children) {
                for (let child of node.children) {
                    this.renderNodes(child.node, layout, currentLayout);
                }
            }
        }
    }
    
    // Create binary tree node
    createBinaryTreeNode(nodeGroup, node, layout) {
        // Create circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'tree-node');
        circle.setAttribute('r', this.options.nodeRadius);
        circle.setAttribute('fill', this.getNodeColor(node));
        circle.setAttribute('stroke', this.getNodeStrokeColor(node));
        circle.setAttribute('stroke-width', this.getNodeStrokeWidth(node));
        
        // Add click event
        circle.addEventListener('click', () => this.onNodeClick(node));
        
        nodeGroup.appendChild(circle);
        
        // Create text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'tree-text');
        text.textContent = node.value;
        nodeGroup.appendChild(text);
        
        // Add additional info for specific tree types
        if (this.treeType === 'avl') {
            this.addAVLInfo(nodeGroup, node);
        } else if (this.treeType === 'red-black') {
            this.addRedBlackInfo(nodeGroup, node);
        }
    }
    
    // Create B-tree node
    createBTreeNode(nodeGroup, node, layout) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', 'tree-node');
        rect.setAttribute('width', layout.width);
        rect.setAttribute('height', 40);
        rect.setAttribute('x', -layout.width / 2);
        rect.setAttribute('y', -20);
        rect.setAttribute('rx', 5);
        rect.setAttribute('fill', this.options.colors.default);
        rect.setAttribute('stroke', '#34495e');
        rect.setAttribute('stroke-width', 2);
        
        nodeGroup.appendChild(rect);
        
        // Add keys
        const keySpacing = layout.width / (node.keys.length + 1);
        for (let i = 0; i < node.keys.length; i++) {
            const keyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            keyText.setAttribute('class', 'tree-text');
            keyText.setAttribute('x', -layout.width / 2 + (i + 1) * keySpacing);
            keyText.setAttribute('y', 0);
            keyText.textContent = node.keys[i];
            nodeGroup.appendChild(keyText);
        }
    }
    
    // Create Trie node
    createTrieNode(nodeGroup, node, layout) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'tree-node');
        circle.setAttribute('r', this.options.nodeRadius);
        circle.setAttribute('fill', node.isEndOfWord ? this.options.colors.selected : this.options.colors.default);
        circle.setAttribute('stroke', '#34495e');
        circle.setAttribute('stroke-width', 2);
        
        nodeGroup.appendChild(circle);
        
        // Add character
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'tree-text');
        text.textContent = node.value || 'ROOT';
        nodeGroup.appendChild(text);
        
        // Add end-of-word indicator
        if (node.isEndOfWord) {
            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            indicator.setAttribute('r', 5);
            indicator.setAttribute('fill', '#E74C3C');
            indicator.setAttribute('cx', 15);
            indicator.setAttribute('cy', -15);
            nodeGroup.appendChild(indicator);
        }
    }
    
    // Get node color based on tree type and node properties
    getNodeColor(node) {
        switch (this.treeType) {
            case 'avl':
                if (Math.abs(node.balanceFactor) > 1) {
                    return this.options.colors.avl.unbalanced;
                }
                return this.options.colors.avl.balanced;
            case 'red-black':
                return node.isRed ? this.options.colors.rb.red : this.options.colors.rb.black;
            case 'min-heap':
                return this.options.colors.heap.min;
            case 'max-heap':
                return this.options.colors.heap.max;
            default:
                return this.options.colors.default;
        }
    }
    
    // Get node stroke color
    getNodeStrokeColor(node) {
        if (this.highlightedNodes.has(node.id)) {
            return this.options.colors.highlight;
        }
        if (this.selectedNodes.has(node.id)) {
            return this.options.colors.selected;
        }
        if (this.traversedNodes.has(node.id)) {
            return this.options.colors.traversed;
        }
        return '#34495e';
    }
    
    // Get node stroke width
    getNodeStrokeWidth(node) {
        if (this.selectedNodes.has(node.id)) {
            return 3;
        }
        if (this.traversedNodes.has(node.id)) {
            return 2;
        }
        return 2;
    }
    
    // Add AVL-specific information
    addAVLInfo(nodeGroup, node) {
        const info = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        info.setAttribute('class', 'tree-info');
        info.setAttribute('y', 25);
        info.textContent = `BF: ${node.balanceFactor}`;
        nodeGroup.appendChild(info);
    }
    
    // Add Red-Black-specific information
    addRedBlackInfo(nodeGroup, node) {
        const info = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        info.setAttribute('class', 'tree-info');
        info.setAttribute('y', 25);
        info.textContent = node.isRed ? 'R' : 'B';
        info.setAttribute('fill', node.isRed ? '#E74C3C' : '#2C3E50');
        nodeGroup.appendChild(info);
    }
    
    // Show empty tree message
    showEmptyTree() {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'tree-text');
        text.setAttribute('x', '50%');
        text.setAttribute('y', '50%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#95a5a6');
        text.textContent = 'Tree is empty';
        this.mainGroup.appendChild(text);
    }
    
    // Clear visualization
    clearVisualization() {
        this.mainGroup.innerHTML = '';
        this.highlightedNodes.clear();
        this.selectedNodes.clear();
        this.traversedNodes.clear();
    }
    
    // Update tree information display
    updateTreeInfo(tree) {
        const stats = tree.getStats();
        // This will be handled by the main app
    }
    
    // Animation methods
    highlightNode(nodeId, duration = 1000) {
        this.highlightedNodes.add(nodeId);
        this.refreshVisualization();
        
        setTimeout(() => {
            this.highlightedNodes.delete(nodeId);
            this.refreshVisualization();
        }, duration);
    }
    
    selectNode(nodeId) {
        this.selectedNodes.add(nodeId);
        this.refreshVisualization();
    }
    
    deselectNode(nodeId) {
        this.selectedNodes.delete(nodeId);
        this.refreshVisualization();
    }
    
    traverseNode(nodeId) {
        this.traversedNodes.add(nodeId);
        this.refreshVisualization();
    }
    
    clearTraversal() {
        this.traversedNodes.clear();
        this.refreshVisualization();
    }
    
    // Refresh visualization
    refreshVisualization() {
        if (this.currentTree) {
            this.visualize(this.currentTree, this.treeType);
        }
    }
    
    // Event handlers
    onNodeClick(node) {
        console.log('Node clicked:', node);
        // This will be handled by the main app
    }
    
    // Animation queue management
    addAnimation(animation) {
        this.animationQueue.push(animation);
        this.processAnimationQueue();
    }
    
    processAnimationQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) {
            return;
        }
        
        this.isAnimating = true;
        const animation = this.animationQueue.shift();
        
        animation(() => {
            this.isAnimating = false;
            this.processAnimationQueue();
        });
    }
    
    // Animate insertion
    animateInsertion(node, callback) {
        this.addAnimation((done) => {
            this.highlightNode(node.id, 1000);
            setTimeout(() => {
                this.refreshVisualization();
                if (callback) callback();
                done();
            }, 1000);
        });
    }
    
    // Animate deletion
    animateDeletion(node, callback) {
        this.addAnimation((done) => {
            this.highlightNode(node.id, 1000);
            setTimeout(() => {
                this.refreshVisualization();
                if (callback) callback();
                done();
            }, 1000);
        });
    }
    
    // Animate traversal
    animateTraversal(nodes, callback) {
        this.addAnimation((done) => {
            let index = 0;
            const traverseNext = () => {
                if (index >= nodes.length) {
                    this.clearTraversal();
                    if (callback) callback();
                    done();
                    return;
                }
                
                this.traverseNode(nodes[index].id);
                index++;
                setTimeout(traverseNext, 500);
            };
            
            traverseNext();
        });
    }
    
    // Animate rotation (for AVL/Red-Black trees)
    animateRotation(node1, node2, callback) {
        this.addAnimation((done) => {
            this.highlightNode(node1.id, 1000);
            setTimeout(() => {
                this.highlightNode(node2.id, 1000);
                setTimeout(() => {
                    this.refreshVisualization();
                    if (callback) callback();
                    done();
                }, 1000);
            }, 1000);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TreeVisualizer };
}
