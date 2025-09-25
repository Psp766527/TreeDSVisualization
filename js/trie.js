/**
 * Trie Node Implementation
 */
class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.value = null;
        this.parent = null;
        this.id = Math.random().toString(36).substr(2, 9);
        this.depth = 0;
    }
    
    // Add child node
    addChild(char, node) {
        this.children.set(char, node);
        node.parent = this;
        node.depth = this.depth + 1;
    }
    
    // Get child node
    getChild(char) {
        return this.children.get(char);
    }
    
    // Check if has child
    hasChild(char) {
        return this.children.has(char);
    }
    
    // Remove child
    removeChild(char) {
        return this.children.delete(char);
    }
    
    // Get all children characters
    getChildrenChars() {
        return Array.from(this.children.keys());
    }
    
    // Get info for display
    getInfo() {
        return {
            isEndOfWord: this.isEndOfWord,
            value: this.value,
            childrenCount: this.children.size,
            children: this.getChildrenChars(),
            depth: this.depth
        };
    }
}

/**
 * Trie Implementation
 */
class Trie extends BaseTree {
    constructor() {
        super();
        this.type = 'trie';
        this.root = new TrieNode();
        this.size = 0;
    }
    
    // Insert a word into the trie
    insert(word) {
        if (!word || word.length === 0) {
            this.addOperation({ type: 'insert', word, step: 'empty_word' });
            return false;
        }
        
        let current = this.root;
        const path = [];
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            path.push(char);
            
            if (!current.hasChild(char)) {
                const newNode = new TrieNode();
                newNode.value = char;
                current.addChild(char, newNode);
                
                this.addOperation({ 
                    type: 'insert', 
                    word, 
                    char, 
                    step: 'create_node',
                    node: newNode.id,
                    path: path.join('')
                });
            } else {
                this.addOperation({ 
                    type: 'insert', 
                    word, 
                    char, 
                    step: 'traverse_existing',
                    node: current.getChild(char).id,
                    path: path.join('')
                });
            }
            
            current = current.getChild(char);
        }
        
        if (!current.isEndOfWord) {
            current.isEndOfWord = true;
            this.size++;
            this.addOperation({ 
                type: 'insert', 
                word, 
                step: 'mark_end',
                node: current.id
            });
        } else {
            this.addOperation({ 
                type: 'insert', 
                word, 
                step: 'already_exists'
            });
        }
        
