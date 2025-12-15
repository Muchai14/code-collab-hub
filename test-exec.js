
const executeJavaScript = (code) => {
    const logs = [];
    const customConsole = {
        log: (...args) => logs.push(args.map(String).join(' ')),
        error: (...args) => logs.push('Error: ' + args.map(String).join(' ')),
    };

    try {
        const fn = new Function('console', code);
        fn(customConsole);
        return logs.join('\n');
    } catch (e) {
        return e.toString();
    }
};

const code = 'console.log("Hello Output");';
console.log('Result:', executeJavaScript(code));
