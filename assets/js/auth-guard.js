// AUTH-GUARD.JS - KIỂM SOÁT PHÂN QUYỀN VÀ TRẠNG THÁI XÁC THỰC

let currentProfile = null;

// Kiểm tra xem trang hiện tại có thuộc khu vực Admin không
function isAdminArea() {
    return window.location.pathname.includes('/admin/') || window.location.pathname.endsWith('admin') || window.location.pathname.endsWith('admin/');
}

// Lắng nghe thay đổi trạng thái xác thực từ Firebase Authentication
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Lấy thông tin vai trò từ Firestore
        currentProfile = await getUserProfile(user.uid);

        // Nếu là trang Admin nhưng tài khoản không phải Admin hoặc bị khóa
        if (isAdminArea()) {
            if (!currentProfile || currentProfile.role !== 'admin') {
                alert('Truy cập bị từ chối! Bạn cần đăng nhập bằng tài khoản Quản trị viên để vào khu vực này.');
                window.location.href = '../login.html';
                return;
            }
            if (currentProfile.status === 0) {
                alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.');
                await auth.signOut();
                window.location.href = '../login.html';
                return;
            }
        }

        // Cập nhật giao diện người dùng
        updateNavUserUI(currentProfile);
    } else {
        currentProfile = null;

        // Nếu ở trang Admin mà chưa đăng nhập -> chuyển về login
        if (isAdminArea()) {
            window.location.href = '../login.html';
            return;
        }

        updateNavUserUI(null);
    }
});

// Cập nhật thanh điều hướng theo trạng thái đăng nhập
function updateNavUserUI(profile) {
    const userContainer = document.getElementById('nav-user-area');
    const mobileUserContainer = document.getElementById('mobile-nav-user-area');

    if (!userContainer) return;

    if (profile) {
        const isAdmin = (profile.role === 'admin');
        const roleName = isAdmin ? 'Quản trị viên' : 'Học sinh';
        const initial = profile.fullname ? profile.fullname.charAt(0).toUpperCase() : 'U';

        // Desktop
        userContainer.innerHTML = `
            <div class="flex items-center gap-3">
                ${isAdmin ? `
                    <a href="admin/index.html" class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5">
                        <i class="fas fa-shield-alt"></i> Trang Admin
                    </a>
                ` : ''}
                <div class="flex items-center gap-3 pl-3 border-l border-slate-200">
                    <div class="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm">
                        ${initial}
                    </div>
                    <div class="text-left hidden sm:block">
                        <div class="text-xs font-bold text-slate-800 leading-tight">${escapeHtml(profile.fullname)}</div>
                        <div class="text-[11px] text-slate-500 capitalize">${roleName}</div>
                    </div>
                    <button onclick="handleSignOut()" class="p-2 text-slate-400 hover:text-red-600 rounded-lg transition" title="Đăng xuất">
                        <i class="fas fa-sign-out-alt text-base"></i>
                    </button>
                </div>
            </div>
        `;

        // Mobile
        if (mobileUserContainer) {
            mobileUserContainer.innerHTML = `
                <div class="py-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <div class="text-xs font-bold text-slate-800">${escapeHtml(profile.fullname)}</div>
                        <div class="text-[11px] text-slate-500 capitalize">${roleName}</div>
                    </div>
                    <button onclick="handleSignOut()" class="text-xs text-red-600 font-bold">Đăng xuất</button>
                </div>
                ${isAdmin ? `
                    <a href="admin/index.html" class="block text-center mt-2 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs">Vào Trang Quản Trị Admin</a>
                ` : ''}
            `;
        }
    } else {
        // Chưa đăng nhập
        userContainer.innerHTML = `
            <a href="login.html" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 font-bold text-sm transition">
                Đăng Nhập
            </a>
            <a href="register.html" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-200 transition">
                Đăng Ký
            </a>
        `;

        if (mobileUserContainer) {
            mobileUserContainer.innerHTML = `
                <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                    <a href="login.html" class="text-center py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-700">Đăng Nhập</a>
                    <a href="register.html" class="text-center py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Đăng Ký</a>
                </div>
            `;
        }
    }
}

// Xử lý đăng xuất
async function handleSignOut() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
        try {
            await auth.signOut();
            showToast('Bạn đã đăng xuất an toàn.', 'info');
            setTimeout(() => {
                if (isAdminArea()) {
                    window.location.href = '../index.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 500);
        } catch (e) {
            showToast('Lỗi đăng xuất: ' + e.message, 'danger');
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

