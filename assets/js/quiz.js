// QUIZ.JS - HỆ THỐNG TRẮC NGHIỆM TƯƠNG TÁC & TỰ ĐỘNG CHẤM ĐIỂM CLOUD FIRESTORE

class QuizEngine {
    constructor(containerId, lessonId, questions) {
        this.container = document.getElementById(containerId);
        this.lessonId = lessonId;
        this.questions = questions;
        this.userAnswers = {}; // { questionIndex: choiceLabel }
        this.isSubmitted = false;

        if (!this.container || !this.questions || this.questions.length === 0) {
            if (this.container) {
                this.container.innerHTML = `
                    <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                        <i class="fas fa-tasks text-3xl mb-2 block"></i>
                        Đang đồng bộ câu hỏi trắc nghiệm từ Cloud Firestore...
                    </div>
                `;
            }
            return;
        }

        this.render();
    }

    render() {
        let html = `
            <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">
                            <i class="fas fa-tasks text-indigo-600 mr-2"></i>Bài Luyện Tập Trắc Nghiệm
                        </h3>
                        <p class="text-xs sm:text-sm text-slate-500 mt-1">Gồm ${this.questions.length} câu hỏi tương tác. Điểm số được tự động đồng bộ lên Cloud Firestore.</p>
                    </div>
                    <div id="quiz-badge" class="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 self-start sm:self-auto">
                        Chưa nộp bài
                    </div>
                </div>

                <div class="space-y-8" id="quiz-questions-list">
        `;

        this.questions.forEach((q, qIndex) => {
            html += `
                <div class="question-block border-b border-slate-100 pb-6 last:border-b-0" data-qidx="${qIndex}">
                    <div class="flex items-start gap-3 mb-4">
                        <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                            ${qIndex + 1}
                        </span>
                        <div class="text-slate-800 font-semibold text-base leading-snug">
                            ${escapeHtml(q.question_text)}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-11">
            `;

            (q.answers || []).forEach(a => {
                html += `
                    <div class="quiz-option p-3.5 rounded-xl flex items-center gap-3 cursor-pointer" 
                         data-qidx="${qIndex}" 
                         data-label="${a.choice_label}" 
                         onclick="window.quizInstance.selectAnswer(${qIndex}, '${a.choice_label}')">
                        <span class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200 option-badge">
                            ${a.choice_label}
                        </span>
                        <span class="text-slate-700 text-sm flex-1">${escapeHtml(a.answer_text)}</span>
                    </div>
                `;
            });

            html += `
                    </div>
                    <!-- Explanation Box -->
                    <div class="explanation-box hidden mt-4 pl-0 md:pl-11 animate-fade-in">
                        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                            <span class="font-bold text-indigo-700"><i class="fas fa-lightbulb mr-1"></i>Giải thích:</span> 
                            ${escapeHtml(q.explanation || 'Không có giải thích bổ sung.')}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>

                <!-- Footer hành động -->
                <div class="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div id="quiz-summary-text" class="text-xs sm:text-sm text-slate-500 font-medium">
                        Đã chọn <span id="answered-count">0</span>/${this.questions.length} câu
                    </div>
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <button id="btn-submit-quiz" onclick="window.quizInstance.submitQuiz()" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                            <i class="fas fa-paper-plane"></i> Nộp Bài & Chấm Điểm
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        window.quizInstance = this;
    }

    selectAnswer(qIndex, choiceLabel) {
        if (this.isSubmitted) return;

        this.userAnswers[qIndex] = choiceLabel;

        // Cập nhật UI lựa chọn
        const qBlock = document.querySelector(`.question-block[data-qidx="${qIndex}"]`);
        if (qBlock) {
            const options = qBlock.querySelectorAll('.quiz-option');
            options.forEach(opt => {
                if (opt.getAttribute('data-label') === choiceLabel) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            });
        }

        // Cập nhật số câu đã làm
        const answeredCount = Object.keys(this.userAnswers).length;
        const countSpan = document.getElementById('answered-count');
        if (countSpan) countSpan.textContent = answeredCount;
    }

    async submitQuiz() {
        if (this.isSubmitted) return;

        const totalQ = this.questions.length;
        const answeredQ = Object.keys(this.userAnswers).length;

        if (answeredQ < totalQ) {
            if (!confirm(`Bạn mới chỉ trả lời ${answeredQ}/${totalQ} câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?`)) {
                return;
            }
        }

        let correctCount = 0;

        // Đánh giá từng câu
        this.questions.forEach((q, qIndex) => {
            const userChoice = this.userAnswers[qIndex];
            const qBlock = document.querySelector(`.question-block[data-qidx="${qIndex}"]`);
            if (!qBlock) return;

            const options = qBlock.querySelectorAll('.quiz-option');
            options.forEach(opt => {
                const label = opt.getAttribute('data-label');
                const ansObj = (q.answers || []).find(a => a.choice_label === label);
                
                if (ansObj && ansObj.is_correct == 1) {
                    opt.classList.add('correct');
                } else if (label === userChoice && (!ansObj || ansObj.is_correct != 1)) {
                    opt.classList.add('incorrect');
                }
            });

            // Hiển thị giải thích
            const expBox = qBlock.querySelector('.explanation-box');
            if (expBox) expBox.classList.remove('hidden');

            // Kiểm tra đúng sai
            const chosenAns = (q.answers || []).find(a => a.choice_label === userChoice);
            if (chosenAns && chosenAns.is_correct == 1) {
                correctCount++;
            }
        });

        this.isSubmitted = true;
        const score = Math.round((correctCount / totalQ) * 10 * 10) / 10;

        // Cập nhật UI
        const badge = document.getElementById('quiz-badge');
        if (badge) {
            badge.className = 'px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-extrabold border border-emerald-300';
            badge.innerHTML = `<i class="fas fa-trophy mr-1"></i> Kết Quả: ${score} / 10 (${correctCount}/${totalQ} câu đúng)`;
        }

        const btnSubmit = document.getElementById('btn-submit-quiz');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.classList.add('opacity-50', 'pointer-events-none');
            btnSubmit.innerHTML = `<i class="fas fa-check-circle"></i> Đã nộp bài`;
        }

        // Lưu kết quả trực tuyến vào Cloud Firestore
        try {
            let userId = 'guest';
            let userName = 'Học sinh khách';
            let userEmail = 'guest@edumail.vn';

            if (auth.currentUser) {
                userId = auth.currentUser.uid;
                userName = auth.currentUser.displayName || auth.currentUser.email.split('@')[0];
                userEmail = auth.currentUser.email;
            } else {
                const localUser = localStorage.getItem('edu_current_user');
                if (localUser) {
                    try {
                        const parsed = JSON.parse(localUser);
                        userId = parsed.uid || 'demo_student_uid';
                        userName = parsed.fullname || parsed.username || 'Học sinh';
                        userEmail = parsed.email || 'hocsinh1@student.vn';
                    } catch(e) {}
                }
            }

            await db.collection('results').add({
                user_id: userId,
                user_name: userName,
                user_email: userEmail,
                lesson_id: this.lessonId,
                score: score,
                correct_count: correctCount,
                total_questions: totalQ,
                completed_at: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (userId !== 'guest') {
                showToast(`Tuyệt vời! Kết quả (${score}/10 điểm) đã được đồng bộ vào hồ sơ Cloud Firestore của bạn.`, 'success');
                logActivity('Làm bài tập', `Học sinh ${userName} hoàn thành bài kiểm tra đạt ${score}/10 điểm`);
            } else {
                showToast(`Bạn đạt ${score}/10 điểm! Hãy đăng nhập để lưu kết quả vào bảng xếp hạng.`, 'info');
            }
        } catch (e) {
            console.error('Lỗi lưu kết quả Firestore:', e);
            showToast('Đã chấm điểm thành công! (Điểm: ' + score + '/10)', 'success');
        }
    }
}
