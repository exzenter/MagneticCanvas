class MagneticFilings {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.filings = [];
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        // Configuration
        this.config = {
            cols: 20,
            rows: 20,
            filingLength: 20,
            filingWidth: 2,
            filingColor: '#e0e0e0',
            spacing: 30,
            smoothness: 0.25, // Lower = smoother but slower response
        };

        this.halfLength = this.config.filingLength / 2;
        this.isVisible = false;
        this.animationId = null;
        this.init();
    }

    init() {
        this.setupCanvas();
        this.createFilings();
        this.addEventListeners();
        this.setupIntersectionObserver();
    }

    setupCanvas() {
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = this.canvas.getBoundingClientRect();

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;

            this.ctx.scale(dpr, dpr);

            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';

            this.canvasWidth = rect.width;
            this.canvasHeight = rect.height;
            this.canvasRect = rect;

            // Recreate filings on resize
            if (this.filings.length > 0) {
                this.createFilings();
            }
        };

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 100);
        });
        resize();
    }

    createFilings() {
        this.filings = [];

        const totalWidth = this.config.cols * this.config.spacing;
        const totalHeight = this.config.rows * this.config.spacing;

        const offsetX = (this.canvasWidth - totalWidth) / 2;
        const offsetY = (this.canvasHeight - totalHeight) / 2;

        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const x = offsetX + col * this.config.spacing + this.config.spacing / 2;
                const y = offsetY + row * this.config.spacing + this.config.spacing / 2;

                this.filings.push({
                    x,
                    y,
                    angle: 0,
                    targetAngle: 0
                });
            }
        }

        // Initialize mouse position to center
        if (!this.targetMouse.x && !this.targetMouse.y) {
            this.mouse.x = this.targetMouse.x = this.canvasWidth / 2;
            this.mouse.y = this.targetMouse.y = this.canvasHeight / 2;
        }
    }

    addEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.targetMouse.x = e.clientX - this.canvasRect.left;
            this.targetMouse.y = e.clientY - this.canvasRect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            // Optionally reset to center when mouse leaves
            // this.targetMouse.x = this.canvasWidth / 2;
            // this.targetMouse.y = this.canvasHeight / 2;
        });
    }

    updateFilings() {
        // Smooth mouse movement
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * this.config.smoothness;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * this.config.smoothness;

        this.filings.forEach(filing => {
            // Calculate angle from filing to cursor
            const dx = this.mouse.x - filing.x;
            const dy = this.mouse.y - filing.y;
            filing.targetAngle = Math.atan2(dy, dx);

            // Smooth rotation using interpolation
            let angleDiff = filing.targetAngle - filing.angle;

            // Normalize angle difference to [-PI, PI]
            angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;

            filing.angle += angleDiff * this.config.smoothness;
        });
    }

    drawFilings() {
        const ctx = this.ctx;
        const half = this.halfLength;

        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Set properties once
        ctx.strokeStyle = this.config.filingColor;
        ctx.lineWidth = this.config.filingWidth;
        ctx.lineCap = 'round';

        // Batch all filings into a single path
        ctx.beginPath();
        for (let i = 0, len = this.filings.length; i < len; i++) {
            const filing = this.filings[i];
            const cos = Math.cos(filing.angle);
            const sin = Math.sin(filing.angle);
            const dx = cos * half;
            const dy = sin * half;

            ctx.moveTo(filing.x - dx, filing.y - dy);
            ctx.lineTo(filing.x + dx, filing.y + dy);
        }
        ctx.stroke();

        // Optional: Draw cursor position indicator
        // this.drawCursor();
    }

    drawCursor() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            const isVisible = entries[0].isIntersecting;
            if (isVisible && !this.isVisible) {
                this.isVisible = true;
                this.animate();
            } else if (!isVisible) {
                this.isVisible = false;
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            }
        }, { threshold: 0 });

        observer.observe(this.canvas);
    }

    animate() {
        if (!this.isVisible) return;
        this.updateFilings();
        this.drawFilings();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MagneticFilings('magneticCanvas');
});
