// 1. إعداد الأيقونات بأمان تام
function initializeIcons() {
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error("Lucide Icons Error:", error);
    }
}

// 2. دوال مساعدة لضمان عمل الجافا سكريبت على بيئة Local بسلاسة تامة
window.themeConfig = {
    currentTheme: 'dark'
};

// تحصين جلب الـ Theme لمعالجة مشكلة الـ LocalStorage في الـ Chrome.
try {
    window.themeConfig.currentTheme = localStorage.getItem('theme') || 'dark';
} catch (e) {
    console.warn("LocalStorage Blocked.");
}

// 3. دالة التبديل العالمية للوضع الليلي والنهاري
window.toggleTheme = function() {
    const htmlElement = document.documentElement;
    window.themeConfig.currentTheme = window.themeConfig.currentTheme === 'dark' ? 'light' : 'dark';
    
    if (window.themeConfig.currentTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    try {
        localStorage.setItem('theme', window.themeConfig.currentTheme);
    } catch (e) {}

    // تحديث الشارتات إن وجدت
    if(typeof updateCharts === 'function') {
        updateCharts();
    }
}

// --- مساحة الرسوم البيانية ---
let salesChartInstance = null;
let categoryPieInstance = null;
let monthlyBarInstance = null;

function getChartColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        text: isDark ? '#a1a1aa' : '#52525b', // Zinc text
        grid: isDark ? '#27272a' : '#e4e4e7', // Zinc borders
        line: isDark ? '#ffffff' : '#000000', // Absolute contrast 
        lineSecondary: isDark ? '#52525b' : '#a1a1aa', // Mid gray
        bgOpacity1: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        bgOpacity2: isDark ? 'rgba(255, 255, 255, 0)' : 'rgba(0, 0, 0, 0)',
        pieColors: isDark 
            ? ['#ffffff', '#a1a1aa', '#52525b', '#27272a'] 
            : ['#000000', '#52525b', '#a1a1aa', '#e4e4e7']
    };
}

window.initChart = function() {
    if (typeof Chart === 'undefined') {
        return;
    }

    try {
        const colors = getChartColors();
        Chart.defaults.font.family = 'Plus Jakarta Sans';
        Chart.defaults.color = colors.text;

        // Overview Chart
        const ctxSales = document.getElementById('salesChart');
        if (ctxSales && ctxSales.offsetParent !== null) {
            const grad = ctxSales.getContext('2d').createLinearGradient(0, 0, 0, 300);
            grad.addColorStop(0, colors.bgOpacity1);
            grad.addColorStop(1, colors.bgOpacity2);

            salesChartInstance = new Chart(ctxSales, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'],
                    datasets: [{
                        label: 'المبيعات العقارية ($)',
                        data: [4200000, 5800000, 3200000, 7100000, 6500000, 9800000, 8400000, 12500000],
                        borderColor: colors.line,
                        backgroundColor: grad,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: colors.line,
                        pointBorderColor: document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 1500, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: colors.text } },
                        y: { grid: { color: colors.grid, drawBorder: false }, ticks: { color: colors.text, callback: function(v) { return '$' + v / 1000000 + 'M'; } } }
                    }
                }
            });
        }

        // Pie Chart
        const ctxPie = document.getElementById('categoryPie');
        if (ctxPie && ctxPie.offsetParent !== null) {
            categoryPieInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: ['فيلات', 'شقق فاخرة', 'تجارية', 'أخرى'],
                    datasets: [{ data: [45, 35, 15, 5], backgroundColor: colors.pieColors, borderWidth: 0, hoverOffset: 10 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '75%', animation: { animateScale: true } }
            });
        }

        // Bar Chart
        const ctxBar = document.getElementById('monthlyBar');
        if (ctxBar && ctxBar.offsetParent !== null) {
            monthlyBarInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [
                        { label: 'المبيعات', data: [15, 20, 18, 25, 22, 30], backgroundColor: colors.line, borderRadius: 6 },
                        { label: 'الإيجارات', data: [45, 50, 48, 60, 55, 70], backgroundColor: colors.lineSecondary, borderRadius: 6 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: colors.grid, drawBorder: false } } } }
            });
        }
    } catch (error) {
        console.error("Chart Rendering Error:", error);
    }
};

window.updateCharts = function() {
    if(salesChartInstance) salesChartInstance.destroy();
    if(categoryPieInstance) categoryPieInstance.destroy();
    if(monthlyBarInstance) monthlyBarInstance.destroy();
    setTimeout(window.initChart, 50);
}

// --- الإقلاع الرئيسي المباشر للسكريبت بمجرد تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. تهيئة الأيقونات
    initializeIcons();

    // 2. تطبيق الثيم الإفتراضي بقوة على DOM
    const htmlElement = document.documentElement;
    if (window.themeConfig.currentTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    // 3. تهيئة الرسوم البيانية بأمان
    setTimeout(window.initChart, 150);
});

// 4. دالة إظهار وإخفاء القائمة الجانبية (للموبايل)
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (!sidebar || !overlay) return;
    
    if (sidebar.classList.contains('translate-x-full')) {
        // Open
        sidebar.classList.remove('translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
        // Small delay to allow CSS transition to apply
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        // Close
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}
