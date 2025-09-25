/**
 * Quantum Tree Explorer - Main Application
 */
class TreeExplorerApp {
    constructor() {
        this.currentTree = null;
        this.treeType = 'binary-tree';
        this.visualizer = null;
        this.isStepMode = false;
        this.operationHistory = [];
        this.currentStep = 0;
        this.isAutoPlaying = false;
        
        this.init();
    }
    
    async init() {
        // Show loading screen
        this.showLoadingScreen();
        
        // Simulate loading time for better UX
        await this.simulateLoading();
        
        // Initialize components
        this.initializeVisualizer();
        this.initializeEventListeners();
        this.initializeTree();
        this.updateTreeInfo();
        
        // Hide loading screen and show main app
        this.hideLoadingScreen();
        
        // Add welcome animation
        this.showWelcomeAnimation();
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    async simulateLoading() {
        return new Promise(resolve => {
            setTimeout(resolve, 2000); // 2 second loading simulation
        });
    }
    
    initializeVisualizer() {
        const svgElement = document.getElementById('treeSVG');
        if (svgElement) {
            this.visualizer = new TreeVisualizer(svgElement);
        }
    }
    
    initializeEventListeners() {
        // Tree type selection
        const treeTypeSelect = document.getElementById('treeType');
        if (treeTypeSelect) {
            treeTypeSelect.addEventListener('change', (e) => {
                this.changeTreeType(e.target.value);
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('resetTree');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetTree();
            });
        }
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Operation buttons
        this.initializeOperationButtons();
        
        // Traversal buttons
        this.initializeTraversalButtons();
        
        // Step mode
        const stepModeCheckbox = document.getElementById('stepMode');
        if (stepModeCheckbox) {
            stepModeCheckbox.addEventListener('change', (e) => {
                this.toggleStepMode(e.target.checked);
            });
        }
        
        // Step controls
        const nextStepBtn = document.getElementById('nextStepBtn');
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => {
                this.nextStep();
            });
        }
        
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        if (autoPlayBtn) {
            autoPlayBtn.addEventListener('click', () => {
                this.toggleAutoPlay();
            });
        }
        
