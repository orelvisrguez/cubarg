/**
 * Enhanced Features for Protecciones Cubanos Argentina
 * Funcionalidades adicionales: PDF export, sharing, bookmarks, reading modes, etc.
 * Author: MiniMax Agent
 * Version: 1.0.0
 */

class EnhancedFeatures {
    constructor() {
        this.readingStartTime = Date.now();
        this.wordsRead = 0;
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        this.readingStats = {
            timeSpent: 0,
            progress: 0,
            wordsRead: 0
        };
        this.sections = [];
        this.currentSection = 0;
        
        this.init();
    }

    init() {
        this.initEventListeners();
        this.initReadingTracking();
        this.loadBookmarks();
        this.initPresentationMode();
        this.initAccessibilityFeatures();
        this.initFAB();
        this.updateShareURL();
    }

    initEventListeners() {
        // Export functionality
        document.getElementById('export-btn')?.addEventListener('click', () => this.openModal('export-modal'));
        document.getElementById('download-pdf')?.addEventListener('click', () => this.exportToPDF());

        // Share functionality
        document.getElementById('share-btn')?.addEventListener('click', () => this.openModal('share-modal'));

        // Reading mode
        document.getElementById('reading-mode-btn')?.addEventListener('click', () => this.toggleReadingMode());

        // Bookmarks
        document.getElementById('bookmarks-btn')?.addEventListener('click', () => this.openModal('bookmarks-modal'));
        document.getElementById('add-bookmark-btn')?.addEventListener('click', () => this.addBookmark());

        // Close buttons for stats and accessibility panels
        document.getElementById('close-stats')?.addEventListener('click', () => this.toggleReadingStats());
        document.getElementById('close-accessibility')?.addEventListener('click', () => this.toggleAccessibility());

        // Presentation controls
        document.getElementById('prev-section')?.addEventListener('click', () => this.previousSection());
        document.getElementById('next-section')?.addEventListener('click', () => this.nextSection());
        document.getElementById('exit-presentation')?.addEventListener('click', () => this.exitPresentationMode());

        // Accessibility controls
        document.getElementById('font-size-slider')?.addEventListener('input', (e) => this.changeFontSize(e.target.value));
        document.getElementById('line-height-slider')?.addEventListener('input', (e) => this.changeLineHeight(e.target.value));
        document.getElementById('high-contrast-btn')?.addEventListener('click', () => this.toggleHighContrast());
        document.getElementById('focus-mode-btn')?.addEventListener('click', () => this.toggleFocusMode());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Scroll tracking for reading progress
        window.addEventListener('scroll', () => this.updateReadingProgress());
    }

    // =================================
    // PDF EXPORT FUNCTIONALITY
    // =================================
    
