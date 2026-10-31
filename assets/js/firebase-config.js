// FIREBASE-CONFIG.JS - KHỞI TẠO VÀ QUẢN TRỊ DỊCH VỤ FIREBASE (AUTH, FIRESTORE, STORAGE)

// Cấu hình Firebase mặc định dự án Tin Học Nhóm 5
// Người dùng có thể cập nhật các thông số từ Firebase Console
const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB_DEMO_KEY_TINHOC_NHOM5_2026_FIREBASE",
    authDomain: "tinhoc-nhom5-edu.firebaseapp.com",
    projectId: "tinhoc-nhom5-edu",
    storageBucket: "tinhoc-nhom5-edu.appspot.com",
    messagingSenderId: "105002026001",
    appId: "1:105002026001:web:9876543210abcdef"
};

// Cho phép nạp cấu hình tùy chỉnh từ localStorage nếu có
let activeConfig = DEFAULT_FIREBASE_CONFIG;
try {
    const savedConfig = localStorage.getItem('edu_custom_firebase_config');
    if (savedConfig) {
        activeConfig = JSON.parse(savedConfig);
    }
} catch (e) {
    console.warn('Dùng cấu hình Firebase mặc định');
}

// Khởi tạo Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(activeConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Bật hỗ trợ lưu offline của Firestore nếu có thể
try {
    db.enablePersistence({ synchronizeTabs: true }).catch(err => {
        // Multi-tab hoặc browser không hỗ trợ
    });
} catch (e) {}

// HELPER: Lấy thông tin chi tiết của người dùng từ Firestore (bao gồm vai trò role)
async function getUserProfile(uid) {
    if (!uid) return null;
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            return { uid, ...doc.data() };
        }
    } catch (e) {
        console.error('Lỗi lấy profile:', e);
    }
    return null;
}

// HELPER: Đăng nhập hỗ trợ bằng Email HOẶC Username
async function signInUser(usernameOrEmail, password, remember = true) {
    const persistence = remember 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;
    await auth.setPersistence(persistence);

    let emailToUse = usernameOrEmail.trim();

    // Nếu người dùng nhập username (không có @), tìm email tương ứng trong Firestore
    if (!emailToUse.includes('@')) {
        const querySnapshot = await db.collection('users')
            .where('username', '==', emailToUse.toLowerCase())
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            throw new Error('Tài khoản hoặc email không tồn tại trong hệ thống.');
        }

        const userDoc = querySnapshot.docs[0];
        emailToUse = userDoc.data().email;
    }

    // Xác thực qua Firebase Authentication
    const userCredential = await auth.signInWithEmailAndPassword(emailToUse, password);
    const user = userCredential.user;

    // Lấy thông tin vai trò và kiểm tra trạng thái khóa
    let profile = await getUserProfile(user.uid);

    // Nếu profile chưa tồn tại (tài khoản tạo trực tiếp trên Auth), tự động tạo hồ sơ mặc định
    if (!profile) {
        const role = (user.email === 'admin@edumail.vn' || user.email.startsWith('admin')) ? 'admin' : 'student';
        const newProfile = {
            uid: user.uid,
            username: user.email.split('@')[0],
            fullname: user.displayName || 'Người dùng',
            email: user.email,
            role: role,
            status: 1,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('users').doc(user.uid).set(newProfile);
        profile = newProfile;
    }

    // Kiểm tra khóa tài khoản
    if (profile.status === 0) {
        await auth.signOut();
        throw new Error('Tài khoản này đã bị khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ.');
    }

    // Ghi log hoạt động
    logActivity('Đăng nhập', `Người dùng ${profile.fullname} (${profile.role}) đăng nhập thành công`);

    return profile;
}

