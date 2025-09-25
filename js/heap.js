/**
 * Heap Implementation (Min Heap and Max Heap)
 */
class Heap extends BaseTree {
    constructor(type = 'min-heap') {
        super();
        this.type = type;
        this.heap = [];
        this.size = 0;
    }
    
    // Get parent index
    getParentIndex(index) {
        return Math.floor((index - 1) / 2);
    }
    
    // Get left child index
    getLeftChildIndex(index) {
        return 2 * index + 1;
    }
    
    // Get right child index
    getRightChildIndex(index) {
        return 2 * index + 2;
    }
    
    // Check if index has parent
    hasParent(index) {
        return this.getParentIndex(index) >= 0;
    }
    
    // Check if index has left child
    hasLeftChild(index) {
        return this.getLeftChildIndex(index) < this.size;
    }
    
    // Check if index has right child
    hasRightChild(index) {
        return this.getRightChildIndex(index) < this.size;
    }
    
    // Get parent value
    getParent(index) {
        return this.heap[this.getParentIndex(index)];
    }
    
    // Get left child value
    getLeftChild(index) {
        return this.heap[this.getLeftChildIndex(index)];
    }
    
    // Get right child value
    getRightChild(index) {
        return this.heap[this.getRightChildIndex(index)];
    }
    
    // Swap two elements
    swap(index1, index2) {
        const temp = this.heap[index1];
        this.heap[index1] = this.heap[index2];
        this.heap[index2] = temp;
        
        this.addOperation({ 
            type: 'swap', 
            index1, 
            index2, 
            value1: this.heap[index1], 
            value2: this.heap[index2] 
        });
    }
    
    // Insert a value into the heap
    insert(value) {
        this.heap.push(value);
        this.size++;
        
        this.addOperation({ 
            type: 'insert', 
            value, 
            index: this.size - 1, 
            step: 'add_to_end' 
        });
        
        this.heapifyUp();
        return value;
    }
    
    // Extract root element (min or max depending on heap type)
    extract() {
        if (this.size === 0) {
            this.addOperation({ type: 'extract', step: 'empty_heap' });
            return null;
        }
        
        if (this.size === 1) {
            const value = this.heap.pop();
            this.size = 0;
            this.addOperation({ type: 'extract', step: 'extract_root', value });
            return value;
        }
        
        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.size--;
        
        this.addOperation({ 
            type: 'extract', 
            step: 'replace_root', 
            root, 
            newRoot: this.heap[0] 
        });
        
        this.heapifyDown();
        return root;
    }
    
    // Peek at root without removing
    peek() {
        if (this.size === 0) return null;
        return this.heap[0];
    }
    
    // Heapify up (for insertion)
    heapifyUp() {
        let index = this.size - 1;
        
        while (this.hasParent(index) && this.shouldSwapWithParent(index)) {
            const parentIndex = this.getParentIndex(index);
            
            this.addOperation({ 
                type: 'heapify_up', 
                index, 
                parentIndex, 
                value: this.heap[index], 
                parentValue: this.heap[parentIndex] 
            });
            
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    
    // Heapify down (for deletion)
    heapifyDown() {
        let index = 0;
        
        while (this.hasLeftChild(index)) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            
            if (this.hasRightChild(index) && this.shouldSwapChildren(index)) {
                smallerChildIndex = this.getRightChildIndex(index);
            }
            
            if (!this.shouldSwapWithChild(index, smallerChildIndex)) {
                break;
            }
            
            this.addOperation({ 
                type: 'heapify_down', 
                index, 
                childIndex: smallerChildIndex, 
                value: this.heap[index], 
                childValue: this.heap[smallerChildIndex] 
            });
            
            this.swap(index, smallerChildIndex);
            index = smallerChildIndex;
        }
    }
    
    // Check if should swap with parent (depends on heap type)
    shouldSwapWithParent(index) {
        const parentIndex = this.getParentIndex(index);
        if (this.type === 'min-heap') {
            return this.heap[index] < this.heap[parentIndex];
        } else {
            return this.heap[index] > this.heap[parentIndex];
        }
    }
    
    // Check if should swap children (depends on heap type)
    shouldSwapChildren(index) {
        const leftChild = this.getLeftChild(index);
        const rightChild = this.getRightChild(index);
        
        if (this.type === 'min-heap') {
            return rightChild < leftChild;
        } else {
            return rightChild > leftChild;
        }
    }
    
    // Check if should swap with child (depends on heap type)
    shouldSwapWithChild(index, childIndex) {
        if (this.type === 'min-heap') {
            return this.heap[index] > this.heap[childIndex];
        } else {
            return this.heap[index] < this.heap[childIndex];
        }
    }
    
    // Build heap from array
    buildHeap(array) {
        this.heap = [...array];
        this.size = array.length;
        
        this.addOperation({ type: 'build_heap', array: [...array] });
        
        // Start from last parent and heapify down
        for (let i = Math.floor(this.size / 2) - 1; i >= 0; i--) {
            this.heapifyDownFromIndex(i);
        }
        
        this.addOperation({ type: 'build_heap', step: 'complete' });
    }
    
    // Heapify down from specific index
    heapifyDownFromIndex(index) {
        while (this.hasLeftChild(index)) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            
            if (this.hasRightChild(index) && this.shouldSwapChildren(index)) {
                smallerChildIndex = this.getRightChildIndex(index);
            }
            
            if (!this.shouldSwapWithChild(index, smallerChildIndex)) {
                break;
            }
            
            this.swap(index, smallerChildIndex);
            index = smallerChildIndex;
        }
    }
    
