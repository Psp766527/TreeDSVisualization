/**
 * AVL Tree Implementation (Self-Balancing Binary Search Tree)
 */
class AVLTree extends BST {
    constructor() {
        super();
        this.type = 'avl';
    }
    
    // Override insert to include balancing
    insert(value) {
        const newNode = new TreeNode(value);
        
        if (!this.root) {
            this.root = newNode;
            this.size = 1;
            this.addOperation({ type: 'insert', value, node: newNode.id, step: 'create_root' });
            return newNode;
        }
        
        const insertedNode = this.insertNode(this.root, newNode);
        if (insertedNode) {
            this.rebalance(insertedNode);
        }
        return insertedNode;
    }
    
    insertNode(current, newNode) {
        if (newNode.value < current.value) {
            if (!current.left) {
                current.left = newNode;
                newNode.parent = current;
                this.size++;
                this.addOperation({ 
                    type: 'insert', 
                    value: newNode.value, 
                    node: newNode.id, 
                    parent: current.id, 
                    step: 'insert_left',
                    comparison: `${newNode.value} < ${current.value}`
                });
                return newNode;
            } else {
                this.addOperation({ 
                    type: 'insert', 
                    value: newNode.value, 
                    step: 'traverse_left',
                    comparison: `${newNode.value} < ${current.value}`,
                    current: current.id
                });
                return this.insertNode(current.left, newNode);
            }
        } else if (newNode.value > current.value) {
            if (!current.right) {
                current.right = newNode;
                newNode.parent = current;
                this.size++;
                this.addOperation({ 
                    type: 'insert', 
                    value: newNode.value, 
                    node: newNode.id, 
                    parent: current.id, 
                    step: 'insert_right',
                    comparison: `${newNode.value} > ${current.value}`
                });
                return newNode;
            } else {
                this.addOperation({ 
                    type: 'insert', 
                    value: newNode.value, 
                    step: 'traverse_right',
                    comparison: `${newNode.value} > ${current.value}`,
                    current: current.id
                });
                return this.insertNode(current.right, newNode);
            }
        } else {
            this.addOperation({ 
                type: 'insert', 
                value: newNode.value, 
                step: 'duplicate',
                message: 'Duplicate values not allowed in AVL Tree'
            });
            return null;
        }
    }
    
    // Override delete to include balancing
    delete(value) {
        const nodeToDelete = this.findNode(value);
        if (!nodeToDelete) {
            this.addOperation({ type: 'delete', value, step: 'not_found' });
            return false;
        }
        
        const deletedNode = this.deleteNode(this.root, value);
        if (deletedNode) {
            this.rebalance(deletedNode);
        }
        this.size--;
        this.calculateHeight();
        this.updateDepths();
        return true;
    }
    
    deleteNode(node, value) {
        if (!node) return null;
        
        if (value < node.value) {
            this.addOperation({ 
                type: 'delete', 
                value, 
                step: 'traverse_left',
                comparison: `${value} < ${node.value}`,
                current: node.id
            });
            node.left = this.deleteNode(node.left, value);
            if (node.left) node.left.parent = node;
        } else if (value > node.value) {
            this.addOperation({ 
                type: 'delete', 
                value, 
                step: 'traverse_right',
                comparison: `${value} > ${node.value}`,
                current: node.id
            });
            node.right = this.deleteNode(node.right, value);
            if (node.right) node.right.parent = node;
        } else {
            this.addOperation({ type: 'delete', value, step: 'found', node: node.id });
            
            // Case 1: Node with no children (leaf node)
            if (!node.left && !node.right) {
                this.addOperation({ type: 'delete', value, step: 'delete_leaf' });
                return null;
            }
            
            // Case 2: Node with one child
            if (!node.left) {
                this.addOperation({ type: 'delete', value, step: 'replace_right' });
                if (node.right) node.right.parent = node.parent;
                return node.right;
            } else if (!node.right) {
                this.addOperation({ type: 'delete', value, step: 'replace_left' });
                if (node.left) node.left.parent = node.parent;
                return node.left;
            }
            
            // Case 3: Node with two children
            const successor = this.findMin(node.right);
            this.addOperation({ 
                type: 'delete', 
                value, 
                step: 'find_successor',
                successor: successor.value,
                successorNode: successor.id
            });
            
            node.value = successor.value;
            node.right = this.deleteNode(node.right, successor.value);
            if (node.right) node.right.parent = node;
            this.addOperation({ type: 'delete', value, step: 'delete_successor' });
        }
        
        return node;
    }
    
    // Calculate height and balance factor for a node
    updateHeightAndBalance(node) {
        if (!node) return;
        
        const leftHeight = node.left ? node.left.height + 1 : 0;
        const rightHeight = node.right ? node.right.height + 1 : 0;
        
        node.height = Math.max(leftHeight, rightHeight);
        node.balanceFactor = leftHeight - rightHeight;
        
        this.addOperation({ 
            type: 'balance_update', 
            node: node.id, 
            height: node.height, 
            balanceFactor: node.balanceFactor 
        });
    }
    