    async exportToPDF() {
        try {
            this.showLoadingState('Generando PDF...');
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Configuración del PDF
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const lineHeight = 7;
            let yPosition = margin;

            // Título del documento
            pdf.setFontSize(20);
            pdf.setFont(undefined, 'bold');
            pdf.text('Protecciones para Cubanos en Argentina', margin, yPosition);
            yPosition += lineHeight * 2;

            // Subtitle
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            pdf.text('Informe sobre derechos y limitaciones de refugiados cubanos', margin, yPosition);
            yPosition += lineHeight * 2;

            // Fecha de generación
            pdf.setFontSize(10);
            pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
            yPosition += lineHeight * 2;

            // Contenido principal
            const content = this.extractContentForPDF();
            
            for (const section of content) {
                // Verificar si necesitamos nueva página
                if (yPosition + lineHeight * 3 > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // Título de sección
                pdf.setFontSize(14);
                pdf.setFont(undefined, 'bold');
                const title = pdf.splitTextToSize(section.title, pageWidth - margin * 2);
                pdf.text(title, margin, yPosition);
                yPosition += title.length * lineHeight + 5;

                // Contenido de sección
                pdf.setFontSize(11);
                pdf.setFont(undefined, 'normal');
                const text = pdf.splitTextToSize(section.content, pageWidth - margin * 2);
                
                for (let i = 0; i < text.length; i++) {
                    if (yPosition + lineHeight > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    pdf.text(text[i], margin, yPosition);
                    yPosition += lineHeight;
                }
                
                yPosition += lineHeight;
            }

            // Referencias
            pdf.addPage();
            yPosition = margin;
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('Referencias', margin, yPosition);
            yPosition += lineHeight * 2;

            const references = this.extractReferences();
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            
            references.forEach((ref, index) => {
                if (yPosition + lineHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                const refText = pdf.splitTextToSize(`[${index + 1}] ${ref}`, pageWidth - margin * 2);
                pdf.text(refText, margin, yPosition);
                yPosition += refText.length * lineHeight + 3;
            });

            // Guardar el PDF
            pdf.save('protecciones-cubanos-argentina.pdf');
            this.hideLoadingState();
            this.showNotification('PDF generado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            this.hideLoadingState();
            this.showNotification('Error al generar PDF', 'error');
        }
    }

    extractContentForPDF() {
        const sections = [];
        const contentSections = document.querySelectorAll('.content-section');
        
        contentSections.forEach(section => {
            const title = section.querySelector('.section-title, h2, h3')?.textContent?.trim() || 'Sección';
            let content = '';
            
            // Extraer párrafos
            const paragraphs = section.querySelectorAll('p, li');
            paragraphs.forEach(p => {
                content += p.textContent.trim() + '\n\n';
            });
            
            if (content.trim()) {
                sections.push({ title, content: content.trim() });
            }
        });
        
        return sections;
    }

    extractReferences() {
        const references = [];
        const refElements = document.querySelectorAll('.reference-item, .reference');
        
        refElements.forEach(ref => {
            const text = ref.textContent.trim();
            if (text) {
                references.push(text);
            }
        });
        
        return references;
    }

    async exportToWord() {
        try {
            this.showLoadingState('Generando documento Word...');
            
            const content = this.extractContentForPDF();
            let docContent = 'Protecciones para Cubanos en Argentina\n\n';
            docContent += 'Informe sobre derechos y limitaciones de refugiados cubanos\n\n';
            docContent += `Generado el: ${new Date().toLocaleDateString('es-ES')}\n\n`;
            
            content.forEach(section => {
                docContent += `${section.title}\n`;
                docContent += '='.repeat(section.title.length) + '\n\n';
                docContent += `${section.content}\n\n`;
            });
            
            // Referencias
            docContent += 'Referencias\n';
            docContent += '='.repeat(10) + '\n\n';
            const references = this.extractReferences();
            references.forEach((ref, index) => {
                docContent += `[${index + 1}] ${ref}\n`;
            });
            
            const blob = new Blob([docContent], { type: 'application/msword' });
            this.downloadBlob(blob, 'protecciones-cubanos-argentina.doc');
            
            this.hideLoadingState();
            this.showNotification('Documento Word generado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error generando Word:', error);
            this.hideLoadingState();
            this.showNotification('Error al generar documento Word', 'error');
        }
    }

    exportToText() {
        try {
            this.showLoadingState('Generando archivo de texto...');
            
            const content = this.extractContentForPDF();
            let textContent = 'PROTECCIONES PARA CUBANOS EN ARGENTINA\n';
            textContent += '='.repeat(50) + '\n\n';
            textContent += 'Informe sobre derechos y limitaciones de refugiados cubanos\n\n';
            textContent += `Generado el: ${new Date().toLocaleDateString('es-ES')}\n\n`;
            
            content.forEach(section => {
                textContent += `${section.title}\n`;
                textContent += '-'.repeat(section.title.length) + '\n\n';
                textContent += `${section.content}\n\n`;
            });
            
            // Referencias
            textContent += 'REFERENCIAS\n';
            textContent += '-'.repeat(10) + '\n\n';
            const references = this.extractReferences();
            references.forEach((ref, index) => {
                textContent += `[${index + 1}] ${ref}\n`;
            });
            
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            this.downloadBlob(blob, 'protecciones-cubanos-argentina.txt');
            
            this.hideLoadingState();
            this.showNotification('Archivo de texto generado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error generando texto:', error);
            this.hideLoadingState();
            this.showNotification('Error al generar archivo de texto', 'error');
        }
    }

    printDocument() {
        window.print();
    }

    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // =================================
    // SHARING FUNCTIONALITY
    // =================================
    
    updateShareURL() {
        const urlInput = document.getElementById('share-url-input');
        if (urlInput) {
            urlInput.value = window.location.href;
        }
    }

    shareLink() {
        this.copyToClipboard('share-url-input');
        this.showNotification('Enlace copiado al portapapeles', 'success');
    }

    shareWhatsApp() {
        const text = encodeURIComponent('Protecciones para Cubanos en Argentina - Información legal actualizada');
        const url = encodeURIComponent(window.location.href);
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    }

    shareTwitter() {
        const text = encodeURIComponent('Protecciones para Cubanos en Argentina - Información legal actualizada 🇦🇷🇨🇺');
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }

    shareLinkedIn() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }

    shareEmail() {
        const subject = encodeURIComponent('Protecciones para Cubanos en Argentina');
        const body = encodeURIComponent(`Te comparto esta información legal actualizada sobre protecciones para cubanos en Argentina:\n\n${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    // =================================
    // BOOKMARKS FUNCTIONALITY
    // =================================
    
    loadBookmarks() {
        const bookmarksList = document.getElementById('bookmarks-list');
        if (!bookmarksList) return;

        bookmarksList.innerHTML = '';
        
        if (this.bookmarks.length === 0) {
            bookmarksList.innerHTML = '<p class="text-center">No hay favoritos guardados</p>';
            return;
        }

        this.bookmarks.forEach((bookmark, index) => {
            const bookmarkElement = this.createBookmarkElement(bookmark, index);
            bookmarksList.appendChild(bookmarkElement);
        });
    }

    createBookmarkElement(bookmark, index) {
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        
        div.innerHTML = `
            <i class="bookmark-icon fas fa-bookmark"></i>
            <div class="bookmark-content">
                <div class="bookmark-title">${bookmark.title}</div>
                <div class="bookmark-description">${bookmark.section}</div>
            </div>
            <div class="bookmark-actions">
                <button class="bookmark-btn" onclick="enhancedFeatures.goToBookmark('${bookmark.id}')" title="Ir">
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button class="bookmark-btn" onclick="enhancedFeatures.removeBookmark(${index})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    addBookmark() {
        const currentSection = this.getCurrentSection();
        if (!currentSection) {
            this.showNotification('No se pudo determinar la sección actual', 'error');
            return;
        }

        const bookmark = {
            id: currentSection.id,
            title: currentSection.title,
            section: currentSection.section,
            timestamp: Date.now()
        };

        // Verificar si ya existe
        if (this.bookmarks.some(b => b.id === bookmark.id)) {
            this.showNotification('Esta sección ya está en favoritos', 'warning');
            return;
        }

        this.bookmarks.push(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
        this.loadBookmarks();
        this.showNotification('Favorito agregado exitosamente', 'success');
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('.content-section[id]');
        let currentSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom > 100) {
                const title = section.querySelector('.section-title, h2, h3')?.textContent?.trim() || 'Sección';
                currentSection = {
                    id: section.id,
                    title: title,
                    section: section.id.replace('-', ' ').toUpperCase()
                };
            }
        });
        
        return currentSection;
    }

    goToBookmark(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.closeModal('bookmarks-modal');
            this.showNotification('Navegando al favorito', 'info');
        }
    }

    removeBookmark(index) {
        if (confirm('¿Estás seguro de eliminar este favorito?')) {
            this.bookmarks.splice(index, 1);
            localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
            this.loadBookmarks();
            this.showNotification('Favorito eliminado', 'success');
        }
    }

    // =================================
    // READING MODE & TRACKING
    // =================================
    
    toggleReadingMode() {
        document.body.classList.toggle('reading-mode');
        const isActive = document.body.classList.contains('reading-mode');
        
        const btn = document.getElementById('reading-mode-btn');
        if (btn) {
            btn.title = isActive ? 'Salir del modo lectura' : 'Modo lectura';
            btn.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-book-open"></i>';
        }
        
        this.showNotification(
            isActive ? 'Modo lectura activado' : 'Modo lectura desactivado',
            'info'
        );
    }

    initReadingTracking() {
        setInterval(() => {
            if (this.isPageVisible()) {
                this.readingStats.timeSpent += 1;
                this.updateReadingStatsDisplay();
            }
        }, 1000);

        // Contar palabras leídas basado en scroll
        this.updateWordsRead();
    }

    updateReadingProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.round((scrollTop / docHeight) * 100);
        
        this.readingStats.progress = Math.min(progress, 100);
        this.updateWordsRead();
        this.updateReadingStatsDisplay();
    }

