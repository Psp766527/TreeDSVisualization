/**
 * Binary Tree Implementation
 */
class BinaryTree extends BaseTree {
    constructor(type = 'binary-tree') {
        super();
        this.type = type;
    }
    
    // Insert a value into the binary tree (level-order insertion)
    insert(value) {
        const newNode = new TreeNode(value);
        
        if (!this.root) {
            this.root = newNode;
            this.size = 1;
            this.addOperation({ type: 'insert', value, node: newNode.id, step: 'create_root' });
            return newNode;
        }
        
        // Level-order insertion to maintain completeness
        const queue = [this.root];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (!current.left) {
                current.left = newNode;
                newNode.parent = current;
                this.size++;
                this.addOperation({ type: 'insert', value, node: newNode.id, parent: current.id, step: 'insert_left' });
                break;
            } else if (!current.right) {
                current.right = newNode;
                newNode.parent = current;
                this.size++;
                this.addOperation({ type: 'insert', value, node: newNode.id, parent: current.id, step: 'insert_right' });
                break;
            } else {
                queue.push(current.left);
                queue.push(current.right);
            }
        }
        
        this.calculateHeight();
        this.updateDepths();
        return newNode;
    }
    
    // Delete a value from the binary tree
    delete(value) {
        const nodeToDelete = this.findNode(value);
        if (!nodeToDelete) {
            this.addOperation({ type: 'delete', value, step: 'not_found' });
            return false;
        }
        
        // Find the rightmost node in the last level
        const lastNode = this.findLastNode();
        
        if (nodeToDelete === lastNode) {
            // Deleting the last node
            if (nodeToDelete === this.root) {
                this.root = null;
                this.size = 0;
                this.addOperation({ type: 'delete', value, step: 'delete_root' });
                return true;
            }
            
            // Remove from parent
            if (nodeToDelete.parent.left === nodeToDelete) {
                nodeToDelete.parent.left = null;
            } else {
                nodeToDelete.parent.right = null;
            }
            
            this.size--;
            this.addOperation({ type: 'delete', value, step: 'delete_leaf' });
            return true;
        }
        
        // Replace with last node
        const lastValue = lastNode.value;
        lastNode.value = nodeToDelete.value;
        nodeToDelete.value = lastValue;
        
        // Delete the last node
        if (lastNode.parent.left === lastNode) {
            lastNode.parent.left = null;
        } else {
            lastNode.parent.right = null;
        }
        
        this.size--;
        this.calculateHeight();
        this.updateDepths();
        this.addOperation({ type: 'delete', value, step: 'replace_and_delete', replacement: lastValue });
        return true;
    }
    
    // Search for a value in the binary tree
    search(value) {
        const result = this.searchHelper(this.root, value);
        this.addOperation({ type: 'search', value, found: !!result, step: 'search_complete' });
        return result;
    }
    
    searchHelper(node, value) {
        if (!node) return null;
        if (node.value === value) return node;
        
        const leftResult = this.searchHelper(node.left, value);
        if (leftResult) return leftResult;
        
        return this.searchHelper(node.right, value);
    }
    
    // Find the last node (rightmost in the last level)
    findLastNode() {
        if (!this.root) return null;
        
        const queue = [this.root];
        let lastNode = null;
        
        while (queue.length > 0) {
            lastNode = queue.shift();
            if (lastNode.left) queue.push(lastNode.left);
            if (lastNode.right) queue.push(lastNode.right);
        }
        
        return lastNode;
    }
    
    // Validate tree type properties
    validateType() {
        switch (this.type) {
            case 'full-binary':
                return this.isFullBinary();
            case 'perfect-binary':
                return this.isPerfectBinary();
            case 'complete-binary':
                return this.isCompleteBinary();
            case 'balanced-binary':
                return this.isBalanced();
            default:
                return true;
        }
    }
    
    // Check if tree is full binary
    isFullBinary(node = this.root) {
        if (!node) return true;
        
        // If node has no children or both children
        if ((!node.left && !node.right) || (node.left && node.right)) {
            return this.isFullBinary(node.left) && this.isFullBinary(node.right);
        }
        
        return false;
    }
    
    // Check if tree is perfect binary
    isPerfectBinary(node = this.root, depth = 0) {
        if (!node) return true;
        
        // Check if all leaves are at the same depth
        if (!node.left && !node.right) {
            return depth === this.getMaxDepth();
        }
        
        // Check if internal nodes have both children
        if (!node.left || !node.right) return false;
        
        return this.isPerfectBinary(node.left, depth + 1) && 
               this.isPerfectBinary(node.right, depth + 1);
    }
    
    // Check if tree is complete binary
    isCompleteBinary() {
        if (!this.root) return true;
        
        const queue = [this.root];
        let foundNull = false;
        
        while (queue.length > 0) {
            const node = queue.shift();
            
            if (!node) {
                foundNull = true;
            } else {
                if (foundNull) return false; // Found non-null after null
                queue.push(node.left);
                queue.push(node.right);
            }
        }
        
        return true;
    }
    
    // Get maximum depth of the tree
    getMaxDepth(node = this.root) {
        if (!node) return -1;
        
        const leftDepth = this.getMaxDepth(node.left);
        const rightDepth = this.getMaxDepth(node.right);
        
        return Math.max(leftDepth, rightDepth) + 1;
    }
    
    // Update a node's value
    updateValue(oldValue, newValue) {
        const node = this.findNode(oldValue);
        if (!node) {
            this.addOperation({ type: 'update', oldValue, newValue, step: 'not_found' });
            return false;
        }
        
        node.value = newValue;
        this.addOperation({ type: 'update', oldValue, newValue, node: node.id, step: 'value_updated' });
        return true;
    }
    
    // Get tree statistics specific to binary trees
    getBinaryTreeStats() {
        const stats = this.getStats();
        const typeStats = {
            isFull: this.isFullBinary(),
            isPerfect: this.isPerfectBinary(),
            isComplete: this.isCompleteBinary(),
            isBalanced: this.isBalanced(),
            maxDepth: this.getMaxDepth(),
            leafCount: this.getLeafCount(),
            internalNodeCount: this.getInternalNodeCount()
        };
        
        return { ...stats, ...typeStats };
    }
    
    // Count leaves in the tree
    getLeafCount(node = this.root) {
        if (!node) return 0;
        if (!node.left && !node.right) return 1;
        
        return this.getLeafCount(node.left) + this.getLeafCount(node.right);
    }
    
    // Count internal nodes in the tree
    getInternalNodeCount(node = this.root) {
        if (!node) return 0;
        if (!node.left && !node.right) return 0;
        
        return 1 + this.getInternalNodeCount(node.left) + this.getInternalNodeCount(node.right);
    }
    
    // Generate a sample tree for demonstration
    generateSampleTree(values = [10, 5, 15, 3, 7, 12, 18]) {
        this.clear();
        values.forEach(value => this.insert(value));
        return this;
    }
    
    // Get tree type specific information
    getTypeInfo() {
        const info = TreeInfo[this.type];
        if (!info) return TreeInfo['binary-tree'];
        
        // Add validation status
        info.validation = {
            isFull: this.isFullBinary(),
            isPerfect: this.isPerfectBinary(),
            isComplete: this.isCompleteBinary(),
            isBalanced: this.isBalanced()
        };
        
        return info;
    }
}

/**
 * Specialized Binary Tree Constructors
 */
class FullBinaryTree extends BinaryTree {
    constructor() {
        super('full-binary');
    }
    
    insert(value) {
        // For full binary tree, we need to ensure we don't create single children
        // This is a simplified implementation - in practice, you'd need more complex logic
        return super.insert(value);
    }
}

class PerfectBinaryTree extends BinaryTree {
    constructor() {
        super('perfect-binary');
    }
    
    insert(value) {
        // For perfect binary tree, we maintain perfect structure
        // This is a simplified implementation
        return super.insert(value);
    }
}

class CompleteBinaryTree extends BinaryTree {
    constructor() {
        super('complete-binary');
    }
    
    insert(value) {
        // Complete binary tree insertion maintains completeness
        return super.insert(value);
    }
}

class BalancedBinaryTree extends BinaryTree {
    constructor() {
        super('balanced-binary');
    }
    
    insert(value) {
        // For balanced binary tree, we'd implement balancing logic
        // This is a simplified version
        return super.insert(value);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BinaryTree, FullBinaryTree, PerfectBinaryTree, CompleteBinaryTree, BalancedBinaryTree };
}
