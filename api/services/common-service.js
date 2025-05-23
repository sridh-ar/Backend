async function _log(source, message) {
    console.log(`[${source}] - `, message);
};

function handleAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        _log(handleAsync.caller, error.stack);
        res.status(500).json({ message: error.message });
      });
    };
}

module.exports = { handleAsync, _log}