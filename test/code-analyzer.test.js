import assert from 'assert';
import {codeParse, parseCode, readCodeLineByLine, variablesInsertion} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('Assignments V1.0', () => {
        let original=codeParse(parseCode('let a = x + 1;\n' + 'let b = a + y;\n'));
        assert.equal(original.size, '0');
    });
    it('return V1.0', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse =  'function foo(x){'+'\n'+
            '    let c=10;\n' +
            '    return x+c;'+'\n' +
            '}';
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let code=codeParse(parsedCode);
        assert.equal(code.get(1), 'function foo(x){');
    });
    it('if V1.0', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse='function foo(x,y,z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b == z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}';
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let code=codeParse(parsedCode);
        assert.equal(code.get(1), 'function foo(x,y,z){');
    });
    it('if V2.0', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse='function foo(x,y,z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b <= z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b > z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}';
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let code=codeParse(parsedCode);
        assert.equal(code.get(1), 'function foo(x,y,z){');
    });
    it('while V2.0', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse='function foo(x,y,z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a >= z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let code=codeParse(parsedCode);
        assert.equal(code.get(1), 'function foo(x,y,z){');
    });
});
