const RESET = '\x1b[0m';
const COLORS = {
    INFO: '\x1b[36m',     // Cyan
    WARN: '\x1b[33m',     // Vàng
    ERROR: '\x1b[31m',    // Đỏ
    DEBUG: '\x1b[35m',    // Tím
    SUCCESS: '\x1b[32m',  // Xanh lá
    DIM: '\x1b[2m',       // Mờ
};

function timestamp() {
    return new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatMessage(level, color, ...args) {
    const ts = `${COLORS.DIM}[${timestamp()}]${RESET}`;
    const tag = `${color}[${level}]${RESET}`;
    console.log(ts, tag, ...args);
}

const logger = {
    info(...args) {
        formatMessage('INFO', COLORS.INFO, ...args);
    },

    warn(...args) {
        formatMessage('WARN', COLORS.WARN, ...args);
    },

    error(...args) {
        formatMessage('ERROR', COLORS.ERROR, ...args);
    },

    debug(...args) {
        if (process.env.NODE_ENV === 'development') {
            formatMessage('DEBUG', COLORS.DEBUG, ...args);
        }
    },

    success(...args) {
        formatMessage('OK', COLORS.SUCCESS, ...args);
    },
};

module.exports = logger;
