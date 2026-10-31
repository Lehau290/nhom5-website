// DOC-PREVIEW.JS - XEM TRƯỚC VÀ QUẢN LÝ TÀI LIỆU WORD (MAMMOTH.JS) & POWERPOINT TRÌNH CHIẾU

// Bộ slide tương tác dự phòng chất lượng cao cho Bài 4 & Bài 5
const lessonFallbackSlides = {
    lesson_4: [
        { slide_number: 1, title: 'BÀI 4: TÌM KIẾM THÔNG TIN TRÊN INTERNET', content: 'Chào mừng các nhà thám hiểm nhí! Hôm nay chúng ta sẽ cùng bước vào thế giới Internet để khám phá kho tàng tri thức khổng lồ và học cách tìm kiếm thông tin nhanh chóng, chính xác.', bullet_points: 'Hiểu từ khóa là gì và cách chọn từ khóa thông minh\nNắm vững quy trình các bước tìm kiếm bằng máy tìm kiếm\nBiết mở và chọn lọc kết quả tìm kiếm đáng tin cậy\nThực hành an toàn trên không gian mạng', teacher_note: 'Giáo viên dẫn nhập tạo hứng thú học tập và nêu rõ mục tiêu bài học.' },
        { slide_number: 2, title: '1. Khởi động: Tình huống tìm hiểu về các Vua Hùng', content: 'Em muốn tìm hiểu thông tin về các vị Vua Hùng – những người đầu tiên có công dựng nên đất nước ta. Trong các cách sau, em sẽ chọn cách nào?', bullet_points: 'Cách 1: Hỏi ông bà, cha mẹ hoặc thầy cô giáo\nCách 2: Tìm đọc trong sách giáo khoa, thư viện trường\nCách 3: Sử dụng máy tính kết nối Internet để tra cứu\n=> Internet giúp em tìm thấy hình ảnh, video và tư liệu lịch sử chỉ sau vài giây!', teacher_note: 'Gợi mở cho học sinh thảo luận ưu điểm nổi bật của Internet.' },
        { slide_number: 3, title: '2. Từ khóa là gì? Khái niệm then chốt', content: 'Từ khóa (Keyword) là từ hoặc cụm từ ngắn gọn, cô đọng nhất thể hiện nội dung thông tin mà em đang muốn tìm kiếm trên Internet.', bullet_points: 'Từ khóa là "chìa khóa" giúp máy tìm kiếm mở đúng kho dữ liệu\nTừ khóa càng rõ ràng, kết quả trả về càng nhanh và chuẩn xác\nCó thể gõ tiếng Việt có dấu hoặc không dấu\nNên chọn các danh từ chính, tránh gõ câu hỏi dài dòng như văn nói', teacher_note: 'So sánh cho học sinh: Từ khóa giống như mục lục của cuốn sách.' },
        { slide_number: 4, title: '3. Chọn từ khóa thông minh', content: 'Cùng so sánh hai cách chọn từ khóa khi muốn tìm hiểu về các vị Vua Hùng:', bullet_points: 'Từ khóa quá chung: "Lịch sử" => Trả về hàng triệu trang không liên quan\nTừ khóa quá dài: "Hãy cho tôi biết những thông tin về các đời vua Hùng dựng nước"\nTừ khóa thông minh tối ưu: "Các đời vua Hùng" hoặc "Vua Hùng dựng nước"\n=> Ngắn gọn, súc tích và trúng đích!', teacher_note: 'Cho học sinh thực hành đặt từ khóa với chủ đề yêu thích.' },
        { slide_number: 5, title: '4. Máy tìm kiếm & Giao diện tra cứu Google', content: 'Máy tìm kiếm (Search Engine) là hệ thống phần mềm thu thập và lập chỉ mục các trang web. Google là công cụ tìm kiếm phổ biến nhất hiện nay.', bullet_points: 'Thanh địa chỉ: Nhập google.com để mở trang tìm kiếm\nÔ tìm kiếm: Nơi em gõ từ khóa cần tra cứu\nBiểu tượng kính lúp / Phím Enter: Bắt đầu lệnh tìm kiếm\nTrang kết quả: Danh sách các bài viết, hình ảnh, tài liệu liên quan', teacher_note: 'Thị phạm các thành phần trên màn hình máy tính của giáo viên.' },
        { slide_number: 6, title: '5. Quy trình 5 bước tìm kiếm thông tin chuẩn', content: 'Hãy ghi nhớ 5 bước tiêu chuẩn để trở thành chuyên gia tìm kiếm thông tin:', bullet_points: 'Bước 1: Mở trình duyệt web (Google Chrome, Cốc Cốc, Edge)\nBước 2: Truy cập trang công cụ tìm kiếm google.com\nBước 3: Nhập từ khóa ngắn gọn vào ô tìm kiếm\nBước 4: Nhấn phím Enter để máy tính lọc kết quả\nBước 5: Đọc tóm tắt và nhấp chuột vào tiêu đề phù hợp', teacher_note: 'Yêu cầu cả lớp đọc đồng thanh 5 bước để ghi nhớ.' },
        { slide_number: 7, title: '6. Các toán tử tìm kiếm nâng cao', content: 'Sử dụng các ký hiệu đặc biệt giúp lọc bỏ rác và thu hẹp kết quả cực kỳ hiệu quả:', bullet_points: 'Dấu ngoặc kép "cụm từ": Tìm chính xác nguyên văn theo đúng thứ tự từ\nDấu trừ (-): Loại trừ từ khóa không mong muốn (VD: Vua Hùng -tour)\nToán tử site:domain: Giới hạn tìm trên trang web uy tín (VD: site:moet.gov.vn)\nToán tử filetype:pdf/docx: Chỉ tìm tệp tài liệu sách điện tử hoặc bài giảng', teacher_note: 'Minh họa tìm kiếm tài liệu chuẩn phương pháp mới.' },
        { slide_number: 8, title: '7. Chọn lọc kết quả đáng tin cậy', content: 'Không phải mọi thông tin trên Internet đều đúng. Học sinh cần rèn luyện kỹ năng kiểm chứng để không bị dẫn dắt bởi tin giả (Fake News):', bullet_points: 'Kiểm tra tên miền uy tín: .gov (Chính phủ), .edu (Giáo dục)\nXem rõ tên tác giả và cơ quan xuất bản bài viết\nKiểm tra ngày đăng tải xem thông tin còn mới không\nĐối chiếu chéo với sách giáo khoa và các báo chính thống', teacher_note: 'Nhấn mạnh nguyên tắc an toàn: Không tin ngay tin tức giật gân trên mạng xã hội.' },
        { slide_number: 9, title: '8. Thực hành: Tra cứu thông tin "Hồ Gươm"', content: 'Nhiệm vụ thực hành trên máy tính dành cho các nhóm học sinh:', bullet_points: 'Nhập từ khóa: "Hồ Gươm Hà Nội" vào ô tìm kiếm\nQuan sát kết quả: Số lượng bài viết, hình ảnh và bản đồ xuất hiện\nNhấp vào một liên kết bài báo uy tín để đọc nguồn gốc tên gọi Hồ Hoàn Kiếm\nGhi chép 3 thông tin thú vị em tìm được vào phiếu học tập', teacher_note: 'Giáo viên xuống từng bàn hướng dẫn học sinh thao tác chuột và bàn phím.' },
        { slide_number: 10, title: '9. Tổng kết & Dặn dò bài học', content: 'Chúc mừng các em đã hoàn thành xuất sắc Bài học số 4!', bullet_points: 'Nhớ 5 bước tìm kiếm thông tin cơ bản\nLuôn chọn từ khóa ngắn gọn, đúng trọng tâm\nSử dụng Internet văn minh, an toàn và có sự hướng dẫn của người lớn\nVề nhà hoàn thành bài tập trắc nghiệm và vận dụng trên website', teacher_note: 'Tuyên dương tinh thần học tập tích cực của cả lớp.' }
    ],
    lesson_5: [
        { slide_number: 1, title: '1. Khái niệm Tệp (File)', content: 'Tệp là đơn vị lưu trữ thông tin cơ bản trên bộ nhớ ngoài (ổ đĩa cứng, USB, thẻ nhớ). Tên tệp gồm 2 phần ngăn cách bởi dấu chấm (.): [Tên tệp].[Phần mở rộng].', bullet_points: 'Phần tên: Do người dùng đặt (tối đa 255 ký tự)\nPhần mở rộng (đuôi tệp): Quy định loại tệp và phần mềm mở tệp\n.docx: Văn bản Microsoft Word\n.pptx: Bài trình chiếu Microsoft PowerPoint\n.xlsx: Bảng tính Microsoft Excel\n.mp4, .mp3: Tệp đa phương tiện âm thanh / video', teacher_note: 'Chú ý: Các ký tự cấm đặt trong tên tệp: / \\ : * ? " < > |' },
        { slide_number: 2, title: '2. Thư mục (Folder) & Cây thư mục', content: 'Thư mục là nơi chứa các tệp và các thư mục con khác. Việc tổ chức thư mục dạng hình cây giúp máy tính luôn gọn gàng và dễ tra cứu.', bullet_points: 'Thư mục gốc: Thư mục mức cao nhất của ổ đĩa (C:\\, D:\\)\nThư mục con (Subfolder): Nằm bên trong thư mục cha\nCây thư mục: Mô hình phân cấp từ tổng quan đến chi tiết\nĐường dẫn (Path): Tọa độ dẫn đến tệp/thư mục chính xác', teacher_note: 'Vẽ sơ đồ cây thư mục học tập mẫu trên bảng cho học sinh quan sát.' },
        { slide_number: 3, title: '3. Các thao tác cơ bản với Tệp & Thư mục', content: 'File Explorer (Windows Explorer) là công cụ trung tâm để quản lý mọi dữ liệu trên máy tính Windows:', bullet_points: 'Tạo thư mục mới: Ctrl + Shift + N\nĐổi tên tệp/thư mục: Phím F2 hoặc click chuột phải chọn Rename\nSao chép (Copy): Ctrl + C rồi dán Ctrl + V\nDi chuyển (Cut): Ctrl + X rồi dán Ctrl + V\nXóa tệp: Delete (vào Recycle Bin) hoặc Shift + Delete (xóa vĩnh viễn)', teacher_note: 'Cảnh báo học sinh cẩn thận với phím tắt Shift+Delete.' },
        { slide_number: 4, title: '4. Thói quen quản lý dữ liệu an toàn', content: 'Bảo vệ dữ liệu học tập và giữ máy tính hoạt động trơn tru bằng các nguyên tắc vàng:', bullet_points: 'Đặt tên tệp ngắn gọn, rõ nghĩa, không dấu hoặc dùng gạch dưới\nKhông để quá nhiều tệp nặng trên màn hình Desktop\nSao lưu dữ liệu định kỳ lên đám mây (OneDrive, Google Drive)\nTuyệt đối không xóa hoặc chỉnh sửa các tệp trong ổ C:\\Windows', teacher_note: 'Hướng dẫn học sinh tạo thói quen dọn dẹp thư mục sau mỗi học kỳ.' }
    ]
};