    updateWordsRead() {
        const viewportTop = window.pageYOffset;
        const viewportBottom = viewportTop + window.innerHeight;
        
        let wordsInView = 0;
        const paragraphs = document.querySelectorAll('p, li');
        
        paragraphs.forEach(p => {
            const rect = p.getBoundingClientRect();
            const elemTop = rect.top + viewportTop;
            const elemBottom = rect.bottom + viewportTop;
            
            if (elemTop < viewportBottom && elemBottom > viewportTop) {
                const words = p.textContent.trim().split(/\s+/).length;
                wordsInView += words;
            }
        });
        
        this.readingStats.wordsRead = Math.max(this.readingStats.wordsRead, wordsInView);
    }

    updateReadingStatsDisplay() {
        const timeElement = document.getElementById('reading-time');
        const progressElement = document.getElementById('progress-percent');
        const wordsElement = document.getElementById('words-read');
        
        if (timeElement) {
            const minutes = Math.floor(this.readingStats.timeSpent / 60);
            const seconds = this.readingStats.timeSpent % 60;
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (progressElement) {
            progressElement.textContent = `${this.readingStats.progress}%`;
        }
        
        if (wordsElement) {
            wordsElement.textContent = this.readingStats.wordsRead.toLocaleString();
        }
    }

    isPageVisible() {
        return !document.hidden && document.visibilityState === 'visible';
    }

    toggleReadingStats() {
        const panel = document.getElementById('reading-stats');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    }

    // =================================
    // PRESENTATION MODE
    // =================================
    
    initPresentationMode() {
        this.sections = Array.from(document.querySelectorAll('.content-section'));
        this.currentSection = 0;
    }

    togglePresentationMode() {
        const isPresenting = document.body.classList.contains('presentation-mode');
        
        if (isPresenting) {
            this.exitPresentationMode();
        } else {
            this.enterPresentationMode();
        }
    }

    enterPresentationMode() {
        document.body.classList.add('presentation-mode');
        document.getElementById('presentation-controls')?.classList.remove('hidden');
        
        this.showOnlySection(this.currentSection);
        this.updateSectionCounter();
        
        this.showNotification('Modo presentación activado. Usa las flechas para navegar', 'info');
    }

    exitPresentationMode() {
        document.body.classList.remove('presentation-mode');
        document.getElementById('presentation-controls')?.classList.add('hidden');
        
        this.sections.forEach(section => {
            section.style.display = '';
        });
        
        this.showNotification('Modo presentación desactivado', 'info');
    }

    showOnlySection(index) {
        this.sections.forEach((section, i) => {
            section.style.display = i === index ? 'block' : 'none';
        });
    }

    previousSection() {
        if (this.currentSection > 0) {
            this.currentSection--;
            this.showOnlySection(this.currentSection);
            this.updateSectionCounter();
        }
    }

    nextSection() {
        if (this.currentSection < this.sections.length - 1) {
            this.currentSection++;
            this.showOnlySection(this.currentSection);
            this.updateSectionCounter();
        }
    }

    updateSectionCounter() {
        const counter = document.getElementById('section-counter');
        if (counter) {
            counter.textContent = `${this.currentSection + 1} / ${this.sections.length}`;
        }
    }

    // =================================
    // ACCESSIBILITY FEATURES
    // =================================
    
    initAccessibilityFeatures() {
        this.loadAccessibilitySettings();
    }

    loadAccessibilitySettings() {
        const fontSize = localStorage.getItem('fontSize') || '16';
        const lineHeight = localStorage.getItem('lineHeight') || '1.6';
        const highContrast = localStorage.getItem('highContrast') === 'true';
        const focusMode = localStorage.getItem('focusMode') === 'true';
        
        this.changeFontSize(fontSize);
        this.changeLineHeight(lineHeight);
        
        if (highContrast) this.toggleHighContrast();
        if (focusMode) this.toggleFocusMode();
    }

    changeFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', `${size}px`);
        document.body.style.fontSize = `${size}px`;
        
        const slider = document.getElementById('font-size-slider');
        const value = document.getElementById('font-size-value');
        
        if (slider) slider.value = size;
        if (value) value.textContent = `${size}px`;
        
        localStorage.setItem('fontSize', size);
    }

