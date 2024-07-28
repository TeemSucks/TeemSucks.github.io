import { runScript } from './runScript.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.querySelector('.input-field');
    const outputDiv = document.querySelector('.output');
    const MAX_LINES = 100;

    const fileSystem = {
        currentDir: '/',
        dirs: {
            '/': ['hello_world.txt', 'script.js'],
        },
        files: {
            '/hello_world.txt': 'hi',
            '/script.js': 'console.log("Hello from script.js"); console.warn("This is a warning!"); console.error("This is an error >:(");',
        },
        types: {
            '/': 'dir',
            '/hello_world.txt': 'file',
            '/script.js': 'file'
        },
    };

    const manualPages = {
        ls: 'Usage: ls\nList directory contents',
        cat: 'Usage: cat <filename> [<content>]\nConcatenate and display file content',
        cd: 'Usage: cd <directory>\nChange the current directory',
        mkdir: 'Usage: mkdir <directory>\nCreate a new directory',
        clear: 'Usage: clear\nClear the terminal screen',
        pwd: 'Usage: pwd\nPrint the current working directory',
        touch: 'Usage: touch <filename>\nCreate an empty file or update the timestamp',
        rm: 'Usage: rm [options] <file|directory>\nRemove files or directories\nOptions:\n  -r  Recursively remove directories\n  -f  Force remove files and directories',
        curl: 'Usage: curl [options] <url>\nRetrieve data from a URL\nOptions:\n  -X <method>  Specify request method (GET, POST, etc.)\n  -d <data>    Send data in a POST request\n  -H <header>  Include a header in the request\n  -i           Include response headers in the output\n\nhint: if it fails, try switching to a different browser',
        man: 'Usage: man <command>\nDisplay the manual page for a command'
    };

    const commandHistory = [];
    let historyIndex = -1;

    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const input = event.target.value.trim();
            if (input !== '') {
                processInput(input);
                event.target.value = '';
                commandHistory.push(input);
                historyIndex = commandHistory.length;
            }
        } else if (event.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                inputField.value = commandHistory[historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                inputField.value = commandHistory[historyIndex] || '';
            }
        }
    });

    function processInput(input) {
        const commands = input.split(';').map(cmd => cmd.trim());
        for (const command of commands) {
            processCommand(command);
        }
    }

    function processCommand(input) {
        const outputLine = document.createElement('p');
        outputLine.textContent = `> ${input}`;
        outputDiv.appendChild(outputLine);
        maintainMaxLines();

        const parts = input.split('>');
        const commandInput = parts[0].trim();
        const redirectInput = parts[1] ? parts[1].trim() : null;

        const args = commandInput.split(' ');
        const command = args[0];
        const params = args.slice(1);

        if (command === './') {
            appendOutput('zsh: permission denied: ./');
            return;
        }

        switch (command) {
            case 'ls':
                handleLs(params);
                break;
            case 'cat':
                handleCat(params, redirectInput);
                break;
            case 'cd':
                handleCd(params);
                break;
            case 'mkdir':
                handleMkdir(params);
                break;
            case 'clear':
                handleClear();
                break;
            case 'pwd':
                handlePwd();
                break;
            case 'touch':
                handleTouch(params);
                break;
            case 'rm':
                handleRm(params);
                break;
            case 'curl':
                handleCurl(params);
                break;
            case 'man':
                handleMan(params);
                break;
            case './':
                appendOutput('zsh: permission denied: ./');
                break;
            default:
                if (command.startsWith('./')) {
                    handleRun([command]);
                } else {
                    appendOutput(`Command not found: ${command}`);
                }
                break;
        }

        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    function handleLs(params) {
        const dir = normalizePath(params[0] || fileSystem.currentDir);
        if (fileSystem.dirs[dir]) {
            const contents = fileSystem.dirs[dir].concat(Object.keys(fileSystem.files).filter(file => file.startsWith(dir + '/')).map(file => file.substring(dir.length + 1)));
            appendOutput(contents.join(' '));
        } else {
            appendOutput(`ls: cannot access '${dir}': No such file or directory`);
        }
    }

    function handleCat(params, redirectInput) {
        if (params.length === 0) {
            appendOutput('Usage: cat <filename> [<content>]');
            return;
        }

        const file = normalizePath(params[0]);
        const content = params.slice(1).join(' ');

        if (redirectInput) {
            const fileName = normalizePath(redirectInput);
            fileSystem.files[fileName] = content;
            fileSystem.types[fileName] = 'file';
            const dir = fileName.substring(0, fileName.lastIndexOf('/')) || '/';
            if (!fileSystem.dirs[dir]) {
                fileSystem.dirs[dir] = [];
            }
            if (!fileSystem.dirs[dir].includes(fileName.split('/').pop())) {
                fileSystem.dirs[dir].push(fileName.split('/').pop());
            }
            appendOutput('');
        } else {
            if (fileSystem.files[file] && fileSystem.types[file] === 'file') {
                appendOutput(fileSystem.files[file]);
            } else {
                appendOutput(`cat: ${file}: No such file or directory`);
            }
        }
    }

    function handleCd(params) {
        if (params.length === 0) {
            appendOutput('cd: missing operand');
            return;
        }
        const dir = normalizePath(params[0]);
        if (fileSystem.dirs[dir] && fileSystem.types[dir] === 'dir') {
            fileSystem.currentDir = dir;
        } else {
            appendOutput(`cd: no such file or directory: ${params[0]}`);
        }
    }

    function handleMkdir(params) {
        if (params.length === 0) {
            appendOutput('mkdir: missing operand');
            return;
        }
        const dir = normalizePath(params[0]);
        if (!fileSystem.dirs[dir]) {
            const parentDir = dir.substring(0, dir.lastIndexOf('/')) || '/';
            if (!fileSystem.dirs[parentDir]) {
                appendOutput(`mkdir: cannot create directory ‘${dir}’: No such file or directory`);
                return;
            }
            fileSystem.dirs[dir] = [];
            fileSystem.files[dir] = {};
            fileSystem.types[dir] = 'dir';
            if (!fileSystem.dirs[parentDir].includes(dir.split('/').pop())) {
                fileSystem.dirs[parentDir].push(dir.split('/').pop());
            }
            appendOutput('');
        } else {
            appendOutput(`mkdir: cannot create directory ‘${dir}’: File exists`);
        }
    }

    function handleClear() {
        outputDiv.innerHTML = '';
    }

    function handlePwd() {
        appendOutput(fileSystem.currentDir);
    }

    function handleTouch(params) {
        if (params.length === 0) {
            appendOutput('touch: missing operand');
            return;
        }
        const file = normalizePath(params[0]);
        const dir = file.substring(0, file.lastIndexOf('/')) || '/';
        if (!fileSystem.dirs[dir]) {
            appendOutput(`touch: cannot touch '${file}': No such file or directory`);
            return;
        }
        if (!fileSystem.files[file]) {
            fileSystem.files[file] = '';
            fileSystem.types[file] = 'file';
            if (!fileSystem.dirs[dir].includes(file.split('/').pop())) {
                fileSystem.dirs[dir].push(file.split('/').pop());
            }
            appendOutput('');
        } else {
            appendOutput('');
        }
    }

    function handleRm(params) {
        if (params.length === 0) {
            appendOutput('rm: missing operand');
            return;
        }

        const recursive = params.includes('-r');
        const force = params.includes('-f');
        const targetIndex = params.findIndex(param => !param.startsWith('-'));

        if (targetIndex === -1) {
            appendOutput('rm: missing operand');
            return;
        }

        const target = normalizePath(params[targetIndex]);

        if (fileSystem.files[target] || fileSystem.dirs[target]) {
            if (fileSystem.types[target] === 'file') {
                removeFile(target, force);
            } else if (fileSystem.types[target] === 'dir') {
                if (recursive) {
                    removeDirectory(target, force);
                } else {
                    appendOutput('rm: cannot remove directory');
                }
            }
        } else {
            appendOutput(`rm: cannot remove '${params[targetIndex]}': No such file or directory`);
        }
    }

    function removeFile(file, force) {
        if (fileSystem.files[file] || force) {
            const dir = file.substring(0, file.lastIndexOf('/')) || '/';
            const fileName = file.split('/').pop();
            delete fileSystem.files[file];
            fileSystem.dirs[dir] = fileSystem.dirs[dir].filter(item => item !== fileName);
            delete fileSystem.types[file];
            appendOutput('');
        } else {
            appendOutput(`rm: cannot remove '${file}': No such file or directory`);
        }
    }

    function removeDirectory(dir, force) {
        if (fileSystem.dirs[dir]) {
            const items = fileSystem.dirs[dir].concat(Object.keys(fileSystem.files).filter(file => file.startsWith(dir + '/')).map(file => file.substring(dir.length + 1)));
            for (const item of items) {
                const itemPath = `${dir}/${item}`;
                if (fileSystem.types[itemPath] === 'dir') {
                    removeDirectory(itemPath, force);
                } else {
                    removeFile(itemPath, force);
                }
            }
            delete fileSystem.dirs[dir];
            delete fileSystem.files[dir];
            delete fileSystem.types[dir];
            const parentDir = dir.substring(0, dir.lastIndexOf('/')) || '/';
            const dirName = dir.split('/').pop();
            fileSystem.dirs[parentDir] = fileSystem.dirs[parentDir].filter(item => item !== dirName);
            appendOutput('');
        } else {
            appendOutput(`rm: cannot remove '${dir}': No such file or directory`);
        }
    }

    function handleCurl(params) {
        if (params.length === 0) {
            appendOutput('Usage: curl [options] <url>');
            return;
        }

        const urlIndex = params.findIndex(param => !param.startsWith('-'));
        if (urlIndex === -1) {
            appendOutput('curl: missing URL');
            return;
        }

        const url = params[urlIndex];
        const options = params.slice(0, urlIndex);
        const method = options.find(opt => opt.startsWith('-X'))?.split(' ')[1] || 'GET';
        const data = options.find(opt => opt.startsWith('-d'))?.split(' ').slice(1).join(' ') || null;
        const headers = options.filter(opt => opt.startsWith('-H')).map(opt => opt.split(' ').slice(1).join(' '));
        const includeHeaders = options.includes('-i');

        const fetchOptions = {
            method: method,
            headers: headers.reduce((acc, header) => {
                const [key, value] = header.split(':');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
            }, {}),
            body: method === 'POST' ? data : null,
        };

        fetch(url, fetchOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text().then(text => {
                    appendOutput(includeHeaders ? `HTTP ${response.status} ${response.statusText}\n${text}` : text);
                });
            })
            .catch(error => appendOutput(`curl: ${error.message}`));
    }

    function handleMan(params) {
        if (params.length === 0) {
            appendOutput('man: missing operand');
            return;
        }
        const command = params[0];
        if (manualPages[command]) {
            appendOutput(manualPages[command]);
        } else {
            appendOutput(`No manual entry for ${command}`);
        }
    }

    function handleRun(params) {
        if (params.length === 0) {
            appendOutput('Usage: ./FILENAME');
            return;
        }
        const filePath = normalizePath(params[0]);

        if (fileSystem.types[filePath] === 'file' && filePath.endsWith('.js')) {
            try {
                const code = fileSystem.files[filePath];
                const result = runScript(code);
                appendOutput(result !== undefined ? result : '');
            } catch (error) {
                appendOutput(`Error executing ${filePath}: ${error.message}`);
            }
        } else {
            appendOutput(`./${params[0]}: No such file or directory or not executable`);
        }
    }

    // function appendOutput(text) {
    //     const outputLine = document.createElement('p');
    //     outputLine.textContent = text;
    //     outputDiv.appendChild(outputLine);
    //     maintainMaxLines();
    // }

    function appendOutput(html) {
        const outputDiv = document.querySelector('.output');
        outputDiv.innerHTML += html;
        maintainMaxLines();
    }

    function maintainMaxLines() {
        while (outputDiv.childNodes.length > MAX_LINES) {
            outputDiv.removeChild(outputDiv.firstChild);
        }
    }

    function normalizePath(path) {
        if (!path) return fileSystem.currentDir;
        if (path[0] === '/') return path;

        const parts = (fileSystem.currentDir + '/' + path).split('/');
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
});
