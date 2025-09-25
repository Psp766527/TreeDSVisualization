/**
 * Binary Search Tree Implementation
 */
class BST extends BaseTree {
    constructor() {
        super();
        this.type = 'bst';
    }
    
    // Insert a value maintaining BST property
    insert(value) {
        const newNode = new TreeNode(value);
        
        if (!this.root) {
            this.root = newNode;
            this.size = 1;
            this.addOperation({ type: 'insert', value, node: newNode.id, step: 'create_root' });
            return newNode;
        }
        
        return this.insertNode(this.root, newNode);
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
            // Duplicate value
            this.addOperation({ 
                type: 'insert', 
                value: newNode.value, 
                step: 'duplicate',
                message: 'Duplicate values not allowed in BST'
            });
            return null;
        }
    }
    
    // Delete a value from BST
    delete(value) {
        const nodeToDelete = this.findNode(value);
        if (!nodeToDelete) {
            this.addOperation({ type: 'delete', value, step: 'not_found' });
            return false;
        }
        
        this.root = this.deleteNode(this.root, value);
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
        } else if (value > node.value) {
            this.addOperation({ 
                type: 'delete', 
                value, 
                step: 'traverse_right',
                comparison: `${value} > ${node.value}`,
                current: node.id
            });
            node.right = this.deleteNode(node.right, value);
        } else {
            // Found the node to delete
            this.addOperation({ type: 'delete', value, step: 'found', node: node.id });
            
            // Case 1: Node with no children (leaf node)
            if (!node.left && !node.right) {
                this.addOperation({ type: 'delete', value, step: 'delete_leaf' });
                return null;
            }
            
            // Case 2: Node with one child
            if (!node.left) {
                this.addOperation({ type: 'delete', value, step: 'replace_right' });
                return node.right;
            } else if (!node.right) {
                this.addOperation({ type: 'delete', value, step: 'replace_left' });
                return node.left;
            }
            
            // Case 3: Node with two children
            // Find inorder successor (smallest in right subtree)
            const successor = this.findMin(node.right);
            this.addOperation({ 
                type: 'delete', 
                value, 
                step: 'find_successor',
                successor: successor.value,
                successorNode: successor.id
            });
            
            // Replace node value with successor value
            node.value = successor.value;
            
            // Delete the successor
            node.right = this.deleteNode(node.right, successor.value);
            this.addOperation({ type: 'delete', value, step: 'delete_successor' });
        }
        
        return node;
    }
    
    // Search for a value in BST
    search(value) {
        const result = this.searchNode(this.root, value);
        this.addOperation({ type: 'search', value, found: !!result, step: 'search_complete' });
        return result;
    }
    
    searchNode(node, value) {
        if (!node) {
            this.addOperation({ type: 'search', value, step: 'not_found' });
            return null;
        }
        
        if (value === node.value) {
            this.addOperation({ type: 'search', value, step: 'found', node: node.id });
            return node;
        } else if (value < node.value) {
            this.addOperation({ 
                type: 'search', 
                value, 
                step: 'traverse_left',
                comparison: `${value} < ${node.value}`,
                current: node.id
            });
            return this.searchNode(node.left, value);
        } else {
            this.addOperation({ 
                type: 'search', 
                value, 
                step: 'traverse_right',
                comparison: `${value} > ${node.value}`,
                current: node.id
            });
            return this.searchNode(node.right, value);
        }
    }
    
    // Find minimum value in subtree
    findMin(node = this.root) {
        if (!node) return null;
        
        this.addOperation({ type: 'find_min', step: 'traverse_left', current: node.id });
        
        while (node.left) {
            node = node.left;
            this.addOperation({ type: 'find_min', step: 'traverse_left', current: node.id });
        }
        
        this.addOperation({ type: 'find_min', step: 'found', node: node.id, value: node.value });
        return node;
    }
    
    // Find maximum value in subtree
    findMax(node = this.root) {
        if (!node) return null;
        
        this.addOperation({ type: 'find_max', step: 'traverse_right', current: node.id });
        
        while (node.right) {
            node = node.right;
            this.addOperation({ type: 'find_max', step: 'traverse_right', current: node.id });
        }
        
        this.addOperation({ type: 'find_max', step: 'found', node: node.id, value: node.value });
        return node;
    }
    
    // Find successor of a node (next larger value)
    findSuccessor(value) {
        const node = this.findNode(value);
        if (!node) return null;
        
        // If right subtree exists, find minimum in right subtree
        if (node.right) {
            return this.findMin(node.right);
        }
        
        // Otherwise, find the lowest ancestor whose left child is also an ancestor
        let current = node;
        let parent = node.parent;
        
        while (parent && current === parent.right) {
            current = parent;
            parent = parent.parent;
        }
        
        return parent;
    }
    
    // Find predecessor of a node (next smaller value)
    findPredecessor(value) {
        const node = this.findNode(value);
        if (!node) return null;
        
        // If left subtree exists, find maximum in left subtree
        if (node.left) {
            return this.findMax(node.left);
        }
        
        // Otherwise, find the lowest ancestor whose right child is also an ancestor
        let current = node;
        let parent = node.parent;
        
        while (parent && current === parent.left) {
            current = parent;
            parent = parent.parent;
        }
        
        return parent;
    }
    
    // Update a node's value (delete old, insert new)
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
    
    // Check if tree is a valid BST
    isValidBST(node = this.root, min = null, max = null) {
        if (!node) return true;
        
        if ((min !== null && node.value <= min) || (max !== null && node.value >= max)) {
            return false;
        }
        
        return this.isValidBST(node.left, min, node.value) && 
               this.isValidBST(node.right, node.value, max);
    }
    
    // Get all values in sorted order (inorder traversal)
    getSortedValues() {
        return this.inorderTraversal();
    }
    
    // Get range of values between min and max
    getRange(min, max) {
        const result = [];
        this.getRangeHelper(this.root, min, max, result);
        return result;
    }
    
    getRangeHelper(node, min, max, result) {
        if (!node) return;
        
        if (node.value >= min && node.value <= max) {
            result.push(node.value);
        }
        
        if (node.value > min) {
            this.getRangeHelper(node.left, min, max, result);
        }
        
        if (node.value < max) {
            this.getRangeHelper(node.right, min, max, result);
        }
    }
    
    // Get BST statistics
    getBSTStats() {
        const stats = this.getStats();
        const bstStats = {
            isValid: this.isValidBST(),
            minValue: this.findMin()?.value || null,
            maxValue: this.findMax()?.value || null,
            sortedValues: this.getSortedValues(),
            rangeCount: (min, max) => this.getRange(min, max).length
        };
        
        return { ...stats, ...bstStats };
    }
    
    // Generate a balanced BST from sorted array
    generateBalancedBST(sortedArray) {
        this.clear();
        this.root = this.buildBalancedBST(sortedArray, 0, sortedArray.length - 1);
        this.size = sortedArray.length;
        this.calculateHeight();
        this.updateDepths();
        return this;
    }
    
    buildBalancedBST(arr, start, end) {
        if (start > end) return null;
        
        const mid = Math.floor((start + end) / 2);
        const node = new TreeNode(arr[mid]);
        
        node.left = this.buildBalancedBST(arr, start, mid - 1);
        node.right = this.buildBalancedBST(arr, mid + 1, end);
        
        if (node.left) node.left.parent = node;
        if (node.right) node.right.parent = node;
        
        return node;
    }
    
    // Generate a sample BST
    generateSampleBST(values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]) {
        this.clear();
        values.forEach(value => this.insert(value));
        return this;
    }
    
    // Get tree type specific information
    getTypeInfo() {
        const info = TreeInfo['bst'];
        if (!info) return TreeInfo['binary-tree'];
        
        // Add BST specific validation
        info.validation = {
            isValidBST: this.isValidBST(),
            isBalanced: this.isBalanced(),
            minValue: this.findMin()?.value || null,
            maxValue: this.findMax()?.value || null
        };
        
        return info;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BST };
}