async function previewDocument(title, fileType, fileUrl) {
    const modal = document.getElementById('previewModal');
    if (!modal) return;

    // Chuẩn hóa đường dẫn tương đối tùy theo vị trí trang (admin hay trang gốc)
    let relativeUrl = fileUrl;
    if (window.location.pathname.includes('/admin/')) {
        if (!relativeUrl.startsWith('http') && !relativeUrl.startsWith('../') && !relativeUrl.startsWith('/')) {
            relativeUrl = '../' + relativeUrl;
        }
    } else {
        if (relativeUrl.startsWith('../')) {
            relativeUrl = relativeUrl.replace(/^\.\.\//, '');
        }
    }

    // Chuyển thành URL tuyệt đối (hỗ trợ hiển thị iframe trên GitHub Pages hoặc máy chủ trực tuyến)
    let absoluteUrl = relativeUrl;
    if (!relativeUrl.startsWith('http://') && !relativeUrl.startsWith('https://')) {
        try {
            absoluteUrl = new URL(relativeUrl, window.location.href).href;
        } catch(e) {
            absoluteUrl = window.location.origin + '/' + relativeUrl.replace(/^\.\.\//, '');
        }
    }

    document.getElementById('preview-file-title').textContent = title;
    const ft = (fileType || '').toLowerCase();
    document.getElementById('preview-file-badge').textContent = (ft === 'docx' ? 'Microsoft Word (.docx)' : 'Microsoft PowerPoint (.pptx)');
    document.getElementById('preview-file-icon').innerHTML = (ft === 'docx' ? '<i class="fas fa-file-word text-blue-600"></i>' : '<i class="fas fa-file-powerpoint text-orange-600"></i>');
    document.getElementById('preview-download-link').href = relativeUrl;

    const contentArea = document.getElementById('preview-body-content');
    contentArea.innerHTML = `
        <div class="py-12 text-center text-slate-500">
            <i class="fas fa-spinner fa-spin text-3xl text-indigo-600 mb-3"></i>
            <p class="text-sm font-medium">Đang khởi tạo trình xem slide / tài liệu...</p>
        </div>
    `;

    modal.classList.add('open');

    // 1. XEM TRƯỚC FILE WORD (.DOCX)
    if (ft === 'docx') {
        try {
            const response = await fetch(relativeUrl);
            if (!response.ok) throw new Error('Không thể tải tệp tin');
            const arrayBuffer = await response.arrayBuffer();

            if (window.mammoth) {
                const result = await window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                contentArea.innerHTML = `
                    <div class="docx-preview-content p-6 bg-white rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed max-h-[65vh] overflow-y-auto text-left shadow-inner">
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
                    <h4 class="font-bold text-slate-800 text-base mb-2">Tài Liệu Giáo Án Word (.docx)</h4>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                        Tài liệu đã sẵn sàng. Bạn có thể nhấn nút "Tải Về Máy" bên dưới để mở tài liệu bằng Microsoft Word hoặc WPS Office.
                    </p>
                </div>
            `;
        }
    } 
    // 2. XEM TRƯỚC BẢN TRÌNH CHIẾU POWERPOINT (.PPTX)
    else if (ft === 'pptx') {
        const isOnline = window.location.protocol.startsWith('http');
        const encodedUrl = encodeURIComponent(absoluteUrl);
        const isLesson5 = (title.includes('5') || relativeUrl.includes('5') || relativeUrl.includes('thu_muc'));
        const lessonKey = isLesson5 ? 'lesson_5' : 'lesson_4';

        // Giao diện trình xem PowerPoint kèm thanh chuyển đổi thông minh
        let headerControls = `
            <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-2xl mb-4 border border-slate-200">
                <div class="flex items-center gap-1.5 text-xs">
                    <span class="font-bold text-slate-700 mr-1"><i class="fas fa-sliders-h text-indigo-600 mr-1"></i>Chế độ xem:</span>
                    <button id="btn-view-office" onclick="switchSlideViewMode('office', '${encodedUrl}', '${lessonKey}')" class="px-3 py-1.5 rounded-xl font-bold transition bg-white text-indigo-700 shadow-sm border border-slate-200">
                        <i class="fas fa-globe mr-1"></i> Microsoft Office Viewer
                    </button>
                    <button id="btn-view-google" onclick="switchSlideViewMode('google', '${encodedUrl}', '${lessonKey}')" class="px-3 py-1.5 rounded-xl font-bold transition text-slate-600 hover:bg-white hover:text-indigo-600">
                        <i class="fab fa-google mr-1"></i> Google Docs Viewer
                    </button>
                    <button id="btn-view-interactive" onclick="switchSlideViewMode('interactive', '${encodedUrl}', '${lessonKey}')" class="px-3 py-1.5 rounded-xl font-bold transition text-slate-600 hover:bg-white hover:text-indigo-600">
                        <i class="fas fa-chalkboard mr-1"></i> Slide Tương Tác Số
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <a href="${absoluteUrl}" target="_blank" class="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1" title="Mở trực tiếp liên kết tệp">
                        <i class="fas fa-external-link-alt"></i> Mở tab mới
                    </a>
                </div>
            </div>
        `;

        if (isOnline) {
            // Khi chạy trên GitHub Pages hoặc Server trực tuyến: Nhúng trực tiếp Microsoft Office Online Viewer
            contentArea.innerHTML = `
                ${headerControls}
                <div id="slide-display-frame" class="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner" style="height: 520px;">
                    <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}" class="w-full h-full border-0" allowfullscreen="true"></iframe>
                </div>
            `;
        } else {
            // Khi mở local (file:///): Hiển thị ngay bộ Slide tương tác trực tiếp
            contentArea.innerHTML = `
                ${headerControls}
                <div id="slide-display-frame" class="w-full">
                    <!-- Trình chiếu Slide Tương Tác -->
                </div>
            `;
            // Tự động kích hoạt tab Interactive Slide khi ở môi trường offline/local
            switchSlideViewMode('interactive', encodedUrl, lessonKey);
        }
    }
}

// Chuyển đổi giữa các chế độ xem Slide trong Modal
function switchSlideViewMode(mode, encodedUrl, lessonKey) {
    const frame = document.getElementById('slide-display-frame');
    if (!frame) return;

    // Cập nhật trạng thái nút bấm
    const btnOffice = document.getElementById('btn-view-office');
    const btnGoogle = document.getElementById('btn-view-google');
    const btnInteractive = document.getElementById('btn-view-interactive');

    [btnOffice, btnGoogle, btnInteractive].forEach(btn => {
        if (btn) {
            btn.className = 'px-3 py-1.5 rounded-xl font-bold transition text-slate-600 hover:bg-white hover:text-indigo-600';
        }
    });

    if (mode === 'office') {
        if (btnOffice) btnOffice.className = 'px-3 py-1.5 rounded-xl font-bold transition bg-white text-indigo-700 shadow-sm border border-slate-200';
        frame.className = 'relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner';
        frame.style.height = '520px';
        frame.innerHTML = `<iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}" class="w-full h-full border-0" allowfullscreen="true"></iframe>`;
    } else if (mode === 'google') {
        if (btnGoogle) btnGoogle.className = 'px-3 py-1.5 rounded-xl font-bold transition bg-white text-indigo-700 shadow-sm border border-slate-200';
        frame.className = 'relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner';
        frame.style.height = '520px';
        frame.innerHTML = `<iframe src="https://docs.google.com/viewer?url=${encodedUrl}&embedded=true" class="w-full h-full border-0" allowfullscreen="true"></iframe>`;
    } else if (mode === 'interactive') {
        if (btnInteractive) btnInteractive.className = 'px-3 py-1.5 rounded-xl font-bold transition bg-white text-indigo-700 shadow-sm border border-slate-200';
        frame.className = 'w-full';
        frame.style.height = 'auto';

        const slides = lessonFallbackSlides[lessonKey] || lessonFallbackSlides.lesson_4;
        frame.innerHTML = `<div id="modal-interactive-slide-box" class="rounded-2xl overflow-hidden shadow-lg border border-slate-200"></div>`;

        // Khởi tạo SlideViewer bên trong modal
        if (window.SlideViewer) {
            new SlideViewer('modal-interactive-slide-box', slides);
        } else {
            frame.innerHTML = `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <p class="text-sm font-bold text-slate-700">Slide bài giảng đã sẵn sàng.</p>
                </div>
            `;
        }
    }
}

function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.remove('open');
        // Xóa src của iframe để dừng video/âm thanh ngầm khi đóng
        const contentArea = document.getElementById('preview-body-content');
        if (contentArea) contentArea.innerHTML = '';
    }
}