    changeLineHeight(height) {
        document.documentElement.style.setProperty('--base-line-height', height);
        document.body.style.lineHeight = height;
        
        const slider = document.getElementById('line-height-slider');
        const value = document.getElementById('line-height-value');
        
        if (slider) slider.value = height;
        if (value) value.textContent = height;
        
        localStorage.setItem('lineHeight', height);
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isActive = document.body.classList.contains('high-contrast');
        
        const btn = document.getElementById('high-contrast-btn');
        if (btn) {
            btn.classList.toggle('active', isActive);
        }
        
        localStorage.setItem('highContrast', isActive);
        this.showNotification(
            isActive ? 'Alto contraste activado' : 'Alto contraste desactivado',
            'info'
        );
    }

    toggleFocusMode() {
        document.body.classList.toggle('focus-mode');
        const isActive = document.body.classList.contains('focus-mode');
        
        const btn = document.getElementById('focus-mode-btn');
        if (btn) {
            btn.classList.toggle('active', isActive);
        }
        
        if (isActive) {
            this.initFocusTracking();
        } else {
            this.removeFocusTracking();
        }
        
        localStorage.setItem('focusMode', isActive);
        this.showNotification(
            isActive ? 'Modo foco activado' : 'Modo foco desactivado',
            'info'
        );
    }

