/**
 * Base Tree Node Class
 */
class TreeNode {
    constructor(value, left = null, right = null) {
        this.value = value;
        this.left = left;
        this.right = right;
        this.parent = null;
        this.depth = 0;
        this.height = 0;
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Tree-specific properties
        this.balanceFactor = 0;
        this.color = 'black'; // For Red-Black trees
        this.isRed = false; // For Red-Black trees
        this.isNull = false; // For Red-Black null nodes
    }
    
    // Calculate height of this node
    calculateHeight() {
        const leftHeight = this.left ? this.left.height + 1 : 0;
        const rightHeight = this.right ? this.right.height + 1 : 0;
        this.height = Math.max(leftHeight, rightHeight);
        return this.height;
    }
    
    // Calculate balance factor
    calculateBalanceFactor() {
        const leftHeight = this.left ? this.left.height + 1 : 0;
        const rightHeight = this.right ? this.right.height + 1 : 0;
        this.balanceFactor = leftHeight - rightHeight;
        return this.balanceFactor;
    }
    
    // Check if node is leaf
    isLeaf() {
        return !this.left && !this.right;
    }
    
    // Get node info for display
    getInfo() {
        return {
            value: this.value,
            height: this.height,
            balanceFactor: this.balanceFactor,
            isLeaf: this.isLeaf(),
            depth: this.depth
        };
    }
}

/**
 * Base Tree Class with common operations
 */
class BaseTree {
    constructor() {
        this.root = null;
        this.size = 0;
        this.type = 'base';
        this.operationHistory = [];
        this.currentStep = 0;
        this.isStepMode = false;
    }
    
    // Abstract methods to be implemented by subclasses
    insert(value) {
        throw new Error('Insert method must be implemented by subclass');
    }
    
    delete(value) {
        throw new Error('Delete method must be implemented by subclass');
    }
    
    search(value) {
        throw new Error('Search method must be implemented by subclass');
    }
    
    // Common traversal methods
    preorderTraversal(node = this.root, result = []) {
        if (!node) return result;
        
        result.push(node.value);
        this.preorderTraversal(node.left, result);
        this.preorderTraversal(node.right, result);
        
        return result;
    }
    
    inorderTraversal(node = this.root, result = []) {
        if (!node) return result;
        
        this.inorderTraversal(node.left, result);
        result.push(node.value);
        this.inorderTraversal(node.right, result);
        
        return result;
    }
    
    postorderTraversal(node = this.root, result = []) {
        if (!node) return result;
        
        this.postorderTraversal(node.left, result);
        this.postorderTraversal(node.right, result);
        result.push(node.value);
        
        return result;
    }
    
