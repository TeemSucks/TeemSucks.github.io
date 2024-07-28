export function runScript(code, fileSystem) {
    let output = '';
    
    const customConsole = {
        log: (...args) => {
            output += args.map(arg => `<span style="color: #33FF33;">${String(arg)}</span>`).join(' ') + '<br>';
        },
        error: (...args) => {
            output += `<span style="color: red;">Error: ${args.map(arg => String(arg)).join(' ')}</span><br>`;
        },
        warn: (...args) => {
            output += `<span style="color: yellow;">Warning: ${args.map(arg => String(arg)).join(' ')}</span><br>`;
        }
    };

    const global = {
        process: {
            env: {
                PATH: '/usr/local/bin:/usr/bin:/bin',
                HOME: '/root',
                USER: 'user',
            },
            cwd: () => fileSystem.currentDir,
            exit: (code) => { throw new Error(`Process exited with code ${code}`); },
        },
        console: customConsole,
        require: (module) => {
            if (module === 'fs') {
                return {
                    readFileSync: (path) => fileSystem.files[normalizePath(path)] || '',
                    writeFileSync: (path, data) => fileSystem.files[normalizePath(path)] = data,
                    unlinkSync: (path) => {
                        delete fileSystem.files[normalizePath(path)];
                        const dir = normalizePath(path).substring(0, normalizePath(path).lastIndexOf('/')) || '/';
                        const fileName = path.split('/').pop();
                        fileSystem.dirs[dir] = fileSystem.dirs[dir].filter(item => item !== fileName);
                    },
                    mkdirSync: (path) => {
                        const dir = normalizePath(path);
                        if (!fileSystem.dirs[dir]) {
                            fileSystem.dirs[dir] = [];
                            fileSystem.types[dir] = 'dir';
                            const parentDir = dir.substring(0, dir.lastIndexOf('/')) || '/';
                            if (!fileSystem.dirs[parentDir]) {
                                fileSystem.dirs[parentDir] = [];
                            }
                            fileSystem.dirs[parentDir].push(dir.split('/').pop());
                        }
                    }
                };
            }
            throw new Error(`Cannot find module '${module}'`);
        },
        env: (variable) => global.process.env[variable],
    };

    try {
        const scriptFunction = new Function('global', 'console', 'require', 'output', code);

        scriptFunction(global, customConsole, global.require, (text) => {
            output += text + '<br>';
        });
    } catch (error) {
        output += `<span style="color: red;">Execution Error: ${error.message}</span><br>`;
    }

    return output.trim();
}

function normalizePath(path) {
    if (!path) return '/';
    if (path[0] === '/') return path;

    const parts = path.split('/');
    const result = [];

    for (const part of parts) {
        if (part === '' || part === '.') continue;
        if (part === '..') {
            result.pop();
        } else {
            result.push(part);
        }
    }

    return '/' + result.join('/');
}