    // Rebalance the tree starting from a node
    rebalance(node) {
        while (node) {
            this.updateHeightAndBalance(node);
            
            // Check if node is unbalanced
            if (node.balanceFactor > 1) {
                // Left-heavy
                if (node.left && node.left.balanceFactor >= 0) {
                    // Left-Left case
                    this.addOperation({ 
                        type: 'rotation', 
                        rotation: 'right', 
                        node: node.id, 
                        reason: 'Left-Left case' 
                    });
                    node = this.rotateRight(node);
                } else {
                    // Left-Right case
                    this.addOperation({ 
                        type: 'rotation', 
                        rotation: 'left-right', 
                        node: node.id, 
                        reason: 'Left-Right case' 
                    });
                    node.left = this.rotateLeft(node.left);
                    node = this.rotateRight(node);
                }
            } else if (node.balanceFactor < -1) {
                // Right-heavy
                if (node.right && node.right.balanceFactor <= 0) {
                    // Right-Right case
                    this.addOperation({ 
                        type: 'rotation', 
                        rotation: 'left', 
                        node: node.id, 
                        reason: 'Right-Right case' 
                    });
                    node = this.rotateLeft(node);
                } else {
                    // Right-Left case
                    this.addOperation({ 
                        type: 'rotation', 
                        rotation: 'right-left', 
                        node: node.id, 
                        reason: 'Right-Left case' 
                    });
                    node.right = this.rotateRight(node.right);
                    node = this.rotateLeft(node);
                }
            }
            
            // Move up to parent
            node = node.parent;
        }
    }
    
    // Right rotation
    rotateRight(y) {
        const x = y.left;
        const T2 = x.right;
        
        // Perform rotation
        x.right = y;
        y.left = T2;
        
        // Update parent pointers
        if (y.parent) {
            if (y.parent.left === y) {
                y.parent.left = x;
            } else {
                y.parent.right = x;
            }
        } else {
            this.root = x;
        }
        
        x.parent = y.parent;
        y.parent = x;
        if (T2) T2.parent = y;
        
        // Update heights
        this.updateHeightAndBalance(y);
        this.updateHeightAndBalance(x);
        
        this.addOperation({ 
            type: 'rotation_complete', 
            rotation: 'right', 
            pivot: y.id, 
            newRoot: x.id 
        });
        
        return x;
    }
    
    // Left rotation
    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;
        
        // Perform rotation
        y.left = x;
        x.right = T2;
        
        // Update parent pointers
        if (x.parent) {
            if (x.parent.left === x) {
                x.parent.left = y;
            } else {
                x.parent.right = y;
            }
        } else {
            this.root = y;
        }
        
        y.parent = x.parent;
        x.parent = y;
        if (T2) T2.parent = x;
        
        // Update heights
        this.updateHeightAndBalance(x);
        this.updateHeightAndBalance(y);
        
        this.addOperation({ 
            type: 'rotation_complete', 
            rotation: 'left', 
            pivot: x.id, 
            newRoot: y.id 
        });
        
        return y;
    }
    
    // Check if tree is AVL balanced
    isAVLBalanced(node = this.root) {
        if (!node) return true;
        
        const leftBalanced = this.isAVLBalanced(node.left);
        const rightBalanced = this.isAVLBalanced(node.right);
        const currentBalanced = Math.abs(node.balanceFactor) <= 1;
        
        return leftBalanced && rightBalanced && currentBalanced;
    }
    
    // Get all nodes with their balance factors
    getBalanceFactors() {
        const factors = [];
        this.collectBalanceFactors(this.root, factors);
        return factors;
    }
    
    collectBalanceFactors(node, factors) {
        if (!node) return;
        
        factors.push({
            value: node.value,
            id: node.id,
            balanceFactor: node.balanceFactor,
            height: node.height,
            isBalanced: Math.abs(node.balanceFactor) <= 1
        });
        
        this.collectBalanceFactors(node.left, factors);
        this.collectBalanceFactors(node.right, factors);
    }
    
    // Get AVL tree statistics
    getAVLStats() {
        const stats = this.getBSTStats();
        const avlStats = {
            isAVLBalanced: this.isAVLBalanced(),
            balanceFactors: this.getBalanceFactors(),
            maxBalanceFactor: Math.max(...this.getBalanceFactors().map(f => Math.abs(f.balanceFactor))),
            avgBalanceFactor: this.getBalanceFactors().reduce((sum, f) => sum + Math.abs(f.balanceFactor), 0) / this.size
        };
        
        return { ...stats, ...avlStats };
    }
    
    // Generate a sample AVL tree
    generateSampleAVL(values = [10, 20, 30, 40, 50, 25]) {
        this.clear();
        values.forEach(value => this.insert(value));
        return this;
    }
    
    // Get tree type specific information
    getTypeInfo() {
        const info = TreeInfo['avl'];
        if (!info) return TreeInfo['bst'];
        
        // Add AVL specific validation
        info.validation = {
            isValidBST: this.isValidBST(),
            isAVLBalanced: this.isAVLBalanced(),
            maxBalanceFactor: Math.max(...this.getBalanceFactors().map(f => Math.abs(f.balanceFactor))),
            balanceFactors: this.getBalanceFactors()
        };
        
        return info;
    }
    
    // Override update value to maintain AVL property
    updateValue(oldValue, newValue) {
        if (this.delete(oldValue)) {
            this.insert(newValue);
            this.addOperation({ 
                type: 'update', 
                oldValue, 
                newValue, 
                step: 'update_complete' 
            });
            return true;
        }
        return false;
    }
    
    // Get rotation history for visualization
    getRotationHistory() {
        return this.operationHistory.filter(op => 
            op.type === 'rotation' || op.type === 'rotation_complete'
        );
    }
    
    // Get nodes that need balancing
    getUnbalancedNodes() {
        const unbalanced = [];
        this.findUnbalancedNodes(this.root, unbalanced);
        return unbalanced;
    }
    
    findUnbalancedNodes(node, unbalanced) {
        if (!node) return;
        
        if (Math.abs(node.balanceFactor) > 1) {
            unbalanced.push({
                value: node.value,
                id: node.id,
                balanceFactor: node.balanceFactor,
                needsRotation: true
            });
        }
        
        this.findUnbalancedNodes(node.left, unbalanced);
        this.findUnbalancedNodes(node.right, unbalanced);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AVLTree };
}
