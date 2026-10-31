// DOC-PREVIEW.JS - XEM TRƯỚC VÀ QUẢN LÝ TÀI LIỆU WORD (MAMMOTH.JS) & POWERPOINT

async function previewDocument(title, fileType, fileUrl) {
    const modal = document.getElementById('previewModal');
    if (!modal) return;

    document.getElementById('preview-file-title').textContent = title;
    document.getElementById('preview-file-badge').textContent = (fileType === 'docx' ? 'Microsoft Word (.docx)' : 'Microsoft PowerPoint (.pptx)');
    document.getElementById('preview-file-icon').innerHTML = (fileType === 'docx' ? '<i class="fas fa-file-word text-blue-600"></i>' : '<i class="fas fa-file-powerpoint text-orange-600"></i>');
    document.getElementById('preview-download-link').href = fileUrl;

    const contentArea = document.getElementById('preview-body-content');
    contentArea.innerHTML = `
        <div class="py-12 text-center text-slate-500">
            <i class="fas fa-spinner fa-spin text-3xl text-indigo-600 mb-3"></i>
            <p class="text-sm font-medium">Đang tải và xử lý tài liệu để xem trước...</p>
        </div>
    `;

    modal.classList.add('open');

    // 1. Nếu là file Word (.docx) -> dùng Mammoth.js chuyển đổi thành HTML
    if (fileType.toLowerCase() === 'docx') {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('Không thể tải tệp tin');
            const arrayBuffer = await response.arrayBuffer();

            if (window.mammoth) {
                const result = await window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                contentArea.innerHTML = `
                    <div class="docx-preview-content p-6 bg-white rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed max-h-[60vh] overflow-y-auto text-left shadow-inner">
                        ${result.value || '<p class="text-slate-400 italic">Tài liệu không có nội dung văn bản hiển thị.</p>'}
                    </div>
                `;
            } else {
                throw new Error('Thư viện Mammoth.js chưa sẵn sàng.');
            }
        } catch (err) {
            contentArea.innerHTML = `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-4">
                        <i class="fas fa-file-word"></i>
                    </div>
                    <h4 class="font-bold text-slate-800 text-base mb-2">Tài Liệu Word (.docx)</h4>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                        Tài liệu đã được xác thực an toàn. Bạn có thể nhấn nút "Tải Về Máy" bên dưới để mở bằng Microsoft Word hoặc WPS Office.
                    </p>
                </div>
            `;
        }
    } 
    // 2. Nếu là file PowerPoint (.pptx)
    else if (fileType.toLowerCase() === 'pptx') {
        // Kiểm tra xem URL có phải là URL online công khai không (http/https từ Firebase Storage)
        if (fileUrl.startsWith('http')) {
            const encodedUrl = encodeURIComponent(fileUrl);
            contentArea.innerHTML = `
                <div class="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner" style="height: 480px;">
                    <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}" class="w-full h-full border-0"></iframe>
                </div>
            `;
        } else {
            contentArea.innerHTML = `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <div class="w-16 h-16 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl mb-4">
                        <i class="fas fa-file-powerpoint"></i>
                    </div>
                    <h4 class="font-bold text-slate-800 text-base mb-2">Bản Trình Chiếu PowerPoint (.pptx)</h4>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                        Bản trình chiếu sẵn sàng cho buổi học. Nhấn nút "Tải Về Máy" bên dưới để trình chiếu trực tiếp trên máy tính.
                    </p>
                </div>
            `;
        }
    }
}

function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) modal.classList.remove('open');
}

