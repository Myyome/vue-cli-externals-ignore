const utils = require('./utils');

const scopedModuleRegex = new RegExp(
    '@[a-zA-Z0-9][\\w-.]+/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9./]+)?',
    'g'
);

function getModuleName(request, includeAbsolutePaths) {
    let req = request;
    const delimiter = '/';

    if (includeAbsolutePaths) {
        req = req.replace(/^.*?\/node_modules\//, '');
    }
    // check if scoped module
    if (scopedModuleRegex.test(req)) {
        // reset regexp
        scopedModuleRegex.lastIndex = 0;
        return req.split(delimiter, 2).join(delimiter);
    }
    return req.split(delimiter)[0];
}

module.exports = function nodeExternals(options) {
    options = options || {};
    const mistakes = utils.validateOptions(options) || [];
    if (mistakes.length) {
        mistakes.forEach((mistake) => {
            utils.error(mistakes.map((mistake) => mistake.message));
            utils.log(mistake.message);
        });
    }
    const webpackInternalAllowlist = [/^webpack\/container\/reference\//];
    const allowlist = []
        .concat(webpackInternalAllowlist)
        .concat(options.allowlist || []);
    const binaryDirs = [].concat(options.binaryDirs || ['.bin']);
    const importType = options.importType || 'commonjs';
    const modulesDir = options.modulesDir || 'node_modules';
    const modulesFromFile = !!options.modulesFromFile;
    const includeAbsolutePaths = !!options.includeAbsolutePaths;
    const additionalModuleDirs = options.additionalModuleDirs || [];

    // helper function
    function isNotBinary(x) {
        return !utils.contains(binaryDirs, x);
    }

    // create the node modules list
    let nodeModules = modulesFromFile
        ? utils.readFromPackageJson(options.modulesFromFile)
        : utils.readDir(modulesDir).filter(isNotBinary);
    additionalModuleDirs.forEach(function (additionalDirectory) {
        nodeModules = nodeModules.concat(
            utils.readDir(additionalDirectory).filter(isNotBinary)
        );
    });

    const result = {};
    nodeModules.forEach((item) => {
        if (allowlist.findIndex((allow) => allow === item) === -1) {
            result[item] = {
                commonjs: item,
                amd: item,
            };
        }
    });
    return result;
};