    levelOrderTraversal() {
        if (!this.root) return [];
        
        const result = [];
        const queue = [this.root];
        
        while (queue.length > 0) {
            const node = queue.shift();
            result.push(node.value);
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        return result;
    }
    
    // Calculate tree height
    calculateHeight(node = this.root) {
        if (!node) return -1;
        
        const leftHeight = this.calculateHeight(node.left);
        const rightHeight = this.calculateHeight(node.right);
        
        node.height = Math.max(leftHeight, rightHeight) + 1;
        node.calculateBalanceFactor();
        
        return node.height;
    }
    
    // Update depths of all nodes
    updateDepths(node = this.root, depth = 0) {
        if (!node) return;
        
        node.depth = depth;
        this.updateDepths(node.left, depth + 1);
        this.updateDepths(node.right, depth + 1);
    }
    
    // Find node by value
    findNode(value, node = this.root) {
        if (!node) return null;
        if (node.value === value) return node;
        
        const leftResult = this.findNode(value, node.left);
        if (leftResult) return leftResult;
        
        const rightResult = this.findNode(value, node.right);
        return rightResult;
    }
    
    // Find minimum value in subtree
    findMin(node = this.root) {
        if (!node) return null;
        while (node.left) {
            node = node.left;
        }
        return node;
    }
    
    // Find maximum value in subtree
    findMax(node = this.root) {
        if (!node) return null;
        while (node.right) {
            node = node.right;
        }
        return node;
    }
    
    // Get tree statistics
    getStats() {
        this.calculateHeight();
        this.updateDepths();
        
        return {
            size: this.size,
            height: this.root ? this.root.height : -1,
            type: this.type,
            isBalanced: this.isBalanced(),
            minValue: this.findMin()?.value || null,
            maxValue: this.findMax()?.value || null
        };
    }
    
    // Check if tree is balanced (AVL property)
    isBalanced(node = this.root) {
        if (!node) return true;
        
        const leftBalanced = this.isBalanced(node.left);
        const rightBalanced = this.isBalanced(node.right);
        const currentBalanced = Math.abs(node.balanceFactor) <= 1;
        
        return leftBalanced && rightBalanced && currentBalanced;
    }
    
    // Clear the tree
    clear() {
        this.root = null;
        this.size = 0;
        this.operationHistory = [];
        this.currentStep = 0;
    }
    
    // Step-by-step mode methods
    setStepMode(enabled) {
        this.isStepMode = enabled;
    }
    
    addOperation(operation) {
        this.operationHistory.push(operation);
    }
    
    getNextStep() {
        if (this.currentStep < this.operationHistory.length) {
            return this.operationHistory[this.currentStep++];
        }
        return null;
    }
    
    resetSteps() {
        this.currentStep = 0;
    }
    
    // Get tree structure for visualization
    getTreeStructure(node = this.root, x = 0, y = 0, level = 0) {
        if (!node) return null;
        
        const structure = {
            id: node.id,
            value: node.value,
            x: x,
            y: y,
            level: level,
            depth: node.depth,
            height: node.height,
            balanceFactor: node.balanceFactor,
            isLeaf: node.isLeaf(),
            left: null,
            right: null,
            color: node.color,
            isRed: node.isRed
        };
        
        if (node.left) {
            structure.left = this.getTreeStructure(
                node.left, 
                x - Math.pow(2, this.root.height - level - 1), 
                y + 1, 
                level + 1
            );
        }
        
        if (node.right) {
            structure.right = this.getTreeStructure(
                node.right, 
                x + Math.pow(2, this.root.height - level - 1), 
                y + 1, 
                level + 1
            );
        }
        
        return structure;
    }
    
    // Validation methods
    isValid() {
        return this.validateStructure(this.root);
    }
    
    validateStructure(node, min = null, max = null) {
        if (!node) return true;
        
        // For BST validation
        if (min !== null && node.value <= min) return false;
        if (max !== null && node.value >= max) return false;
        
        return this.validateStructure(node.left, min, node.value) &&
               this.validateStructure(node.right, node.value, max);
    }
    
    // Utility methods for animations
    highlightNode(nodeId, duration = 1000) {
        // This will be implemented by the visualizer
        console.log(`Highlighting node: ${nodeId}`);
    }
    
    animateOperation(operation, callback) {
        // This will be implemented by the visualizer
        console.log(`Animating operation: ${operation}`);
        if (callback) callback();
    }
}

/**
 * Tree Information Database
 */
const TreeInfo = {
    'binary-tree': {
        name: 'Binary Tree',
        definition: 'A binary tree is a tree data structure where each node has at most two children, referred to as the left child and the right child.',
        features: [
            'Each node has at most two children',
            'Left and right children are distinct',
            'No specific ordering constraint',
            'Used as base structure for other trees'
        ],
        rules: [
            'Each node can have 0, 1, or 2 children',
            'Children are called left and right',
            'No value ordering requirements'
        ]
    },
    'full-binary': {
        name: 'Full Binary Tree',
        definition: 'A full binary tree is a binary tree where every node has either 0 or 2 children. No node has exactly one child.',
        features: [
            'Every node has 0 or 2 children',
            'No node has exactly 1 child',
            'All leaves are at the same level',
            'Perfect binary tree is a subset'
        ],
        rules: [
            'Nodes can have 0 or 2 children only',
            'Cannot have nodes with 1 child',
            'Maintains full structure property'
        ]
    },
    'perfect-binary': {
        name: 'Perfect Binary Tree',
        definition: 'A perfect binary tree is a binary tree where all interior nodes have two children and all leaves have the same depth or same level.',
        features: [
            'All interior nodes have 2 children',
            'All leaves are at the same depth',
            'Height = log₂(n+1) - 1',
            'Total nodes = 2^(h+1) - 1'
        ],
        rules: [
            'All nodes at level i have 2 children',
            'All leaves at the same level',
            'Perfectly balanced structure'
        ]
    },
    'complete-binary': {
        name: 'Complete Binary Tree',
        definition: 'A complete binary tree is a binary tree where every level, except possibly the last, is completely filled, and all nodes are as far left as possible.',
        features: [
            'All levels filled except possibly last',
            'Nodes filled left to right',
            'Used in heap implementation',
            'Height = ⌊log₂n⌋'
        ],
        rules: [
            'Fill levels left to right',
            'Last level can be incomplete',
            'Nodes positioned as far left as possible'
        ]
    },
    'balanced-binary': {
        name: 'Balanced Binary Tree',
        definition: 'A balanced binary tree is a binary tree where the height difference between left and right subtrees of any node is at most 1.',
        features: [
            'Height difference ≤ 1 for any node',
            'Ensures O(log n) operations',
            'Self-balancing property',
            'AVL trees are balanced'
        ],
        rules: [
            'Balance factor ∈ {-1, 0, 1}',
            'Rebalance when violated',
            'Maintain logarithmic height'
        ]
    },
    'bst': {
        name: 'Binary Search Tree (BST)',
        definition: 'A Binary Search Tree is a binary tree where for each node, all values in the left subtree are smaller, and all values in the right subtree are larger.',
        features: [
            'Ordered tree structure',
            'Left child < parent < right child',
            'In-order traversal gives sorted sequence',
            'Average O(log n) operations'
        ],
        rules: [
            'Left subtree values < node value',
            'Right subtree values > node value',
            'No duplicate values',
            'In-order traversal is sorted'
        ]
    },
    'avl': {
        name: 'AVL Tree',
        definition: 'An AVL tree is a self-balancing Binary Search Tree where the height difference between left and right subtrees is at most 1.',
        features: [
            'Self-balancing BST',
            'Balance factor ∈ {-1, 0, 1}',
            'Rotations for rebalancing',
            'Guaranteed O(log n) height'
        ],
        rules: [
            'BST property maintained',
            'Balance factor ≤ 1',
            'Rotations: Left, Right, Left-Right, Right-Left',
            'Rebalance after insert/delete'
        ]
    },
    'red-black': {
        name: 'Red-Black Tree',
        definition: 'A Red-Black tree is a self-balancing Binary Search Tree where each node has a color (red or black) and follows specific coloring rules.',
        features: [
            'Self-balancing BST',
            'Color property (red/black)',
            'Balancing through recoloring and rotation',
            'Guaranteed O(log n) height'
        ],
        rules: [
            'Root is always black',
            'Red nodes have black children',
            'Same black height to leaves',
            'New nodes are red',
            'Rebalance through recoloring/rotation'
        ]
    },
    'min-heap': {
        name: 'Min Heap',
        definition: 'A Min Heap is a complete binary tree where the parent node is always smaller than or equal to its children.',
        features: [
            'Complete binary tree',
            'Parent ≤ children',
            'Minimum at root',
            'Used in priority queues'
        ],
        rules: [
            'Parent value ≤ child values',
            'Minimum element at root',
            'Heapify after operations',
            'Array representation'
        ]
    },
    'max-heap': {
        name: 'Max Heap',
        definition: 'A Max Heap is a complete binary tree where the parent node is always greater than or equal to its children.',
        features: [
            'Complete binary tree',
            'Parent ≥ children',
            'Maximum at root',
            'Used in priority queues'
        ],
        rules: [
            'Parent value ≥ child values',
            'Maximum element at root',
            'Heapify after operations',
            'Array representation'
        ]
    },
    'b-tree': {
        name: 'B-Tree',
        definition: 'A B-Tree is a self-balancing tree data structure that maintains sorted data and allows searches, insertions, and deletions in logarithmic time.',
        features: [
            'Multi-way tree structure',
            'Self-balancing',
            'Used in databases and file systems',
            'Min/max degree constraints'
        ],
        rules: [
            'Root has 2 to 2t children',
            'Internal nodes have t to 2t children',
            'All leaves at same level',
            'Split/merge operations'
        ]
    },
    'trie': {
        name: 'Trie',
        definition: 'A Trie (prefix tree) is a tree-like data structure used to store a dynamic set of strings where keys are usually strings.',
        features: [
            'Prefix tree structure',
            'Efficient string operations',
            'Shared prefixes',
            'Used in autocomplete'
        ],
        rules: [
            'Each path represents a string',
            'Shared prefixes are common paths',
            'Mark end of strings',
            'No cycles allowed'
        ]
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TreeNode, BaseTree, TreeInfo };
}
