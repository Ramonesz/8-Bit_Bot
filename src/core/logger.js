function info(message) {
    console.log(`[INFO] ${message}`);
}

function warn(message) {
    console.warn(`[WARN] ${message}`);
}

function error(message, err) {
    if (err) {
        console.error(`[ERROR] ${message}`, err);
        return;
    }

    console.error(`[ERROR] ${message}`);
}

module.exports = {
    info,
    warn,
    error
};
