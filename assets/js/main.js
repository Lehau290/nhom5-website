// MAIN.JS - CÁC TIỆN ÍCH CHUNG & HIỆU ỨNG TƯƠNG TÁC

// Hàm escape HTML an toàn toàn cục
window.escapeHtml = function(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// Toast notifications
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle text-blue-500';
    if (type === 'success') iconClass = 'fa-check-circle text-emerald-500';
    if (type === 'danger') iconClass = 'fa-exclamation-circle text-red-500';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle text-amber-500';

    toast.innerHTML = `
        <i class="fas ${iconClass} text-xl"></i>
        <div class="flex-1 text-sm font-medium text-gray-800">${escapeHtml(message)}</div>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Ẩn / Hiện mật khẩu
document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    initTheme();
});

// QUẢN LÝ CHẾ ĐỘ GIAO DIỆN SÁNG / TỐI (LIGHT / DARK MODE)
function initTheme() {
    const savedTheme = localStorage.getItem('edu_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeToggleIcons(isDark);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('edu_theme', isDark ? 'dark' : 'light');
    updateThemeToggleIcons(isDark);
    if (window.showToast) {
        showToast(isDark ? 'Đã bật chế độ giao diện Tối' : 'Đã bật chế độ giao diện Sáng', 'info');
    }
}

function updateThemeToggleIcons(isDark) {
    document.querySelectorAll('.theme-toggle-icon').forEach(icon => {
        icon.className = isDark ? 'fas fa-sun text-amber-400 text-base theme-toggle-icon' : 'fas fa-moon text-slate-600 text-base theme-toggle-icon';
    });
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.setAttribute('title', isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối');
    });
}

// Khởi chạy tức thì để tránh nhấp nháy màn hình
initTheme();