    // Delete value at specific index
    deleteAtIndex(index) {
        if (index >= this.size) return false;
        
        // Move last element to index
        this.heap[index] = this.heap[this.size - 1];
        this.heap.pop();
        this.size--;
        
        this.addOperation({ 
            type: 'delete', 
            index, 
            step: 'replace_with_last' 
        });
        
        // Heapify up or down as needed
        if (this.hasParent(index) && this.shouldSwapWithParent(index)) {
            this.heapifyUpFromIndex(index);
        } else {
            this.heapifyDownFromIndex(index);
        }
        
        return true;
    }
    
    // Heapify up from specific index
    heapifyUpFromIndex(index) {
        while (this.hasParent(index) && this.shouldSwapWithParent(index)) {
            const parentIndex = this.getParentIndex(index);
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    
    // Search for a value (returns index)
    search(value) {
        for (let i = 0; i < this.size; i++) {
            if (this.heap[i] === value) {
                this.addOperation({ type: 'search', value, index: i, found: true });
                return i;
            }
        }
        this.addOperation({ type: 'search', value, found: false });
        return -1;
    }
    
    // Update value at index
    updateAtIndex(index, newValue) {
        if (index >= this.size) return false;
        
        const oldValue = this.heap[index];
        this.heap[index] = newValue;
        
        this.addOperation({ 
            type: 'update', 
            index, 
            oldValue, 
            newValue, 
            step: 'value_updated' 
        });
        
        // Heapify up or down as needed
        if (this.hasParent(index) && this.shouldSwapWithParent(index)) {
            this.heapifyUpFromIndex(index);
        } else {
            this.heapifyDownFromIndex(index);
        }
        
        return true;
    }
    
    // Get heap as tree structure for visualization
    getTreeStructure() {
        if (this.size === 0) return null;
        
        const buildTree = (index) => {
            if (index >= this.size) return null;
            
            const node = new TreeNode(this.heap[index]);
            node.id = `heap-${index}`;
            node.depth = Math.floor(Math.log2(index + 1));
            
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);
            
            if (leftChildIndex < this.size) {
                node.left = buildTree(leftChildIndex);
                if (node.left) node.left.parent = node;
            }
            
            if (rightChildIndex < this.size) {
                node.right = buildTree(rightChildIndex);
                if (node.right) node.right.parent = node;
            }
            
            return node;
        };
        
        this.root = buildTree(0);
        this.calculateHeight();
        this.updateDepths();
        return this.root;
    }
    
    // Check if heap property is maintained
    isHeap() {
        for (let i = 0; i < this.size; i++) {
            const leftChildIndex = this.getLeftChildIndex(i);
            const rightChildIndex = this.getRightChildIndex(i);
            
            // Check left child
            if (leftChildIndex < this.size && !this.isValidParentChild(i, leftChildIndex)) {
                return false;
            }
            
            // Check right child
            if (rightChildIndex < this.size && !this.isValidParentChild(i, rightChildIndex)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Check if parent-child relationship is valid
    isValidParentChild(parentIndex, childIndex) {
        if (this.type === 'min-heap') {
            return this.heap[parentIndex] <= this.heap[childIndex];
        } else {
            return this.heap[parentIndex] >= this.heap[childIndex];
        }
    }
    
    // Get heap statistics
    getHeapStats() {
        const stats = {
            size: this.size,
            type: this.type,
            root: this.peek(),
            isHeap: this.isHeap(),
            height: Math.floor(Math.log2(this.size)),
            lastLevelNodes: this.getLastLevelNodeCount(),
            heapArray: [...this.heap]
        };
        
        return stats;
    }
    
    // Get number of nodes in last level
    getLastLevelNodeCount() {
        if (this.size === 0) return 0;
        
        const height = Math.floor(Math.log2(this.size));
        const maxNodesAtHeight = Math.pow(2, height);
        const totalNodesAtHeight = Math.pow(2, height + 1) - 1;
        
        if (this.size <= totalNodesAtHeight - maxNodesAtHeight) {
            return 0;
        }
        
        return this.size - (totalNodesAtHeight - maxNodesAtHeight);
    }
    
    // Clear the heap
    clear() {
        this.heap = [];
        this.size = 0;
        this.root = null;
        this.operationHistory = [];
        this.currentStep = 0;
    }
    
    // Generate sample heap
    generateSampleHeap(values = [10, 20, 15, 30, 40]) {
        this.clear();
        this.buildHeap(values);
        return this;
    }
    
    // Get tree type specific information
    getTypeInfo() {
        const info = TreeInfo[this.type];
        if (!info) return TreeInfo['min-heap'];
        
        // Add heap specific validation
        info.validation = {
            isHeap: this.isHeap(),
            root: this.peek(),
            size: this.size,
            height: Math.floor(Math.log2(this.size))
        };
        
        return info;
    }
    
    // Override traversal methods for heap
    levelOrderTraversal() {
        return [...this.heap];
    }
    
    // Heap sort implementation
    heapSort(array) {
        this.buildHeap(array);
        const sorted = [];
        
        while (this.size > 0) {
            sorted.push(this.extract());
        }
        
        return sorted;
    }
}

/**
 * Min Heap Implementation
 */
class MinHeap extends Heap {
    constructor() {
        super('min-heap');
    }
    
    // Extract minimum
    extractMin() {
        return this.extract();
    }
    
    // Get minimum
    getMin() {
        return this.peek();
    }
}

/**
 * Max Heap Implementation
 */
class MaxHeap extends Heap {
    constructor() {
        super('max-heap');
    }
    
    // Extract maximum
    extractMax() {
        return this.extract();
    }
    
    // Get maximum
    getMax() {
        return this.peek();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Heap, MinHeap, MaxHeap };
}