// HELPER: Đăng ký tài khoản học sinh
async function registerStudentAccount(email, username, fullname, password) {
    // 1. Kiểm tra username đã tồn tại chưa
    const checkUsername = await db.collection('users')
        .where('username', '==', username.trim().toLowerCase())
        .limit(1)
        .get();

    if (!checkUsername.empty) {
        throw new Error('Tên tài khoản (username) này đã có người sử dụng. Vui lòng chọn tên khác.');
    }

    // 2. Tạo tài khoản trên Firebase Authentication
    const cred = await auth.createUserWithEmailAndPassword(email.trim(), password);
    const user = cred.user;

    await user.updateProfile({ displayName: fullname.trim() });

    // 3. Lưu thông tin hồ sơ vào Cloud Firestore
    const profile = {
        uid: user.uid,
        username: username.trim().toLowerCase(),
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        role: 'student', // Mặc định là học sinh
        status: 1, // Hoạt động
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(user.uid).set(profile);
    logActivity('Đăng ký', `Học sinh mới ${fullname} tạo tài khoản thành công`);

    return profile;
}

// HELPER: Ghi log lịch sử hoạt động
async function logActivity(action, details) {
    try {
        const user = auth.currentUser;
        await db.collection('activities').add({
            action: action,
            details: details,
            user_id: user ? user.uid : 'guest',
            user_email: user ? user.email : 'guest',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        // Bỏ qua lỗi log
    }
}

// HELPER: Khởi tạo toàn bộ dữ liệu mẫu lên Cloud Firestore (Seed Firestore)
// Gọi hàm này khi bắt đầu để đưa nội dung Bài 4, Bài 5, Slides, Câu hỏi, Nhóm 5 lên Firestore
async function seedInitialFirestoreData() {
    console.log('Đang kiểm tra và đồng bộ dữ liệu chuẩn lên Cloud Firestore...');
    
    // 1. Kiểm tra collection lessons
    const lessonsSnap = await db.collection('lessons').get();
    if (lessonsSnap.empty) {
        console.log('Đang tạo collection: lessons...');
        await db.collection('lessons').doc('lesson_4').set({
            lesson_number: 4,
            title: 'Tìm kiếm thông tin trên Internet',
            slug: 'bai-4-tim-kiem-thong-tin-tren-internet',
            description: 'Học sinh nắm vững khái niệm máy tìm kiếm, cách lựa chọn từ khóa thông minh, sử dụng các toán tử tìm kiếm nâng cao và đánh giá tính chính xác của thông tin trên mạng.',
            duration: '45 phút',
            is_active: 1,
            views: 156,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('lessons').doc('lesson_5').set({
            lesson_number: 5,
            title: 'Thao tác với tệp và thư mục',
            slug: 'bai-5-thao-tac-voi-tep-va-thu-muc',
            description: 'Hiểu rõ cấu trúc tệp (tên và phần mở rộng), cấu trúc cây thư mục. Thành thạo các thao tác: tạo mới, đổi tên, sao chép, di chuyển và xóa tệp/thư mục an toàn.',
            duration: '45 phút',
            is_active: 1,
            views: 112,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Sections
        console.log('Đang tạo collection: lesson_sections...');
        await db.collection('lesson_sections').doc('sec_4_warmup').set({
            lesson_id: 'lesson_4',
            section_type: 'warmup',
            title: 'Khởi động: Thử thách tìm kiếm nhanh',
            content: '<div class="p-4 bg-amber-50 rounded-xl border border-amber-200"><h4 class="font-bold text-amber-800 text-lg mb-2"><i class="fas fa-lightbulb text-amber-500 mr-2"></i>Tình huống thực tế:</h4><p class="text-gray-700 leading-relaxed mb-3">Bạn Nam muốn tìm tài liệu về <strong>"Địa đạo Củ Chi"</strong> để làm bài thuyết trình Lịch sử, nhưng khi gõ từ khóa trên Google thì xuất hiện hàng triệu kết quả lẫn lộn các bài viết quảng cáo tour du lịch. Làm thế nào để Nam có thể tìm được chính xác bài viết học thuật hoặc tài liệu định dạng PDF/Word trong vòng chưa đầy 1 phút?</p><p class="text-gray-600 italic"><i class="fas fa-question-circle mr-1"></i>Hãy cùng bước vào bài học hôm nay để khám phá những bí kíp tìm kiếm đỉnh cao nhé!</p></div>',
            order_num: 1
        });

        await db.collection('lesson_sections').doc('sec_4_knowledge').set({
            lesson_id: 'lesson_4',
            section_type: 'knowledge',
            title: 'Hình thành kiến thức: Các kỹ thuật tìm kiếm thông tin',
            content: 'Nội dung kiến thức cốt lõi được trực quan hóa qua hệ thống Slide bài giảng bên dưới.',
            order_num: 2
        });

        await db.collection('lesson_sections').doc('sec_4_practice').set({
            lesson_id: 'lesson_4',
            section_type: 'practice',
            title: 'Luyện tập: Kiểm tra kiến thức tìm kiếm',
            content: 'Làm bài kiểm tra trắc nghiệm 5 câu hỏi nhanh để củng cố kỹ năng tìm kiếm và ghi điểm vào hệ thống học tập.',
            order_num: 3
        });

        await db.collection('lesson_sections').doc('sec_4_application').set({
            lesson_id: 'lesson_4',
            section_type: 'application',
            title: 'Vận dụng: Trở thành chuyên gia tra cứu thông tin',
            content: '<div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200"><h4 class="font-bold text-emerald-800 text-lg mb-2"><i class="fas fa-tasks mr-2 text-emerald-600"></i>Nhiệm vụ thực hành tại nhà:</h4><ol class="list-decimal pl-5 space-y-2 text-gray-700"><li>Sử dụng toán tử <code>filetype:pdf</code> để tìm và tải 1 cuốn cẩm nang an toàn trên không gian mạng.</li><li>Sử dụng toán tử <code>site:edu.vn</code> để tìm thông tin tuyển sinh hoặc tài liệu học tập của một trường Đại học.</li><li>Sử dụng dấu ngoặc kép <code>"..."</code> để tìm nguồn gốc xuất xứ của một câu danh ngôn em yêu thích.</li><li>Chụp lại màn hình kết quả và ghi chép vào vở bài tập Tin học.</li></ol></div>',
            order_num: 4
        });

        // Sections bài 5
        await db.collection('lesson_sections').doc('sec_5_warmup').set({
            lesson_id: 'lesson_5',
            section_type: 'warmup',
            title: 'Khởi động: Bàn làm việc gọn gàng',
            content: '<div class="p-4 bg-blue-50 rounded-xl border border-blue-200"><h4 class="font-bold text-blue-800 text-lg mb-2"><i class="fas fa-folder-open text-blue-500 mr-2"></i>Câu hỏi kích thích tư duy:</h4><p class="text-gray-700 leading-relaxed mb-3">Hãy tưởng tượng bàn học của em có hàng trăm cuốn sách, vở, giấy vẽ nằm chồng chất không phân loại. Khi cần tìm cuốn vở bài tập Tin học, em sẽ mất bao lâu? Tương tự, nếu ổ đĩa máy tính chứa hàng nghìn tệp ảnh, video, tài liệu để lung tung tại màn hình Desktop thì chuyện gì sẽ xảy ra?</p><p class="text-gray-600 italic"><i class="fas fa-arrow-right mr-1"></i>Hệ thống tệp và thư mục chính là những ngăn tủ thần kỳ giúp máy tính của em luôn ngăn nắp và truy xuất nhanh chóng!</p></div>',
            order_num: 1
        });

        await db.collection('lesson_sections').doc('sec_5_knowledge').set({
            lesson_id: 'lesson_5',
            section_type: 'knowledge',
            title: 'Hình thành kiến thức: Tổ chức tệp và thư mục trên máy tính',
            content: 'Nội dung kiến thức về tệp, phần mở rộng, đường dẫn và các thao tác cơ bản được thể hiện qua hệ thống Slide tương tác.',
            order_num: 2
        });

        await db.collection('lesson_sections').doc('sec_5_practice').set({
            lesson_id: 'lesson_5',
            section_type: 'practice',
            title: 'Luyện tập: Thử thách kỹ năng quản lý tệp',
            content: 'Trả lời các câu hỏi tình huống thực tế để nhận biết đuôi tệp, cấu trúc thư mục và các phím tắt quan trọng.',
            order_num: 3
        });

        await db.collection('lesson_sections').doc('sec_5_application').set({
            lesson_id: 'lesson_5',
            section_type: 'application',
            title: 'Vận dụng: Xây dựng cây thư mục học tập',
            content: '<div class="p-4 bg-purple-50 rounded-xl border border-purple-200"><h4 class="font-bold text-purple-800 text-lg mb-2"><i class="fas fa-sitemap mr-2 text-purple-600"></i>Bài tập thực hành trên máy tính:</h4><p class="text-gray-700 mb-2">Trên ổ đĩa <code>D:</code> hoặc thư mục <code>Documents</code> của máy tính, hãy xây dựng cây thư mục như sau:</p><pre class="bg-gray-800 text-green-400 p-3 rounded-lg text-sm font-mono leading-relaxed">D:\\HOC_TAP_2026\\\n  ├── Toan\\\n  ├── Ngu_Van\\\n  └── Tin_Hoc\\\n        ├── Bai_Tap\\\n        ├── Tai_Lieu\\\n        └── Hinh_Anh\\</pre><p class="text-gray-700 mt-2">Sau đó tạo một tệp Word có tên <code>Gioi_thieu_ban_than.docx</code> lưu vào thư mục <code>Tin_Hoc\\Bai_Tap</code>.</p></div>',
            order_num: 4
        });
    }

    // 3. Slides
    const slidesSnap = await db.collection('slides').get();
    if (slidesSnap.empty) {
        console.log('Đang tạo collection: slides...');
        const initialSlides = [
            // Bài 4
            { lesson_id: 'lesson_4', slide_number: 1, title: '1. Máy tìm kiếm là gì?', content: 'Máy tìm kiếm (Search Engine) là một hệ thống phần mềm được thiết kế để tìm kiếm thông tin trên World Wide Web dựa trên các truy vấn của người dùng. Một số máy tìm kiếm phổ biến hàng đầu thế giới gồm: Google, Bing, Yahoo, Cốc Cốc, DuckDuckGo.', bullet_points: 'Google: Máy tìm kiếm phổ biến nhất thế giới\nBing: Phát triển bởi tập đoàn Microsoft\nCốc Cốc: Tối ưu cho người dùng Việt Nam\nDuckDuckGo: Chú trọng tính bảo mật và quyền riêng tư', teacher_note: 'Giáo viên nhấn mạnh: Máy tìm kiếm không trực tiếp sở hữu thông tin mà lập chỉ mục (index) các trang web trên toàn cầu.' },
            { lesson_id: 'lesson_4', slide_number: 2, title: '2. Từ khóa tìm kiếm (Keywords)', content: 'Từ khóa là từ hoặc cụm từ ngắn gọn phản ánh chính xác nhất nội dung thông tin em cần tìm. Lựa chọn từ khóa tốt giúp tiết kiệm 90% thời gian tìm kiếm.', bullet_points: 'Chọn từ khóa mang tính then chốt, cô đọng\nTránh gõ cả câu hỏi dài dòng như văn nói\nCó thể sử dụng tiếng Việt có dấu hoặc không dấu\nKết hợp danh từ riêng để khoanh vùng kết quả', teacher_note: 'Hướng dẫn học sinh phân biệt giữa từ khóa kém hiệu quả và từ khóa tối ưu.' },
            { lesson_id: 'lesson_4', slide_number: 3, title: '3. Các toán tử tìm kiếm nâng cao', content: 'Các ký hiệu và toán tử đặc biệt giúp thu hẹp phạm vi tìm kiếm một cách chính xác tuyệt đối:', bullet_points: 'Dấu ngoặc kép "từ khóa": Tìm kiếm chính xác cụm từ theo đúng thứ tự\nDấu trừ (-): Loại trừ các kết quả chứa từ khóa phía sau\nToán tử site:domain: Chỉ tìm kiếm trên một trang web cụ thể (VD: site:moet.gov.vn)\nToán tử filetype:pdf/docx: Chỉ tìm các tài liệu có đuôi tệp xác định', teacher_note: 'Thực hành thị phạm ngay trên trình duyệt chiếu cho cả lớp xem.' },
            { lesson_id: 'lesson_4', slide_number: 4, title: '4. Đánh giá độ tin cậy của thông tin', content: 'Không phải mọi thông tin trên Internet đều đúng sự thật. Học sinh cần rèn luyện kỹ năng tư duy phản biện khi đọc tin tức trực tuyến.', bullet_points: 'Kiểm tra nguồn gốc: Tác giả là ai? Cơ quan xuất bản có uy tín không?\nĐuôi tên miền uy tín: .gov.vn (Chính phủ), .edu.vn (Giáo dục)\nKiểm tra ngày xuất bản: Thông tin có còn mới và phù hợp không?\nĐối chiếu chéo: So sánh với các cơ quan báo chí chính thống', teacher_note: 'Rèn luyện cho học sinh tránh bị lừa đảo bởi các trang tin giả mạo (Fake news).' },

            // Bài 5
            { lesson_id: 'lesson_5', slide_number: 1, title: '1. Khái niệm Tệp (File)', content: 'Tệp là tập hợp các thông tin ghi trên bộ nhớ ngoài, được đặt tên và tạo thành một đơn vị lưu trữ. Tên tệp gồm 2 phần được ngăn cách nhau bởi dấu chấm (.): [Phần tên].[Phần mở rộng].', bullet_points: 'Phần tên: Do người dùng đặt để dễ nhận biết (tối đa 255 ký tự)\nPhần mở rộng (Đuôi tệp): Thường gồm 3-4 ký tự do phần mềm quy định\n.docx: Văn bản Microsoft Word\n.pptx: Bản trình chiếu PowerPoint\n.xlsx: Bảng tính Excel\n.mp4, .mp3: Tệp âm thanh, video đa phương tiện', teacher_note: 'Lưu ý: Không được sử dụng các ký tự đặc biệt như: / \\ : * ? " < > | trong tên tệp.' },
            { lesson_id: 'lesson_5', slide_number: 2, title: '2. Thư mục và Cây thư mục', content: 'Thư mục (Folder) giống như một ngăn kéo dùng để chứa các tệp và các thư mục con khác. Việc tổ chức thư mục dạng hình cây giúp quản lý dữ liệu khoa học.', bullet_points: 'Thư mục gốc: Thư mục mức cao nhất của ổ đĩa (VD: C:\\, D:\\)\nThư mục con (Subfolder): Nằm bên trong một thư mục khác\nCây thư mục: Phân cấp theo sơ đồ cành cây từ trên xuống dưới\nĐường dẫn (Path): Chỉ dẫn đến vị trí chính xác của tệp/thư mục', teacher_note: 'Minh họa bằng hình ảnh sơ đồ phân cấp thư mục trường học.' },
            { lesson_id: 'lesson_5', slide_number: 3, title: '3. Các thao tác cơ bản với Tệp & Thư mục', content: 'Hệ điều hành Windows cung cấp ứng dụng File Explorer (phím tắt Win + E) để thực hiện các thao tác quản lý dữ liệu:', bullet_points: 'Tạo mới (New Folder): Phím tắt Ctrl + Shift + N\nĐổi tên (Rename): Nhấn phím F2 hoặc click chuột phải chọn Rename\nSao chép (Copy): Phím tắt Ctrl + C, sau đó dán Ctrl + V\nDi chuyển (Cut): Phím tắt Ctrl + X, sau đó dán Ctrl + V\nXóa (Delete): Nhấn phím Delete (vào thùng rác) hoặc Shift + Delete (xóa vĩnh viễn)', teacher_note: 'Nhắc nhở học sinh cẩn thận khi sử dụng Shift+Delete vì không khôi phục lại được.' },
            { lesson_id: 'lesson_5', slide_number: 4, title: '4. Quy tắc tổ chức dữ liệu an toàn', content: 'Để tránh mất mát dữ liệu và giữ máy tính hoạt động ổn định, hãy tuân thủ các nguyên tắc sau:', bullet_points: 'Đặt tên tệp và thư mục ngắn gọn, rõ nghĩa, không dấu hoặc có gạch dưới\nKhông lưu quá nhiều tài liệu nặng ngoài màn hình Desktop\nSao lưu dữ liệu định kỳ lên đám mây (Google Drive, OneDrive)\nKhông tự ý đổi tên hoặc xóa các tệp hệ thống trong ổ đĩa C:\\Windows', teacher_note: 'Tạo thói quen tốt cho học sinh ngay từ những bài học đầu tiên.' }
        ];

        for (const s of initialSlides) {
            await db.collection('slides').add(s);
        }
    }

    // 4. Questions & Answers
    const questionsSnap = await db.collection('questions').get();
    if (questionsSnap.empty) {
        console.log('Đang tạo collection: questions...');
        const initialQuestions = [
            // Bài 4
            {
                lesson_id: 'lesson_4',
                question_text: 'Máy tìm kiếm (Search Engine) hoạt động chủ yếu dựa vào thành phần nào sau đây?',
                explanation: 'Máy tìm kiếm dựa vào từ khóa do người dùng cung cấp để tra cứu trong kho chỉ mục dữ liệu khổng lồ của nó.',
                order_num: 1,
                answers: [
                    { id: 1, choice_label: 'A', answer_text: 'Từ khóa do người dùng nhập vào', is_correct: 1 },
                    { id: 2, choice_label: 'B', answer_text: 'Tốc độ mạng Internet', is_correct: 0 },
                    { id: 3, choice_label: 'C', answer_text: 'Hãng sản xuất máy tính', is_correct: 0 },
                    { id: 4, choice_label: 'D', answer_text: 'Dung lượng RAM của máy tính', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_4',
                question_text: 'Khi muốn tìm chính xác cụm từ "bảo vệ môi trường học đường", em nên đặt cụm từ đó trong ký hiệu nào?',
                explanation: 'Đặt cụm từ trong cặp dấu ngoặc kép "..." giúp máy tìm kiếm chỉ trả về các kết quả chứa chính xác cụm từ đó theo đúng thứ tự.',
                order_num: 2,
                answers: [
                    { id: 5, choice_label: 'A', answer_text: 'Cặp dấu ngoặc đơn (...)', is_correct: 0 },
                    { id: 6, choice_label: 'B', answer_text: 'Cặp dấu ngoặc vuông [...]', is_correct: 0 },
                    { id: 7, choice_label: 'C', answer_text: 'Cặp dấu ngoặc kép "..."', is_correct: 1 },
                    { id: 8, choice_label: 'D', answer_text: 'Cặp dấu gạch chéo /.../', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_4',
                question_text: 'Để tìm kiếm tài liệu về Tin học nhưng không muốn xuất hiện các bài viết về Game, em sử dụng toán tử nào?',
                explanation: 'Toán tử dấu trừ (-) đặt sát trước từ cần loại trừ (ví dụ: Tin học -game).',
                order_num: 3,
                answers: [
                    { id: 9, choice_label: 'A', answer_text: 'Toán tử dấu cộng (+)', is_correct: 0 },
                    { id: 10, choice_label: 'B', answer_text: 'Toán tử dấu trừ (-)', is_correct: 1 },
                    { id: 11, choice_label: 'C', answer_text: 'Toán tử dấu sao (*)', is_correct: 0 },
                    { id: 12, choice_label: 'D', answer_text: 'Toán tử dấu hỏi (?)', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_4',
                question_text: 'Để chỉ tìm kiếm các tệp tài liệu định dạng PDF trên Google, em dùng cú pháp nào sau đây?',
                explanation: 'Cú pháp filetype:pdf giúp lọc ra chính xác các tệp tin có định dạng PDF.',
                order_num: 4,
                answers: [
                    { id: 13, choice_label: 'A', answer_text: 'filetype:pdf', is_correct: 1 },
                    { id: 14, choice_label: 'B', answer_text: 'type=pdf', is_correct: 0 },
                    { id: 15, choice_label: 'C', answer_text: 'format:pdf', is_correct: 0 },
                    { id: 16, choice_label: 'D', answer_text: 'extension:pdf', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_4',
                question_text: 'Tên miền nào sau đây thường là nguồn thông tin có độ tin cậy cao của các cơ quan chính phủ Việt Nam?',
                explanation: 'Đuôi tên miền .gov.vn được quy định dành riêng cho các cơ quan Đảng và Nhà nước Việt Nam.',
                order_num: 5,
                answers: [
                    { id: 17, choice_label: 'A', answer_text: '.com', is_correct: 0 },
                    { id: 18, choice_label: 'B', answer_text: '.xyz', is_correct: 0 },
                    { id: 19, choice_label: 'C', answer_text: '.gov.vn', is_correct: 1 },
                    { id: 20, choice_label: 'D', answer_text: '.net', is_correct: 0 }
                ]
            },
            // Bài 5
            {
                lesson_id: 'lesson_5',
                question_text: 'Tên tệp trong hệ điều hành Windows bao gồm những thành phần nào sau đây?',
                explanation: 'Tên tệp gồm 2 phần: Phần tên và phần mở rộng, được ngăn cách bởi dấu chấm.',
                order_num: 1,
                answers: [
                    { id: 21, choice_label: 'A', answer_text: 'Chỉ có phần tên', is_correct: 0 },
                    { id: 22, choice_label: 'B', answer_text: 'Phần tên và phần mở rộng (đuôi tệp) cách nhau dấu chấm', is_correct: 1 },
                    { id: 23, choice_label: 'C', answer_text: 'Chỉ có phần mở rộng', is_correct: 0 },
                    { id: 24, choice_label: 'D', answer_text: 'Phần tên và ngày tháng năm', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_5',
                question_text: 'Tệp có phần mở rộng là ".pptx" thường là loại tệp nào?',
                explanation: 'Phần mở rộng .pptx là định dạng chuẩn của bài thuyết trình Microsoft PowerPoint.',
                order_num: 2,
                answers: [
                    { id: 25, choice_label: 'A', answer_text: 'Tệp văn bản Word', is_correct: 0 },
                    { id: 26, choice_label: 'B', answer_text: 'Tệp trình chiếu PowerPoint', is_correct: 1 },
                    { id: 27, choice_label: 'C', answer_text: 'Tệp bảng tính Excel', is_correct: 0 },
                    { id: 28, choice_label: 'D', answer_text: 'Tệp hình ảnh', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_5',
                question_text: 'Phím tắt nào sau đây dùng để đổi tên một tệp hoặc thư mục được chọn?',
                explanation: 'Nhấn phím F2 là cách nhanh nhất để kích hoạt chế độ đổi tên trong Windows.',
                order_num: 3,
                answers: [
                    { id: 29, choice_label: 'A', answer_text: 'F1', is_correct: 0 },
                    { id: 30, choice_label: 'B', answer_text: 'F2', is_correct: 1 },
                    { id: 31, choice_label: 'C', answer_text: 'F5', is_correct: 0 },
                    { id: 32, choice_label: 'D', answer_text: 'F12', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_5',
                question_text: 'Để sao chép một tệp sang vị trí khác, tổ hợp phím tắt được sử dụng là gì?',
                explanation: 'Sử dụng Ctrl + C để sao chép (Copy) và Ctrl + V để dán (Paste).',
                order_num: 4,
                answers: [
                    { id: 33, choice_label: 'A', answer_text: 'Ctrl + X và Ctrl + V', is_correct: 0 },
                    { id: 34, choice_label: 'B', answer_text: 'Ctrl + C và Ctrl + V', is_correct: 1 },
                    { id: 35, choice_label: 'C', answer_text: 'Ctrl + A và Ctrl + S', is_correct: 0 },
                    { id: 36, choice_label: 'D', answer_text: 'Ctrl + Z và Ctrl + Y', is_correct: 0 }
                ]
            },
            {
                lesson_id: 'lesson_5',
                question_text: 'Ký tự nào sau đây KHÔNG ĐƯỢC PHÉP xuất hiện trong tên của tệp và thư mục?',
                explanation: 'Các ký tự cấm trong hệ thống tệp Windows gồm: \\ / : * ? " < > |',
                order_num: 5,
                answers: [
                    { id: 37, choice_label: 'A', answer_text: 'Dấu gạch dưới (_)', is_correct: 0 },
                    { id: 38, choice_label: 'B', answer_text: 'Dấu gạch nối (-)', is_correct: 0 },
                    { id: 39, choice_label: 'C', answer_text: 'Dấu chấm hỏi (?)', is_correct: 1 },
                    { id: 40, choice_label: 'D', answer_text: 'Số từ 0 đến 9', is_correct: 0 }
                ]
            }
        ];

        for (const q of initialQuestions) {
            await db.collection('questions').add(q);
        }
    }

    // 5. Team Members
    const teamSnap = await db.collection('team_members').get();
    if (teamSnap.empty) {
        console.log('Đang tạo collection: team_members...');
        const members = [
            { fullname: 'Đặng Hoàng Nam', student_id: '21050001', role_name: 'Trưởng nhóm & Fullstack Developer', avatar: 'assets/img/avatars/member1.svg', bio: 'Chịu trách nhiệm thiết kế kiến trúc hệ thống, tích hợp Firebase Auth, Firestore và Storage.', email: 'nam.dh@eduteam5.vn', order_num: 1 },
            { fullname: 'Lê Thị Phương Thảo', student_id: '21050002', role_name: 'UI/UX & Frontend Developer', avatar: 'assets/img/avatars/member2.svg', bio: 'Thiết kế giao diện hiện đại, tối ưu trải nghiệm học sinh và hiệu ứng trình chiếu slide tương tác.', email: 'thao.ltp@eduteam5.vn', order_num: 2 },
            { fullname: 'Nguyễn Minh Tuấn', student_id: '21050003', role_name: 'Biên tập nội dung Bài 4 & Kiểm thử', avatar: 'assets/img/avatars/member3.svg', bio: 'Soạn thảo nội dung chuyên sâu Bài 4: Tìm kiếm thông tin trên Internet và kiểm thử câu hỏi.', email: 'tuan.nm@eduteam5.vn', order_num: 3 },
            { fullname: 'Phạm Quỳnh Chi', student_id: '21050004', role_name: 'Biên tập nội dung Bài 5 & Slide', avatar: 'assets/img/avatars/member4.svg', bio: 'Thiết kế giáo án điện tử Bài 5: Thao tác tệp và thư mục, xây dựng ngân hàng trắc nghiệm.', email: 'chi.pq@eduteam5.vn', order_num: 4 },
            { fullname: 'Vũ Đức Thịnh', student_id: '21050005', role_name: 'Quản lý tài liệu & Bảo mật', avatar: 'assets/img/avatars/member5.svg', bio: 'Xây dựng mô-đun upload tài liệu Word/PowerPoint và kiểm tra phân quyền bảo mật Firebase Rules.', email: 'thinh.vd@eduteam5.vn', order_num: 5 }
        ];

        for (const m of members) {
            await db.collection('team_members').add(m);
        }
    }

    // 6. Documents mẫu
    const docsSnap = await db.collection('documents').get();
    if (docsSnap.empty) {
        console.log('Đang tạo collection: documents...');
        const sampleDocs = [
            { lesson_id: 'lesson_4', title: 'Kế hoạch bài dạy (Giáo án) Bài 4 - Tìm kiếm thông tin', description: 'Giáo án định dạng Word chuẩn phương pháp dạy học tích cực', file_name: 'Giao_an_Bai_4_Tim_kiem_thong_tin.docx', file_type: 'docx', file_size: 1258291, file_url: 'uploads/lessons/Giao_an_Bai_4_Tim_kiem_thong_tin.docx', is_public: true, downloads: 48, uploaded_at: firebase.firestore.FieldValue.serverTimestamp() },
            { lesson_id: 'lesson_4', title: 'Bài giảng điện tử PowerPoint Bài 4', description: 'Bản trình chiếu sinh động kèm hiệu ứng minh họa', file_name: 'Bai_giang_dien_tu_Bai_4.pptx', file_type: 'pptx', file_size: 3565158, file_url: 'uploads/lessons/Bai_giang_dien_tu_Bai_4.pptx', is_public: true, downloads: 92, uploaded_at: firebase.firestore.FieldValue.serverTimestamp() },
            { lesson_id: 'lesson_5', title: 'Giáo án điện tử Bài 5 - Thao tác với tệp và thư mục', description: 'Giáo án Word đầy đủ mục tiêu, hoạt động khởi động, hình thành kiến thức và vận dụng', file_name: 'Giao_an_Bai_5_Tep_va_thu_muc.docx', file_type: 'docx', file_size: 985600, file_url: 'uploads/lessons/Giao_an_Bai_5_Tep_va_thu_muc.docx', is_public: true, downloads: 41, uploaded_at: firebase.firestore.FieldValue.serverTimestamp() },
            { lesson_id: 'lesson_5', title: 'Bản trình chiếu minh họa Bài 5', description: 'Slide PowerPoint trực quan về cấu trúc cây thư mục và thao tác tệp', file_name: 'Bai_giang_dien_tu_Bai_5.pptx', file_type: 'pptx', file_size: 4194304, file_url: 'uploads/lessons/Bai_giang_dien_tu_Bai_5.pptx', is_public: true, downloads: 75, uploaded_at: firebase.firestore.FieldValue.serverTimestamp() }
        ];

        for (const d of sampleDocs) {
            await db.collection('documents').add(d);
        }
    }

    console.log('Đồng bộ dữ liệu Cloud Firestore hoàn tất!');
}

// Tự động kiểm tra seed khi tải trang
seedInitialFirestoreData().catch(e => console.warn('Lưu ý Firebase Offline/Online:', e.message));