        return true;
    }
    
    // Search for a word in the trie
    search(word) {
        if (!word || word.length === 0) {
            this.addOperation({ type: 'search', word, step: 'empty_word' });
            return false;
        }
        
        let current = this.root;
        const path = [];
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            path.push(char);
            
            if (!current.hasChild(char)) {
                this.addOperation({ 
                    type: 'search', 
                    word, 
                    char, 
                    step: 'char_not_found',
                    path: path.join('')
                });
                return false;
            }
            
            this.addOperation({ 
                type: 'search', 
                word, 
                char, 
                step: 'traverse',
                node: current.getChild(char).id,
                path: path.join('')
            });
            
            current = current.getChild(char);
        }
        
        const found = current.isEndOfWord;
        this.addOperation({ 
            type: 'search', 
            word, 
            step: found ? 'found' : 'not_end_of_word',
            node: current.id
        });
        
        return found;
    }
    
    // Check if prefix exists
    startsWith(prefix) {
        if (!prefix || prefix.length === 0) {
            this.addOperation({ type: 'startsWith', prefix, step: 'empty_prefix' });
            return false;
        }
        
        let current = this.root;
        const path = [];
        
        for (let i = 0; i < prefix.length; i++) {
            const char = prefix[i];
            path.push(char);
            
            if (!current.hasChild(char)) {
                this.addOperation({ 
                    type: 'startsWith', 
                    prefix, 
                    char, 
                    step: 'char_not_found',
                    path: path.join('')
                });
                return false;
            }
            
            this.addOperation({ 
                type: 'startsWith', 
                prefix, 
                char, 
                step: 'traverse',
                node: current.getChild(char).id,
                path: path.join('')
            });
            
            current = current.getChild(char);
        }
        
        this.addOperation({ 
            type: 'startsWith', 
            prefix, 
            step: 'prefix_found',
            node: current.id
        });
        
        return true;
    }
    
    // Delete a word from the trie
    delete(word) {
        if (!word || word.length === 0) {
            this.addOperation({ type: 'delete', word, step: 'empty_word' });
            return false;
        }
        
        const result = this.deleteHelper(this.root, word, 0);
        
        if (result) {
            this.size--;
            this.addOperation({ type: 'delete', word, step: 'delete_complete' });
        } else {
            this.addOperation({ type: 'delete', word, step: 'word_not_found' });
        }
        
        return result;
    }
    
    // Helper function for deletion
    deleteHelper(node, word, index) {
        if (index === word.length) {
            // End of word reached
            if (!node.isEndOfWord) {
                return false; // Word doesn't exist
            }
            
            node.isEndOfWord = false;
            this.addOperation({ 
                type: 'delete', 
                word, 
                step: 'unmark_end',
                node: node.id
            });
            
            // If node has no children, it can be deleted
            return node.children.size === 0;
        }
        
        const char = word[index];
        const child = node.getChild(char);
        
        if (!child) {
            return false; // Word doesn't exist
        }
        
        this.addOperation({ 
            type: 'delete', 
            word, 
            char, 
            step: 'traverse_delete',
            node: child.id
        });
        
        const shouldDeleteChild = this.deleteHelper(child, word, index + 1);
        
        if (shouldDeleteChild) {
            node.removeChild(char);
            this.addOperation({ 
                type: 'delete', 
                word, 
                char, 
                step: 'remove_node',
                node: child.id
            });
            
            // If current node is not end of word and has no children, it can be deleted
            return !node.isEndOfWord && node.children.size === 0;
        }
        
        return false;
    }
    
    // Get all words with given prefix
    getWordsWithPrefix(prefix) {
        if (!prefix || prefix.length === 0) {
            this.addOperation({ type: 'getWordsWithPrefix', prefix, step: 'empty_prefix' });
            return this.getAllWords();
        }
        
        let current = this.root;
        
        // Navigate to prefix node
        for (let char of prefix) {
            if (!current.hasChild(char)) {
                this.addOperation({ 
                    type: 'getWordsWithPrefix', 
                    prefix, 
                    step: 'prefix_not_found' 
                });
                return [];
            }
            current = current.getChild(char);
        }
        
        // Collect all words from this node
        const words = [];
        this.collectWords(current, prefix, words);
        
        this.addOperation({ 
            type: 'getWordsWithPrefix', 
            prefix, 
            step: 'found_words',
            count: words.length
        });
        
        return words;
    }
    
    // Get all words in the trie
    getAllWords() {
        const words = [];
        this.collectWords(this.root, '', words);
        
        this.addOperation({ 
            type: 'getAllWords', 
            step: 'collected_all',
            count: words.length
        });
        
        return words;
    }
    
    // Helper function to collect words
    collectWords(node, prefix, words) {
        if (node.isEndOfWord) {
            words.push(prefix);
        }
        
        for (let [char, child] of node.children) {
            this.collectWords(child, prefix + char, words);
        }
    }
    
    // Get longest common prefix
    getLongestCommonPrefix() {
        let current = this.root;
        let prefix = '';
        
        while (current.children.size === 1 && !current.isEndOfWord) {
            const char = Array.from(current.children.keys())[0];
            prefix += char;
            current = current.getChild(char);
        }
        
        this.addOperation({ 
            type: 'getLongestCommonPrefix', 
            step: 'found',
            prefix
        });
        
        return prefix;
    }
    
    // Get words that match pattern (with wildcards)
    getWordsMatchingPattern(pattern) {
        const words = [];
        this.matchPattern(this.root, '', pattern, 0, words);
        
        this.addOperation({ 
            type: 'getWordsMatchingPattern', 
            pattern, 
            step: 'found_matches',
            count: words.length
        });
        
        return words;
    }
    
    // Helper function for pattern matching
    matchPattern(node, currentWord, pattern, index, matches) {
        if (index === pattern.length) {
            if (node.isEndOfWord) {
                matches.push(currentWord);
            }
            return;
        }
        
        const char = pattern[index];
        
        if (char === '*') {
            // Wildcard - match any character
            for (let [childChar, child] of node.children) {
                this.matchPattern(child, currentWord + childChar, pattern, index + 1, matches);
            }
        } else {
            // Specific character
            if (node.hasChild(char)) {
                this.matchPattern(node.getChild(char), currentWord + char, pattern, index + 1, matches);
            }
        }
    }
    
    // Get trie statistics
    getTrieStats() {
        const stats = {
            wordCount: this.size,
            nodeCount: this.getNodeCount(),
            height: this.getHeight(),
            averageWordLength: this.getAverageWordLength(),
            longestWord: this.getLongestWord(),
            shortestWord: this.getShortestWord(),
            commonPrefix: this.getLongestCommonPrefix()
        };
        
        return stats;
    }
    
    // Get total node count
    getNodeCount(node = this.root) {
        if (!node) return 0;
        
        let count = 1;
        for (let child of node.children.values()) {
            count += this.getNodeCount(child);
        }
        
        return count;
    }
    
    // Get trie height
    getHeight(node = this.root) {
        if (!node) return 0;
        
        let maxHeight = 0;
        for (let child of node.children.values()) {
            maxHeight = Math.max(maxHeight, this.getHeight(child));
        }
        
        return maxHeight + 1;
    }
    
    // Get average word length
    getAverageWordLength() {
        const words = this.getAllWords();
        if (words.length === 0) return 0;
        
        const totalLength = words.reduce((sum, word) => sum + word.length, 0);
        return totalLength / words.length;
    }
    
    // Get longest word
    getLongestWord() {
        const words = this.getAllWords();
        if (words.length === 0) return '';
        
        return words.reduce((longest, word) => 
            word.length > longest.length ? word : longest, ''
        );
    }
    
    // Get shortest word
    getShortestWord() {
        const words = this.getAllWords();
        if (words.length === 0) return '';
        
        return words.reduce((shortest, word) => 
            word.length < shortest.length ? word : shortest, words[0] || ''
        );
    }
    
    // Get tree structure for visualization
    getTreeStructure() {
        return this.buildTreeStructure(this.root);
    }
    
    buildTreeStructure(node) {
        if (!node) return null;
        
        const structure = {
            id: node.id,
            value: node.value,
            isEndOfWord: node.isEndOfWord,
            depth: node.depth,
            children: []
        };
        
        for (let [char, child] of node.children) {
            structure.children.push({
                char,
                node: this.buildTreeStructure(child)
            });
        }
        
        return structure;
    }
    
    // Clear the trie
    clear() {
        this.root = new TrieNode();
        this.size = 0;
        this.operationHistory = [];
        this.currentStep = 0;
    }
    
    // Generate sample trie
    generateSampleTrie(words = ['cat', 'car', 'card', 'care', 'careful', 'carefully', 'careless', 'carelessness']) {
        this.clear();
        words.forEach(word => this.insert(word));
        return this;
    }
    
    // Get tree type specific information
    getTypeInfo() {
        const info = TreeInfo['trie'];
        if (!info) return TreeInfo['binary-tree'];
        
        // Add trie specific validation
        info.validation = {
            wordCount: this.size,
            nodeCount: this.getNodeCount(),
            height: this.getHeight(),
            averageWordLength: this.getAverageWordLength()
        };
        
        return info;
    }
    
    // Override traversal methods for trie
    preorderTraversal(node = this.root, result = []) {
        if (!node) return result;
        
        if (node.isEndOfWord) {
            result.push(node.value || '');
        }
        
        for (let child of node.children.values()) {
            this.preorderTraversal(child, result);
        }
        
        return result;
    }
    
    // Get autocomplete suggestions
    getAutocompleteSuggestions(prefix, maxSuggestions = 10) {
        const words = this.getWordsWithPrefix(prefix);
        return words.slice(0, maxSuggestions);
    }
    
    // Check if trie is empty
    isEmpty() {
        return this.size === 0;
    }
    
    // Get all words sorted
    getSortedWords() {
        return this.getAllWords().sort();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Trie, TrieNode };
}
