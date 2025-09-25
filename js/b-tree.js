/**
 * B-Tree Node Implementation
 */
class BTreeNode {
    constructor(isLeaf = false) {
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
        this.parent = null;
        this.id = Math.random().toString(36).substr(2, 9);
    }
    
    // Get number of keys
    getKeyCount() {
        return this.keys.length;
    }
    
    // Check if node is full
    isFull(maxKeys) {
        return this.keys.length >= maxKeys;
    }
    
    // Check if node has minimum keys
    hasMinKeys(minKeys) {
        return this.keys.length >= minKeys;
    }
    
    // Insert key in sorted order
    insertKey(key) {
        let i = 0;
        while (i < this.keys.length && this.keys[i] < key) {
            i++;
        }
        this.keys.splice(i, 0, key);
    }
    
    // Remove key
    removeKey(key) {
        const index = this.keys.indexOf(key);
        if (index !== -1) {
            this.keys.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Get key index
    getKeyIndex(key) {
        return this.keys.indexOf(key);
    }
    
    // Find child index for key
    findChildIndex(key) {
        let i = 0;
        while (i < this.keys.length && this.keys[i] < key) {
            i++;
        }
        return i;
    }
    
    // Get info for display
    getInfo() {
        return {
            keys: [...this.keys],
            isLeaf: this.isLeaf,
            keyCount: this.getKeyCount(),
            childCount: this.children.length
        };
    }
}

/**
 * B-Tree Implementation
 */
class BTree extends BaseTree {
    constructor(order = 3) {
        super();
        this.type = 'b-tree';
        this.order = order;
        this.minKeys = Math.ceil(order / 2) - 1;
        this.maxKeys = order - 1;
        this.root = new BTreeNode(true);
    }
    
    // Search for a key in the B-tree
    search(key) {
        return this.searchNode(this.root, key);
    }
    
    searchNode(node, key) {
        let i = 0;
        
        // Find the key or the child to search
        while (i < node.getKeyCount() && key > node.keys[i]) {
            i++;
        }
        
        // If key is found
        if (i < node.getKeyCount() && node.keys[i] === key) {
            this.addOperation({ 
                type: 'search', 
                key, 
                node: node.id, 
                step: 'found',
                position: i
            });
            return { node, index: i };
        }
        
        // If leaf node and key not found
        if (node.isLeaf) {
            this.addOperation({ 
                type: 'search', 
                key, 
                node: node.id, 
                step: 'not_found_leaf'
            });
            return null;
        }
        
        // Search in appropriate child
        this.addOperation({ 
            type: 'search', 
            key, 
            node: node.id, 
            step: 'traverse_child',
            childIndex: i
        });
        
        return this.searchNode(node.children[i], key);
    }
    
    // Insert a key into the B-tree
    insert(key) {
        const root = this.root;
        
        // If root is full, split it
        if (root.isFull(this.maxKeys)) {
            this.addOperation({ 
                type: 'insert', 
                key, 
                step: 'root_full_split' 
            });
            
            const newRoot = new BTreeNode(false);
            newRoot.children.push(root);
            root.parent = newRoot;
            this.root = newRoot;
            
            this.splitChild(newRoot, 0);
            this.insertNonFull(newRoot, key);
        } else {
            this.insertNonFull(root, key);
        }
        
        this.size++;
        this.updateStats();
    }
    
    // Insert key into non-full node
    insertNonFull(node, key) {
        let i = node.getKeyCount() - 1;
        
        // If leaf node, insert directly
        if (node.isLeaf) {
            while (i >= 0 && node.keys[i] > key) {
                i--;
            }
            
            node.insertKey(key);
            this.addOperation({ 
                type: 'insert', 
                key, 
                node: node.id, 
                step: 'insert_leaf',
                position: i + 1
            });
        } else {
            // Find child to insert into
            while (i >= 0 && node.keys[i] > key) {
                i--;
            }
            i++;
            
            // If child is full, split it
            if (node.children[i].isFull(this.maxKeys)) {
                this.addOperation({ 
                    type: 'insert', 
                    key, 
                    node: node.id, 
                    step: 'child_full_split',
                    childIndex: i
                });
                
                this.splitChild(node, i);
                
                // Determine which child to insert into
                if (node.keys[i] < key) {
                    i++;
                }
            }
            
            this.insertNonFull(node.children[i], key);
        }
    }
    
    // Split a full child node
    splitChild(parent, childIndex) {
        const fullChild = parent.children[childIndex];
        const newChild = new BTreeNode(fullChild.isLeaf);
        
        // Move half the keys to new child
        const midIndex = Math.floor(this.maxKeys / 2);
        const middleKey = fullChild.keys[midIndex];
        
        // Copy keys to new child
        for (let i = midIndex + 1; i < fullChild.keys.length; i++) {
            newChild.keys.push(fullChild.keys[i]);
        }
        
        // Copy children to new child
        if (!fullChild.isLeaf) {
            for (let i = midIndex + 1; i < fullChild.children.length; i++) {
                newChild.children.push(fullChild.children[i]);
                fullChild.children[i].parent = newChild;
            }
        }
        
        // Remove moved keys and children from full child
        fullChild.keys = fullChild.keys.slice(0, midIndex);
        fullChild.children = fullChild.children.slice(0, midIndex + 1);
        
        // Insert middle key into parent
        parent.insertKey(middleKey);
        
        // Add new child to parent
        parent.children.splice(childIndex + 1, 0, newChild);
        newChild.parent = parent;
        
        this.addOperation({ 
            type: 'split', 
            parent: parent.id, 
            child: fullChild.id, 
            newChild: newChild.id,
            middleKey,
            step: 'split_complete'
        });
    }
    
    // Delete a key from the B-tree
    delete(key) {
        const result = this.search(key);
        if (!result) {
            this.addOperation({ type: 'delete', key, step: 'not_found' });
            return false;
        }
        
        const { node, index } = result;
        this.deleteFromNode(node, key, index);
        this.size--;
        this.updateStats();
        return true;
    }
    
    // Delete key from specific node
    deleteFromNode(node, key, index) {
        // Case 1: Leaf node
        if (node.isLeaf) {
            this.addOperation({ 
                type: 'delete', 
                key, 
                node: node.id, 
                step: 'delete_leaf',
                position: index
            });
            node.removeKey(key);
            
            // Check if node needs merging
            if (node.getKeyCount() < this.minKeys && node !== this.root) {
                this.handleUnderflow(node);
            }
        } else {
            // Case 2: Internal node
            const predecessor = this.getPredecessor(node, index);
            const successor = this.getSuccessor(node, index);
            
            // Try to borrow from left sibling
            if (index > 0 && node.children[index - 1].getKeyCount() > this.minKeys) {
                this.addOperation({ 
                    type: 'delete', 
                    key, 
                    node: node.id, 
                    step: 'borrow_from_left'
                });
                
                const leftChild = node.children[index - 1];
                const borrowedKey = leftChild.keys[leftChild.keys.length - 1];
                
                node.keys[index] = borrowedKey;
                leftChild.removeKey(borrowedKey);
                
                this.deleteFromNode(node.children[index], key, node.children[index].getKeyCount());
            }
            // Try to borrow from right sibling
            else if (index < node.children.length - 1 && node.children[index + 1].getKeyCount() > this.minKeys) {
                this.addOperation({ 
                    type: 'delete', 
                    key, 
                    node: node.id, 
                    step: 'borrow_from_right'
                });
                
                const rightChild = node.children[index + 1];
                const borrowedKey = rightChild.keys[0];
                
                node.keys[index] = borrowedKey;
                rightChild.removeKey(borrowedKey);
                
                this.deleteFromNode(node.children[index], key, 0);
            }
            // Merge with sibling
            else {
                this.addOperation({ 
                    type: 'delete', 
                    key, 
                    node: node.id, 
                    step: 'merge_siblings'
                });
                
                if (index > 0) {
                    this.mergeNodes(node.children[index - 1], node, index - 1);
                    this.deleteFromNode(node.children[index - 1], key, node.children[index - 1].getKeyCount());
                } else {
                    this.mergeNodes(node.children[index], node, index);
                    this.deleteFromNode(node.children[index], key, node.children[index].getKeyCount());
                }
            }
        }
    }
    
    // Handle underflow in node
    handleUnderflow(node) {
        const parent = node.parent;
        const nodeIndex = parent.children.indexOf(node);
        
        // Try to borrow from left sibling
        if (nodeIndex > 0 && parent.children[nodeIndex - 1].getKeyCount() > this.minKeys) {
            this.borrowFromLeftSibling(node, nodeIndex);
        }
        // Try to borrow from right sibling
        else if (nodeIndex < parent.children.length - 1 && parent.children[nodeIndex + 1].getKeyCount() > this.minKeys) {
            this.borrowFromRightSibling(node, nodeIndex);
        }
        // Merge with sibling
        else {
            if (nodeIndex > 0) {
                this.mergeNodes(parent.children[nodeIndex - 1], parent, nodeIndex - 1);
            } else {
                this.mergeNodes(node, parent, nodeIndex);
            }
        }
    }
    
    // Borrow from left sibling
    borrowFromLeftSibling(node, nodeIndex) {
        const parent = node.parent;
        const leftSibling = parent.children[nodeIndex - 1];
        
        // Move key from parent to node
        const parentKey = parent.keys[nodeIndex - 1];
        node.insertKey(parentKey);
        
        // Move key from left sibling to parent
        const siblingKey = leftSibling.keys[leftSibling.keys.length - 1];
        parent.keys[nodeIndex - 1] = siblingKey;
        leftSibling.removeKey(siblingKey);
        
        // Move child if not leaf
        if (!node.isLeaf) {
            const child = leftSibling.children[leftSibling.children.length - 1];
            leftSibling.children.pop();
            node.children.unshift(child);
            child.parent = node;
        }
        
        this.addOperation({ 
            type: 'borrow', 
            node: node.id, 
            sibling: leftSibling.id,
            step: 'borrow_left_complete'
        });
    }
    
    // Borrow from right sibling
    borrowFromRightSibling(node, nodeIndex) {
        const parent = node.parent;
        const rightSibling = parent.children[nodeIndex + 1];
        
        // Move key from parent to node
        const parentKey = parent.keys[nodeIndex];
        node.insertKey(parentKey);
        
        // Move key from right sibling to parent
        const siblingKey = rightSibling.keys[0];
        parent.keys[nodeIndex] = siblingKey;
        rightSibling.removeKey(siblingKey);
        
        // Move child if not leaf
        if (!node.isLeaf) {
            const child = rightSibling.children[0];
            rightSibling.children.shift();
            node.children.push(child);
            child.parent = node;
        }
        
        this.addOperation({ 
            type: 'borrow', 
            node: node.id, 
            sibling: rightSibling.id,
            step: 'borrow_right_complete'
        });
    }
    
    // Merge two nodes
    mergeNodes(leftNode, parent, keyIndex) {
        const rightNode = parent.children[keyIndex + 1];
        
        // Move key from parent to left node
        leftNode.keys.push(parent.keys[keyIndex]);
        
        // Move all keys from right node to left node
        for (let key of rightNode.keys) {
            leftNode.keys.push(key);
        }
        
        // Move all children from right node to left node
        if (!leftNode.isLeaf) {
            for (let child of rightNode.children) {
                leftNode.children.push(child);
                child.parent = leftNode;
            }
        }
        
        // Remove key and right node from parent
        parent.removeKey(parent.keys[keyIndex]);
        parent.children.splice(keyIndex + 1, 1);
        
        this.addOperation({ 
            type: 'merge', 
            leftNode: leftNode.id, 
            rightNode: rightNode.id,
            parent: parent.id,
            step: 'merge_complete'
        });
        
        // If root becomes empty, make left node the new root
        if (parent === this.root && parent.getKeyCount() === 0) {
            this.root = leftNode;
            leftNode.parent = null;
            this.addOperation({ 
                type: 'merge', 
                step: 'new_root',
                newRoot: leftNode.id
            });
        }
    }
    
    // Get predecessor of key at index
    getPredecessor(node, index) {
        let current = node.children[index];
        while (!current.isLeaf) {
            current = current.children[current.children.length - 1];
        }
        return current.keys[current.keys.length - 1];
    }
    
    // Get successor of key at index
    getSuccessor(node, index) {
        let current = node.children[index + 1];
        while (!current.isLeaf) {
            current = current.children[0];
        }
        return current.keys[0];
    }
    
    // Update node statistics
    updateStats() {
        this.calculateTreeHeight();
        this.updateNodeDepths();
    }
    
    // Calculate tree height
    calculateTreeHeight() {
        let height = 0;
        let current = this.root;
        
        while (current && !current.isLeaf) {
            height++;
            current = current.children[0];
        }
        
        this.height = height;
        return height;
    }
    
    // Update depths of all nodes
    updateNodeDepths(node = this.root, depth = 0) {
        if (!node) return;
        
        node.depth = depth;
        
        if (!node.isLeaf) {
            for (let child of node.children) {
                this.updateNodeDepths(child, depth + 1);
            }
        }
    }
    
    // Get B-tree statistics
    getBTreeStats() {
        const stats = {
            order: this.order,
            minKeys: this.minKeys,
            maxKeys: this.maxKeys,
            height: this.calculateTreeHeight(),
            size: this.size,
            isValidBTree: this.isValidBTree(),
            nodeCount: this.getNodeCount(),
            leafCount: this.getLeafCount()
        };
        
        return stats;
    }
    
    // Check if B-tree is valid
    isValidBTree() {
        return this.validateBTree(this.root);
    }
    
    validateBTree(node) {
        if (!node) return true;
        
        // Check key count
        if (node !== this.root && !node.hasMinKeys(this.minKeys)) {
            return false;
        }
        
        if (node.getKeyCount() > this.maxKeys) {
            return false;
        }
        
        // Check key ordering
        for (let i = 1; i < node.keys.length; i++) {
            if (node.keys[i] <= node.keys[i - 1]) {
                return false;
            }
        }
        
        // Check children
        if (!node.isLeaf) {
            if (node.children.length !== node.keys.length + 1) {
                return false;
            }
            
            // Recursively check children
            for (let child of node.children) {
                if (!this.validateBTree(child)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Get total node count
    getNodeCount(node = this.root) {
        if (!node) return 0;
        
        let count = 1;
        if (!node.isLeaf) {
            for (let child of node.children) {
                count += this.getNodeCount(child);
            }
        }
        
        return count;
    }
    
    // Get leaf node count
    getLeafCount(node = this.root) {
        if (!node) return 0;
        
        if (node.isLeaf) {
            return 1;
        }
        
        let count = 0;
        for (let child of node.children) {
            count += this.getLeafCount(child);
        }
        
        return count;
    }
    
    // Get tree structure for visualization
    getTreeStructure() {
        return this.buildTreeStructure(this.root);
    }
    
    buildTreeStructure(node) {
        if (!node) return null;
        
        const structure = {
            id: node.id,
            keys: [...node.keys],
            isLeaf: node.isLeaf,
            depth: node.depth,
            children: []
        };
        
        if (!node.isLeaf) {
            for (let child of node.children) {
                structure.children.push(this.buildTreeStructure(child));
            }
        }
        
        return structure;
    }
    
    // Clear the B-tree
    clear() {
        this.root = new BTreeNode(true);
        this.size = 0;
        this.operationHistory = [];
        this.currentStep = 0;
    }
    
    // Generate sample B-tree
    generateSampleBTree(values = [10, 20, 5, 6, 12, 30, 7, 17]) {
        this.clear();
        values.forEach(value => this.insert(value));
        return this;
    }
    
    // Get tree type specific information
    getTypeInfo() {
        const info = TreeInfo['b-tree'];
        if (!info) return TreeInfo['binary-tree'];
        
        // Add B-tree specific validation
        info.validation = {
            isValidBTree: this.isValidBTree(),
            order: this.order,
            height: this.calculateTreeHeight(),
            nodeCount: this.getNodeCount(),
            leafCount: this.getLeafCount()
        };
        
        return info;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BTree, BTreeNode };
}
