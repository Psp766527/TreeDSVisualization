/**
 * Red-Black Tree Implementation (Self-Balancing Binary Search Tree)
 */
class RedBlackTree extends BST {
    constructor() {
        super();
        this.type = 'red-black';
        this.nullNode = new TreeNode(null);
        this.nullNode.isNull = true;
        this.nullNode.color = 'black';
        this.nullNode.isRed = false;
    }
    
    // Override insert to include Red-Black properties
    insert(value) {
        const newNode = new TreeNode(value);
        newNode.color = 'red';
        newNode.isRed = true;
        newNode.left = this.nullNode;
        newNode.right = this.nullNode;
        
        if (!this.root) {
            this.root = newNode;
            this.root.color = 'black';
            this.root.isRed = false;
            this.size = 1;
            this.addOperation({ 
                type: 'insert', 
                value, 
                node: newNode.id, 
                step: 'create_root',
                color: 'black'
            });
            return newNode;
        }
        
        const insertedNode = this.insertNode(this.root, newNode);
        if (insertedNode) {
            this.insertFixup(insertedNode);
        }
        return insertedNode;
    }
    
    insertNode(current, newNode) {
        if (newNode.value < current.value) {
            if (current.left === this.nullNode) {
                current.left = newNode;
                newNode.parent = current;
                this.size++;
                this.addOperation({ 
                    type: 'insert', 
                    value: newNode.value, 
                    node: newNode.id, 
                    parent: current.id, 
                    step: 'insert_left',
                    comparison: `${newNode.value} < ${current.value}`,
                    color: 'red'
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
            if (current.right === this.nullNode) {
                current.right = newNode;
                newNode.parent = current;
                this.size++;
                this.addOperation({ 
                    type: 'insert', 
                    value: newNode.value, 
                    node: newNode.id, 
                    parent: current.id, 
                    step: 'insert_right',
                    comparison: `${newNode.value} > ${current.value}`,
                    color: 'red'
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
                message: 'Duplicate values not allowed in Red-Black Tree'
            });
            return null;
        }
    }
    
    // Fix Red-Black properties after insertion
    insertFixup(node) {
        while (node.parent && node.parent.isRed) {
            if (node.parent === node.parent.parent.left) {
                const uncle = node.parent.parent.right;
                
                // Case 1: Uncle is red
                if (uncle && uncle.isRed) {
                    this.addOperation({ 
                        type: 'fixup', 
                        step: 'case1_recolor',
                        node: node.id,
                        uncle: uncle.id,
                        parent: node.parent.id,
                        grandparent: node.parent.parent.id
                    });
                    
                    node.parent.color = 'black';
                    node.parent.isRed = false;
                    uncle.color = 'black';
                    uncle.isRed = false;
                    node.parent.parent.color = 'red';
                    node.parent.parent.isRed = true;
                    node = node.parent.parent;
                } else {
                    // Case 2: Uncle is black and node is right child
                    if (node === node.parent.right) {
                        this.addOperation({ 
                            type: 'fixup', 
                            step: 'case2_left_rotate',
                            node: node.id,
                            parent: node.parent.id
                        });
                        
                        node = node.parent;
                        this.leftRotate(node);
                    }
                    
                    // Case 3: Uncle is black and node is left child
                    this.addOperation({ 
                        type: 'fixup', 
                        step: 'case3_right_rotate',
                        node: node.id,
                        parent: node.parent.id,
                        grandparent: node.parent.parent.id
                    });
                    
                    node.parent.color = 'black';
                    node.parent.isRed = false;
                    node.parent.parent.color = 'red';
                    node.parent.parent.isRed = true;
                    this.rightRotate(node.parent.parent);
                }
            } else {
                // Symmetric case (parent is right child)
                const uncle = node.parent.parent.left;
                
                if (uncle && uncle.isRed) {
                    this.addOperation({ 
                        type: 'fixup', 
                        step: 'case1_recolor_symmetric',
                        node: node.id,
                        uncle: uncle.id,
                        parent: node.parent.id,
                        grandparent: node.parent.parent.id
                    });
                    
                    node.parent.color = 'black';
                    node.parent.isRed = false;
                    uncle.color = 'black';
                    uncle.isRed = false;
                    node.parent.parent.color = 'red';
                    node.parent.parent.isRed = true;
                    node = node.parent.parent;
                } else {
                    if (node === node.parent.left) {
                        this.addOperation({ 
                            type: 'fixup', 
                            step: 'case2_right_rotate',
                            node: node.id,
                            parent: node.parent.id
                        });
                        
                        node = node.parent;
                        this.rightRotate(node);
                    }
                    
                    this.addOperation({ 
                        type: 'fixup', 
                        step: 'case3_left_rotate',
                        node: node.id,
                        parent: node.parent.id,
                        grandparent: node.parent.parent.id
                    });
                    
                    node.parent.color = 'black';
                    node.parent.isRed = false;
                    node.parent.parent.color = 'red';
                    node.parent.parent.isRed = true;
                    this.leftRotate(node.parent.parent);
                }
            }
        }
        
        this.root.color = 'black';
        this.root.isRed = false;
        this.addOperation({ 
            type: 'fixup', 
            step: 'root_black',
            node: this.root.id
        });
    }
    
    // Override delete to include Red-Black properties
    delete(value) {
        const nodeToDelete = this.findNode(value);
        if (!nodeToDelete) {
            this.addOperation({ type: 'delete', value, step: 'not_found' });
            return false;
        }
        
        this.deleteNode(nodeToDelete);
        this.size--;
        this.calculateHeight();
        this.updateDepths();
        return true;
    }
    
    deleteNode(node) {
        let y = node;
        let yOriginalColor = y.color;
        let x;
        
        if (node.left === this.nullNode) {
            x = node.right;
            this.transplant(node, node.right);
        } else if (node.right === this.nullNode) {
            x = node.left;
            this.transplant(node, node.left);
        } else {
            y = this.findMin(node.right);
            yOriginalColor = y.color;
            x = y.right;
            
            if (y.parent === node) {
                x.parent = y;
            } else {
                this.transplant(y, y.right);
                y.right = node.right;
                y.right.parent = y;
            }
            
            this.transplant(node, y);
            y.left = node.left;
            y.left.parent = y;
            y.color = node.color;
        }
        
        if (yOriginalColor === 'black') {
            this.deleteFixup(x);
        }
    }
    
    // Fix Red-Black properties after deletion
    deleteFixup(node) {
        while (node !== this.root && !node.isRed) {
            if (node === node.parent.left) {
                let sibling = node.parent.right;
                
                // Case 1: Sibling is red
                if (sibling.isRed) {
                    this.addOperation({ 
                        type: 'delete_fixup', 
                        step: 'case1_sibling_red',
                        node: node.id,
                        sibling: sibling.id
                    });
                    
                    sibling.color = 'black';
                    sibling.isRed = false;
                    node.parent.color = 'red';
                    node.parent.isRed = true;
                    this.leftRotate(node.parent);
                    sibling = node.parent.right;
                }
                
                // Case 2: Sibling is black with black children
                if (!sibling.left.isRed && !sibling.right.isRed) {
                    this.addOperation({ 
                        type: 'delete_fixup', 
                        step: 'case2_sibling_black_children',
                        node: node.id,
                        sibling: sibling.id
                    });
                    
                    sibling.color = 'red';
                    sibling.isRed = true;
                    node = node.parent;
                } else {
                    // Case 3: Sibling is black with red left child
                    if (!sibling.right.isRed) {
                        this.addOperation({ 
                            type: 'delete_fixup', 
                            step: 'case3_sibling_black_left_red',
                            node: node.id,
                            sibling: sibling.id
                        });
                        
                        sibling.left.color = 'black';
                        sibling.left.isRed = false;
                        sibling.color = 'red';
                        sibling.isRed = true;
                        this.rightRotate(sibling);
                        sibling = node.parent.right;
                    }
                    
                    // Case 4: Sibling is black with red right child
                    this.addOperation({ 
                        type: 'delete_fixup', 
                        step: 'case4_sibling_black_right_red',
                        node: node.id,
                        sibling: sibling.id
                    });
                    
                    sibling.color = node.parent.color;
                    sibling.isRed = node.parent.isRed;
                    node.parent.color = 'black';
                    node.parent.isRed = false;
                    sibling.right.color = 'black';
                    sibling.right.isRed = false;
                    this.leftRotate(node.parent);
                    node = this.root;
                }
            } else {
                // Symmetric case
                let sibling = node.parent.left;
                
                if (sibling.isRed) {
                    sibling.color = 'black';
                    sibling.isRed = false;
                    node.parent.color = 'red';
                    node.parent.isRed = true;
                    this.rightRotate(node.parent);
                    sibling = node.parent.left;
                }
                
                if (!sibling.right.isRed && !sibling.left.isRed) {
                    sibling.color = 'red';
                    sibling.isRed = true;
                    node = node.parent;
                } else {
                    if (!sibling.left.isRed) {
                        sibling.right.color = 'black';
                        sibling.right.isRed = false;
                        sibling.color = 'red';
                        sibling.isRed = true;
                        this.leftRotate(sibling);
                        sibling = node.parent.left;
                    }
                    
                    sibling.color = node.parent.color;
                    sibling.isRed = node.parent.isRed;
                    node.parent.color = 'black';
                    node.parent.isRed = false;
                    sibling.left.color = 'black';
                    sibling.left.isRed = false;
                    this.rightRotate(node.parent);
                    node = this.root;
                }
            }
        }
        
        node.color = 'black';
        node.isRed = false;
    }
    
    // Transplant helper function
    transplant(u, v) {
        if (!u.parent) {
            this.root = v;
        } else if (u === u.parent.left) {
            u.parent.left = v;
        } else {
            u.parent.right = v;
        }
        v.parent = u.parent;
    }
    
    // Left rotation for Red-Black tree
    leftRotate(x) {
        const y = x.right;
        x.right = y.left;
        
        if (y.left !== this.nullNode) {
            y.left.parent = x;
        }
        
        y.parent = x.parent;
        
        if (!x.parent) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }
        
        y.left = x;
        x.parent = y;
        
        this.addOperation({ 
            type: 'rotation', 
            rotation: 'left', 
            pivot: x.id, 
            newRoot: y.id 
        });
    }
    
    // Right rotation for Red-Black tree
    rightRotate(y) {
        const x = y.left;
        y.left = x.right;
        
        if (x.right !== this.nullNode) {
            x.right.parent = y;
        }
        
        x.parent = y.parent;
        
        if (!y.parent) {
            this.root = x;
        } else if (y === y.parent.left) {
            y.parent.left = x;
        } else {
            y.parent.right = x;
        }
        
        x.right = y;
        y.parent = x;
        
        this.addOperation({ 
            type: 'rotation', 
            rotation: 'right', 
            pivot: y.id, 
            newRoot: x.id 
        });
    }
    
    // Check Red-Black properties
    checkRedBlackProperties() {
        const violations = [];
        
        // Property 1: Root is black
        if (this.root && this.root.isRed) {
            violations.push({ property: 'Root must be black', node: this.root.id });
        }
        
        // Property 2: Red nodes have black children
        this.checkRedChildren(this.root, violations);
        
        // Property 3: Black height is same for all paths
        const blackHeights = [];
        this.calculateBlackHeight(this.root, 0, blackHeights);
        if (new Set(blackHeights).size > 1) {
            violations.push({ property: 'Black height must be same for all paths' });
        }
        
        return violations;
    }
    
    checkRedChildren(node, violations) {
        if (!node || node === this.nullNode) return;
        
        if (node.isRed) {
            if ((node.left && node.left.isRed) || (node.right && node.right.isRed)) {
                violations.push({ 
                    property: 'Red node cannot have red children', 
                    node: node.id 
                });
            }
        }
        
        this.checkRedChildren(node.left, violations);
        this.checkRedChildren(node.right, violations);
    }
    
    calculateBlackHeight(node, currentHeight, heights) {
        if (!node || node === this.nullNode) {
            heights.push(currentHeight);
            return;
        }
        
        const height = node.isRed ? currentHeight : currentHeight + 1;
        this.calculateBlackHeight(node.left, height, heights);
        this.calculateBlackHeight(node.right, height, heights);
    }
    
    // Get all nodes with their colors
    getNodeColors() {
        const colors = [];
        this.collectNodeColors(this.root, colors);
        return colors;
    }
    
    collectNodeColors(node, colors) {
        if (!node || node === this.nullNode) return;
        
        colors.push({
            value: node.value,
            id: node.id,
            color: node.color,
            isRed: node.isRed,
            isBlack: !node.isRed
        });
        
        this.collectNodeColors(node.left, colors);
        this.collectNodeColors(node.right, colors);
    }
    
    // Get Red-Black tree statistics
    getRedBlackStats() {
        const stats = this.getBSTStats();
        const rbStats = {
            isValidRB: this.checkRedBlackProperties().length === 0,
            violations: this.checkRedBlackProperties(),
            nodeColors: this.getNodeColors(),
            redNodes: this.getNodeColors().filter(n => n.isRed).length,
            blackNodes: this.getNodeColors().filter(n => n.isBlack).length,
            blackHeight: this.calculateBlackHeight(this.root, 0, [])
        };
        
        return { ...stats, ...rbStats };
    }
    
    // Generate a sample Red-Black tree
    generateSampleRB(values = [41, 38, 31, 12, 19, 8]) {
        this.clear();
        values.forEach(value => this.insert(value));
        return this;
    }
    
    // Get tree type specific information
    getTypeInfo() {
        const info = TreeInfo['red-black'];
        if (!info) return TreeInfo['bst'];
        
        // Add Red-Black specific validation
        info.validation = {
            isValidBST: this.isValidBST(),
            isValidRB: this.checkRedBlackProperties().length === 0,
            violations: this.checkRedBlackProperties(),
            nodeColors: this.getNodeColors()
        };
        
        return info;
    }
    
    // Override update value to maintain Red-Black properties
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
    
    // Clear the tree and reset null node
    clear() {
        super.clear();
        this.nullNode = new TreeNode(null);
        this.nullNode.isNull = true;
        this.nullNode.color = 'black';
        this.nullNode.isRed = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RedBlackTree };
}