    initFocusTracking() {
        const sections = document.querySelectorAll('.content-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sections.forEach(s => s.classList.remove('active'));
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.3 });
        
        sections.forEach(section => observer.observe(section));
        this.focusObserver = observer;
    }

    removeFocusTracking() {
        if (this.focusObserver) {
            this.focusObserver.disconnect();
            this.focusObserver = null;
        }
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
    }

    toggleAccessibility() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    }

    // =================================
    // FAB (Floating Action Button)
    // =================================
    
    initFAB() {
        const fabMain = document.getElementById('fab-main');
        if (fabMain) {
            fabMain.addEventListener('click', () => {
                document.getElementById('fab-menu').classList.toggle('active');
            });
        }
        
        // Cerrar FAB al hacer clic fuera
        document.addEventListener('click', (e) => {
            const fabMenu = document.getElementById('fab-menu');
            if (fabMenu && !fabMenu.contains(e.target)) {
                fabMenu.classList.remove('active');
            }
        });
    }

    goToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('fab-menu').classList.remove('active');
    }

    // =================================
    // UTILITY FUNCTIONS
    // =================================
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('fade-in');
        }
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.select();
            document.execCommand('copy');
        }
    }

    showNotification(message, type = 'info') {
        // Crear o mostrar notificación
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateX(100%);
            `;
            document.body.appendChild(notification);
        }

        // Colores según tipo
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        // Mostrar notificación
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }

    showLoadingState(message) {
        let loader = document.getElementById('loading-overlay');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loading-overlay';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                color: white;
                font-size: 1.2em;
                font-weight: 600;
            `;
            document.body.appendChild(loader);
        }
        
        loader.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner" style="margin: 0 auto 20px;"></div>
                <div>${message}</div>
            </div>
        `;
        loader.style.display = 'flex';
    }

    hideLoadingState() {
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + P: Print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            this.printDocument();
        }
        
        // Ctrl/Cmd + S: Export PDF
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.exportToPDF();
        }
        
        // Ctrl/Cmd + B: Toggle bookmarks
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.openModal('bookmarks-modal');
        }
        
        // Ctrl/Cmd + R: Toggle reading mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.toggleReadingMode();
        }
        
        // F11: Presentation mode
        if (e.key === 'F11') {
            e.preventDefault();
            this.togglePresentationMode();
        }
        
        // En modo presentación: flechas para navegar
        if (document.body.classList.contains('presentation-mode')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousSection();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSection();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.exitPresentationMode();
            }
        }
    }
}

// Funciones globales para ser llamadas desde HTML
function exportToPDF() {
    window.enhancedFeatures.exportToPDF();
}

function exportToWord() {
    window.enhancedFeatures.exportToWord();
}

function exportToText() {
    window.enhancedFeatures.exportToText();
}

function printDocument() {
    window.enhancedFeatures.printDocument();
}

function shareLink() {
    window.enhancedFeatures.shareLink();
}

function shareWhatsApp() {
    window.enhancedFeatures.shareWhatsApp();
}

function shareTwitter() {
    window.enhancedFeatures.shareTwitter();
}

function shareLinkedIn() {
    window.enhancedFeatures.shareLinkedIn();
}

function shareEmail() {
    window.enhancedFeatures.shareEmail();
}

function copyToClipboard(elementId) {
    window.enhancedFeatures.copyToClipboard(elementId);
}

function closeModal(modalId) {
    window.enhancedFeatures.closeModal(modalId);
}

function toggleReadingStats() {
    window.enhancedFeatures.toggleReadingStats();
}

function toggleAccessibility() {
    window.enhancedFeatures.toggleAccessibility();
}

function togglePresentationMode() {
    window.enhancedFeatures.togglePresentationMode();
}

function goToTop() {
    window.enhancedFeatures.goToTop();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedFeatures = new EnhancedFeatures();
});