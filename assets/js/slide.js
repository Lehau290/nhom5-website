// SLIDE.JS - TRÌNH CHIẾU BÀI GIẢNG ĐIỆN TỬ TƯƠNG TÁC

class SlideViewer {
    constructor(containerId, slidesData) {
        this.container = document.getElementById(containerId);
        this.slides = slidesData;
        this.currentIndex = 0;
        this.isFullscreen = false;
        
        if (!this.container || !this.slides || this.slides.length === 0) return;

        this.initDOM();
        this.renderSlide(0);
        this.bindEvents();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="slide-container p-6 md:p-10 flex flex-col justify-between" id="slide-wrapper">
                <!-- Header của Slide -->
                <div class="flex items-center justify-between border-b border-indigo-900/60 pb-4 mb-6">
                    <div class="flex items-center gap-3">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </span>
                        <h4 class="font-bold text-indigo-200 text-base md:text-lg tracking-wide uppercase" id="slide-header-title">
                            Bài giảng điện tử
                        </h4>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1 rounded-full bg-slate-800 text-indigo-300 text-xs font-semibold" id="slide-counter">
                            1 / ${this.slides.length}
                        </span>
                        <button id="btn-toggle-note" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Ghi chú giáo viên">
                            <i class="fas fa-sticky-note"></i>
                        </button>
                        <button id="btn-fullscreen" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Toàn màn hình">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>

                <!-- Nội dung chính của Slide -->
                <div class="slide-content-area flex-1 flex flex-col justify-center animate-fade-in" id="slide-body">
                    <!-- Dynamic Content -->
                </div>

                <!-- Ghi chú giáo viên (ẩn/hiện) -->
                <div id="slide-note-box" class="hidden mt-4 p-4 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-amber-300 text-sm">
                    <i class="fas fa-info-circle mr-2"></i><span id="slide-note-content"></span>
                </div>

                <!-- Footer điều hướng -->
                <div class="flex items-center justify-between border-t border-indigo-900/60 pt-6 mt-8">
                    <button id="btn-prev-slide" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-medium text-sm flex items-center gap-2 transition disabled:opacity-30 disabled:pointer-events-none">
                        <i class="fas fa-arrow-left"></i> Trang trước
                    </button>
                    
                    <!-- Progress bar -->
                    <div class="hidden sm:flex flex-1 mx-8 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div id="slide-progress" class="h-full bg-indigo-500 transition-all duration-300" style="width: 0%"></div>
                    </div>

                    <button id="btn-next-slide" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 transition disabled:opacity-30 disabled:pointer-events-none">
                        Trang tiếp <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        this.currentIndex = index;
        const slide = this.slides[index];

        document.getElementById('slide-counter').textContent = `${index + 1} / ${this.slides.length}`;
        const progressPct = ((index + 1) / this.slides.length) * 100;
        document.getElementById('slide-progress').style.width = `${progressPct}%`;

        // Render bullets if any
        let bulletsHtml = '';
        if (slide.bullet_points) {
            const lines = slide.bullet_points.split('\n').filter(l => l.trim().length > 0);
            bulletsHtml = '<ul class="space-y-3 mt-6">';
            lines.forEach(line => {
                bulletsHtml += `
                    <li class="flex items-start gap-3 text-slate-300 text-base md:text-lg">
                        <span class="inline-flex mt-1 text-indigo-400"><i class="fas fa-check-circle"></i></span>
                        <span>${line}</span>
                    </li>
                `;
            });
            bulletsHtml += '</ul>';
        }

        const body = document.getElementById('slide-body');
        body.innerHTML = `
            <div class="max-w-3xl">
                <div class="inline-block px-3 py-1 mb-3 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    PHẦN HÌNH THÀNH KIẾN THỨC
                </div>
                <h3 class="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                    ${slide.title}
                </h3>
                <p class="text-slate-300 text-lg md:text-xl leading-relaxed font-light">
                    ${slide.content}
                </p>
                ${bulletsHtml}
            </div>
        `;

        // Note
        const noteBox = document.getElementById('slide-note-box');
        const noteContent = document.getElementById('slide-note-content');
        if (slide.teacher_note) {
            noteContent.textContent = "Ghi chú: " + slide.teacher_note;
        } else {
            noteBox.classList.add('hidden');
        }

        // Disable buttons
        document.getElementById('btn-prev-slide').disabled = (index === 0);
        document.getElementById('btn-next-slide').disabled = (index === this.slides.length - 1);
    }

    bindEvents() {
        document.getElementById('btn-prev-slide').addEventListener('click', () => {
            if (this.currentIndex > 0) this.renderSlide(this.currentIndex - 1);
        });

        document.getElementById('btn-next-slide').addEventListener('click', () => {
            if (this.currentIndex < this.slides.length - 1) this.renderSlide(this.currentIndex + 1);
        });

        document.getElementById('btn-toggle-note').addEventListener('click', () => {
            const noteBox = document.getElementById('slide-note-box');
            noteBox.classList.toggle('hidden');
        });

        const fsBtn = document.getElementById('btn-fullscreen');
        const wrapper = document.getElementById('slide-wrapper');
        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                wrapper.requestFullscreen().catch(err => alert(err.message));
                fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });

        // Bàn phím điều hướng
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                if (this.currentIndex < this.slides.length - 1) this.renderSlide(this.currentIndex + 1);
            } else if (e.key === 'ArrowLeft') {
                if (this.currentIndex > 0) this.renderSlide(this.currentIndex - 1);
            }
        });
    }
}