        // Download results
        const downloadBtn = document.getElementById('downloadResults');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadResults();
            });
        }
        
        // Close rules reminder
        const closeRulesBtn = document.getElementById('closeRules');
        if (closeRulesBtn) {
            closeRulesBtn.addEventListener('click', () => {
                this.closeRulesReminder();
            });
        }
    }
    
    initializeOperationButtons() {
        // Insert button
        const insertBtn = document.getElementById('insertBtn');
        const insertInput = document.getElementById('insertValue');
        if (insertBtn && insertInput) {
            insertBtn.addEventListener('click', () => {
                const value = insertInput.value.trim();
                if (value) {
                    this.insertValue(value);
                    insertInput.value = '';
                }
            });
            
            insertInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const value = insertInput.value.trim();
                    if (value) {
                        this.insertValue(value);
                        insertInput.value = '';
                    }
                }
            });
        }
        
        // Delete button
        const deleteBtn = document.getElementById('deleteBtn');
        const deleteInput = document.getElementById('deleteValue');
        if (deleteBtn && deleteInput) {
            deleteBtn.addEventListener('click', () => {
                const value = deleteInput.value.trim();
                if (value) {
                    this.deleteValue(value);
                    deleteInput.value = '';
                }
            });
            
            deleteInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const value = deleteInput.value.trim();
                    if (value) {
                        this.deleteValue(value);
                        deleteInput.value = '';
                    }
                }
            });
        }
        
        // Search button
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchValue');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                const value = searchInput.value.trim();
                if (value) {
                    this.searchValue(value);
                }
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const value = searchInput.value.trim();
                    if (value) {
                        this.searchValue(value);
                    }
                }
            });
        }
        
        // Update button
        const updateBtn = document.getElementById('updateBtn');
        const updateOldInput = document.getElementById('updateOldValue');
        const updateNewInput = document.getElementById('updateNewValue');
        if (updateBtn && updateOldInput && updateNewInput) {
            updateBtn.addEventListener('click', () => {
                const oldValue = updateOldInput.value.trim();
                const newValue = updateNewInput.value.trim();
                if (oldValue && newValue) {
                    this.updateValue(oldValue, newValue);
                    updateOldInput.value = '';
                    updateNewInput.value = '';
                }
            });
        }
    }
    
    initializeTraversalButtons() {
        const traversalButtons = [
            { id: 'preorderBtn', type: 'preorder' },
            { id: 'inorderBtn', type: 'inorder' },
            { id: 'postorderBtn', type: 'postorder' },
            { id: 'levelorderBtn', type: 'levelorder' }
        ];
        
        traversalButtons.forEach(({ id, type }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.performTraversal(type);
                });
            }
        });
    }
    
    initializeTree() {
        this.changeTreeType(this.treeType);
    }
    
    changeTreeType(type) {
        this.treeType = type;
        
        // Create new tree instance based on type
        switch (type) {
            case 'binary-tree':
            case 'full-binary':
            case 'perfect-binary':
            case 'complete-binary':
            case 'balanced-binary':
                this.currentTree = new BinaryTree(type);
                break;
            case 'bst':
                this.currentTree = new BST();
                break;
            case 'avl':
                this.currentTree = new AVLTree();
                break;
            case 'red-black':
                this.currentTree = new RedBlackTree();
                break;
            case 'min-heap':
                this.currentTree = new MinHeap();
                break;
            case 'max-heap':
                this.currentTree = new MaxHeap();
                break;
            case 'b-tree':
                this.currentTree = new BTree();
                break;
            case 'trie':
                this.currentTree = new Trie();
                break;
            default:
                this.currentTree = new BinaryTree();
        }
        
        // Update visualization
        if (this.visualizer) {
            this.visualizer.visualize(this.currentTree, type);
        }
        
        // Update special operations
        this.updateSpecialOperations();
        
        // Clear traversal results
        this.clearTraversalResults();
        
        // Update operation info
        this.updateOperationInfo('Tree type changed to ' + this.getTreeDisplayName(type));
    }
    
    getTreeDisplayName(type) {
        const names = {
            'binary-tree': 'Binary Tree',
            'full-binary': 'Full Binary Tree',
            'perfect-binary': 'Perfect Binary Tree',
            'complete-binary': 'Complete Binary Tree',
            'balanced-binary': 'Balanced Binary Tree',
            'bst': 'Binary Search Tree',
            'avl': 'AVL Tree',
            'red-black': 'Red-Black Tree',
            'min-heap': 'Min Heap',
            'max-heap': 'Max Heap',
            'b-tree': 'B-Tree',
            'trie': 'Trie'
        };
        return names[type] || 'Unknown Tree';
    }
    
    updateSpecialOperations() {
        const specialButtonsContainer = document.getElementById('specialButtons');
        if (!specialButtonsContainer) return;
        
        specialButtonsContainer.innerHTML = '';
        
        switch (this.treeType) {
            case 'avl':
                this.addSpecialButton('Balance Tree', () => this.balanceTree());
                this.addSpecialButton('Show Balance Factors', () => this.showBalanceFactors());
                break;
            case 'red-black':
                this.addSpecialButton('Validate RB Properties', () => this.validateRBProperties());
                this.addSpecialButton('Show Colors', () => this.showColors());
                break;
            case 'min-heap':
            case 'max-heap':
                this.addSpecialButton('Extract Root', () => this.extractRoot());
                this.addSpecialButton('Heapify', () => this.heapify());
                break;
            case 'b-tree':
                this.addSpecialButton('Show Order', () => this.showOrder());
                this.addSpecialButton('Validate B-Tree', () => this.validateBTree());
                break;
            case 'trie':
                this.addSpecialButton('Get All Words', () => this.getAllWords());
                this.addSpecialButton('Clear Trie', () => this.clearTrie());
                break;
        }
    }
    
    addSpecialButton(text, onClick) {
        const specialButtonsContainer = document.getElementById('specialButtons');
        if (!specialButtonsContainer) return;
        
        const button = document.createElement('button');
        button.className = 'neon-btn secondary';
        button.innerHTML = `<span class="btn-icon">⚡</span><span>${text}</span>`;
        button.addEventListener('click', onClick);
        
        specialButtonsContainer.appendChild(button);
    }
    
    insertValue(value) {
        if (!this.currentTree) return;
        
        try {
            const numValue = parseFloat(value);
            if (isNaN(numValue) && this.treeType !== 'trie') {
                this.showError('Please enter a valid number');
                return;
            }
            
            const result = this.currentTree.insert(this.treeType === 'trie' ? value : numValue);
            
            if (result) {
                this.updateVisualization();
                this.updateOperationInfo(`Inserted ${value} successfully`);
                this.showSuccess(`Successfully inserted ${value}`);
            } else {
                this.showError(`Failed to insert ${value}`);
            }
        } catch (error) {
            this.showError(`Error inserting ${value}: ${error.message}`);
        }
    }
    
    deleteValue(value) {
        if (!this.currentTree) return;
        
        try {
            const numValue = parseFloat(value);
            if (isNaN(numValue) && this.treeType !== 'trie') {
                this.showError('Please enter a valid number');
                return;
            }
            
            const result = this.currentTree.delete(this.treeType === 'trie' ? value : numValue);
            
            if (result) {
                this.updateVisualization();
                this.updateOperationInfo(`Deleted ${value} successfully`);
                this.showSuccess(`Successfully deleted ${value}`);
            } else {
                this.showError(`Value ${value} not found`);
            }
        } catch (error) {
            this.showError(`Error deleting ${value}: ${error.message}`);
        }
    }
    
    searchValue(value) {
        if (!this.currentTree) return;
        
        try {
            const numValue = parseFloat(value);
            if (isNaN(numValue) && this.treeType !== 'trie') {
                this.showError('Please enter a valid number');
                return;
            }
            
            const result = this.currentTree.search(this.treeType === 'trie' ? value : numValue);
            
            if (result) {
                this.highlightNode(result.id || result);
                this.updateOperationInfo(`Found ${value} in the tree`);
                this.showSuccess(`Found ${value} successfully`);
            } else {
                this.updateOperationInfo(`${value} not found in the tree`);
                this.showWarning(`${value} not found`);
            }
        } catch (error) {
            this.showError(`Error searching for ${value}: ${error.message}`);
        }
    }
    
    updateValue(oldValue, newValue) {
        if (!this.currentTree) return;
        
        try {
            const oldNum = parseFloat(oldValue);
            const newNum = parseFloat(newValue);
            
            if ((isNaN(oldNum) || isNaN(newNum)) && this.treeType !== 'trie') {
                this.showError('Please enter valid numbers');
                return;
            }
            
            const result = this.currentTree.updateValue(
                this.treeType === 'trie' ? oldValue : oldNum,
                this.treeType === 'trie' ? newValue : newNum
            );
            
            if (result) {
                this.updateVisualization();
                this.updateOperationInfo(`Updated ${oldValue} to ${newValue}`);
                this.showSuccess(`Successfully updated ${oldValue} to ${newValue}`);
            } else {
                this.showError(`Failed to update ${oldValue}`);
            }
        } catch (error) {
            this.showError(`Error updating ${oldValue}: ${error.message}`);
        }
    }
    
    performTraversal(type) {
        if (!this.currentTree) return;
        
        try {
            let result;
            switch (type) {
                case 'preorder':
                    result = this.currentTree.preorderTraversal();
                    break;
                case 'inorder':
                    result = this.currentTree.inorderTraversal();
                    break;
                case 'postorder':
                    result = this.currentTree.postorderTraversal();
                    break;
                case 'levelorder':
                    result = this.currentTree.levelOrderTraversal();
                    break;
                default:
                    result = [];
            }
            
            this.displayTraversalResult(type, result);
            this.animateTraversal(result);
            this.updateOperationInfo(`Performed ${type} traversal`);
        } catch (error) {
            this.showError(`Error performing ${type} traversal: ${error.message}`);
        }
    }
    
    displayTraversalResult(type, result) {
        const outputContainer = document.getElementById('traversalOutput');
        if (!outputContainer) return;
        
        const formattedResult = result.join(' → ');
        outputContainer.innerHTML = `
            <div class="traversal-result">
                <div class="result-header">
                    <span class="result-type">${type.toUpperCase()} Traversal</span>
                    <span class="result-count">(${result.length} nodes)</span>
                </div>
                <div class="result-sequence">${formattedResult}</div>
            </div>
        `;
    }
    
    animateTraversal(nodes) {
        if (!this.visualizer) return;
        
        // Animate traversal path
        nodes.forEach((nodeValue, index) => {
            setTimeout(() => {
                // Find and highlight the node
                const node = this.findNodeByValue(nodeValue);
                if (node) {
                    this.visualizer.highlightNode(node.id, 1000);
                }
            }, index * 500);
        });
    }
    
    findNodeByValue(value) {
        if (!this.currentTree || !this.currentTree.root) return null;
        
        // This is a simplified search - in a real implementation,
        // you'd want to use the tree's search method
        return this.currentTree.findNode ? this.currentTree.findNode(value) : null;
    }
    
    highlightNode(nodeId) {
        if (this.visualizer) {
            this.visualizer.highlightNode(nodeId, 2000);
        }
    }
    
    updateVisualization() {
        if (this.visualizer && this.currentTree) {
            this.visualizer.visualize(this.currentTree, this.treeType);
        }
    }
    
    updateTreeInfo() {
        const treeInfo = TreeInfo[this.treeType];
        if (!treeInfo) return;
        
        // Update definition
        const definitionElement = document.getElementById('treeDefinition');
        if (definitionElement) {
            definitionElement.innerHTML = `
                <div class="definition-card">
                    <div class="card-icon">💡</div>
                    <p>${treeInfo.definition}</p>
                </div>
            `;
        }
        
        // Update features
        const featuresList = document.getElementById('featuresList');
        if (featuresList && treeInfo.features) {
            featuresList.innerHTML = treeInfo.features
                .map(feature => `<li>${feature}</li>`)
                .join('');
        }
        
        // Update rules
        const rulesList = document.getElementById('rulesList');
        if (rulesList && treeInfo.rules) {
            rulesList.innerHTML = treeInfo.rules
                .map(rule => `<li>${rule}</li>`)
                .join('');
        }
    }
    
    updateOperationInfo(message) {
        const operationInfo = document.getElementById('operationInfo');
        if (operationInfo) {
            const infoCard = operationInfo.querySelector('.info-card');
            if (infoCard) {
                infoCard.innerHTML = `
                    <div class="info-icon">⚡</div>
                    <p>${message}</p>
                `;
            }
        }
    }
    
    clearTraversalResults() {
        const outputContainer = document.getElementById('traversalOutput');
        if (outputContainer) {
            outputContainer.innerHTML = `
                <div class="output-placeholder">
                    <div class="placeholder-icon">🎯</div>
                    <p>Run a traversal to see results here</p>
                </div>
            `;
        }
    }
    
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const btnIcon = themeToggle.querySelector('.btn-icon');
            const btnText = themeToggle.querySelector('.btn-text');
            if (btnIcon && btnText) {
                btnIcon.textContent = newTheme === 'dark' ? '⚡' : '🌙';
                btnText.textContent = newTheme === 'dark' ? 'Quantum' : 'Classic';
            }
        }
        
        this.updateOperationInfo(`Switched to ${newTheme} theme`);
    }
    
    resetTree() {
        if (this.currentTree) {
            this.currentTree.clear();
            this.updateVisualization();
            this.clearTraversalResults();
            this.updateOperationInfo('Tree has been reset');
            this.showSuccess('Tree reset successfully');
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    toggleStepMode(enabled) {
        this.isStepMode = enabled;
        const stepControls = document.getElementById('stepControls');
        if (stepControls) {
            stepControls.style.display = enabled ? 'flex' : 'none';
        }
        
        if (this.currentTree) {
            this.currentTree.setStepMode(enabled);
        }
        
        this.updateOperationInfo(enabled ? 'Step-by-step mode enabled' : 'Step-by-step mode disabled');
    }
    
    nextStep() {
        if (this.currentTree && this.currentTree.isStepMode) {
            const step = this.currentTree.getNextStep();
            if (step) {
                this.updateStepCounter();
                this.updateOperationInfo(`Step: ${step.type} - ${step.step}`);
            }
        }
    }
    
    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        if (autoPlayBtn) {
            const btnText = autoPlayBtn.querySelector('span:last-child');
            if (btnText) {
                btnText.textContent = this.isAutoPlaying ? 'Stop' : 'Auto Play';
            }
        }
        
        if (this.isAutoPlaying) {
            this.autoPlaySteps();
        }
    }
    
    autoPlaySteps() {
        if (!this.isAutoPlaying) return;
        
        this.nextStep();
        setTimeout(() => {
            if (this.isAutoPlaying) {
                this.autoPlaySteps();
            }
        }, 1000);
    }
    
    updateStepCounter() {
        const stepCounter = document.getElementById('stepCounter');
        if (stepCounter && this.currentTree) {
            const current = this.currentTree.currentStep || 0;
            const total = this.currentTree.operationHistory.length || 0;
            stepCounter.textContent = `Step: ${current}/${total}`;
        }
    }
    
    downloadResults() {
        const outputContainer = document.getElementById('traversalOutput');
        if (!outputContainer) return;
        
        const content = outputContainer.textContent || outputContainer.innerText;
        if (!content.trim()) {
            this.showWarning('No results to download');
            return;
        }
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tree-traversal-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Results downloaded successfully');
    }
    
    closeRulesReminder() {
        const rulesReminder = document.getElementById('rulesReminder');
        if (rulesReminder) {
            rulesReminder.style.display = 'none';
        }
    }
    
    showWelcomeAnimation() {
        // Add a subtle welcome animation
        const title = document.querySelector('.title-main');
        if (title) {
            title.style.animation = 'gradient-shift 3s ease-in-out infinite';
        }
        
        // Don't auto-generate sample tree to prevent continuous updates
        // User can manually add elements or select different tree types
        
        this.updateOperationInfo('Welcome to Quantum Tree Explorer! Select a data structure to begin.');
        this.showSuccess('Application loaded successfully!');
        
        // Add a button to generate sample data if needed
        this.addSampleDataButton();
    }
    
    generateSampleTree() {
        if (this.currentTree) {
            // Add some sample values to demonstrate the tree
            const sampleValues = [50, 25, 75, 12, 37, 62, 87];
            
            // Clear the tree first
            this.currentTree.clear();
            
            // Insert sample values
            sampleValues.forEach(value => {
                if (this.treeType === 'trie') {
                    // For trie, use words instead of numbers
                    this.currentTree.insert(`word${value}`);
                } else {
                    this.currentTree.insert(value);
                }
            });
            
            // Update visualization
            this.updateVisualization();
            this.updateOperationInfo(`Generated sample ${this.getTreeDisplayName(this.treeType)} with ${sampleValues.length} elements`);
        }
    }
    
    addSampleDataButton() {
        // Add a sample data button to the special operations
        setTimeout(() => {
            this.addSpecialButton('Generate Sample Data', () => {
                this.generateSampleTree();
            });
        }, 1000);
    }
    
    // Special operation methods
    balanceTree() {
        if (this.currentTree && this.currentTree.rebalance) {
            this.currentTree.rebalance();
            this.updateVisualization();
            this.showSuccess('Tree rebalanced');
        }
    }
    
    showBalanceFactors() {
        if (this.currentTree && this.currentTree.getBalanceFactors) {
            const factors = this.currentTree.getBalanceFactors();
            this.showInfo('Balance Factors: ' + factors.map(f => `${f.value}: ${f.balanceFactor}`).join(', '));
        }
    }
    
    validateRBProperties() {
        if (this.currentTree && this.currentTree.checkRedBlackProperties) {
            const violations = this.currentTree.checkRedBlackProperties();
            if (violations.length === 0) {
                this.showSuccess('Red-Black properties are valid');
            } else {
                this.showWarning('Red-Black violations found: ' + violations.map(v => v.property).join(', '));
            }
        }
    }
    
    showColors() {
        if (this.currentTree && this.currentTree.getNodeColors) {
            const colors = this.currentTree.getNodeColors();
            this.showInfo('Node Colors: ' + colors.map(c => `${c.value}: ${c.color}`).join(', '));
        }
    }
    
    extractRoot() {
        if (this.currentTree && this.currentTree.extract) {
            const root = this.currentTree.extract();
            if (root !== null) {
                this.updateVisualization();
                this.showSuccess(`Extracted root: ${root}`);
            } else {
                this.showWarning('Heap is empty');
            }
        }
    }
    
    heapify() {
        if (this.currentTree && this.currentTree.heapify) {
            this.currentTree.heapify();
            this.updateVisualization();
            this.showSuccess('Heap property restored');
        }
    }
    
    showOrder() {
        if (this.currentTree) {
            this.showInfo(`B-Tree order: ${this.currentTree.order}`);
        }
    }
    
    validateBTree() {
        if (this.currentTree && this.currentTree.isValidBTree) {
            const isValid = this.currentTree.isValidBTree();
            if (isValid) {
                this.showSuccess('B-Tree is valid');
            } else {
                this.showWarning('B-Tree properties violated');
            }
        }
    }
    
    getAllWords() {
        if (this.currentTree && this.currentTree.getAllWords) {
            const words = this.currentTree.getAllWords();
            this.displayTraversalResult('all words', words);
            this.showInfo(`Found ${words.length} words`);
        }
    }
    
    clearTrie() {
        if (this.currentTree && this.currentTree.clear) {
            this.currentTree.clear();
            this.updateVisualization();
            this.showSuccess('Trie cleared');
        }
    }
    
    // Notification methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showWarning(message) {
        this.showNotification(message, 'warning');
    }
    
    showInfo(message) {
        this.showNotification(message, 'info');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
                <div class="notification-message">${message}</div>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: var(--neon-border);
            border-radius: 12px;
            padding: 1rem;
            color: var(--text-primary);
            box-shadow: var(--glass-shadow);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.treeExplorerApp = new TreeExplorerApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TreeExplorerApp };
}
