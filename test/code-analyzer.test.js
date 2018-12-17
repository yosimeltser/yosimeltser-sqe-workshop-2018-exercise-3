import assert from 'assert';
import {codeParse, globalInsertion, parseCode, readCodeLineByLine, variablesInsertion} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('return V1.0', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse =  'function foo(x){'+'\n'+
            '    let c=10;\n' +
            '    return x+c;'+'\n' +
            '}';
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let substitution = new Map();
        let code=codeParse(parsedCode,substitution);
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
        let substitution = new Map();
        let code=codeParse(parsedCode,substitution);
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
        let substitution = new Map();
        let code=codeParse(parsedCode,substitution);
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
        let substitution = new Map();
        let code=codeParse(parsedCode,substitution);
        assert.equal(code.get(1), 'function foo(x,y,z){');
    });
    it('evaluation', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse='function foo(x,y,z){\n' +
            '    let a;\n' +
            '    let b = 10;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (b < z * 2) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        variablesInsertion('1,2,3');
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let substitution = new Map();
        let code=codeParse(parsedCode,substitution);
        assert.equal(code.get(1), 'function foo(x,y,z){');
    });
    it('if within if', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse='function foo(x){\n' +
            '    let a = x + 1;\n' +
            '    a=20;  \n' +
            '    if (a >= 20) {\n' +
            '        let z=20; \n' +
            '        if (a<z){\n' +
            '        return -x;\n' +
            '        }\n' +
            '    }\n' +
            '}\n';
        variablesInsertion('1');
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let substitution = new Map();
        let code=codeParse(parsedCode,substitution);
        assert.equal(code.get(1), 'function foo(x){');
    });
    it('array', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse=
            'let z;\n'+
            'let y=[20,10];\n'+
            'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    a=[80,90]  \n' +
            '    let w;  \n' +
            '    if (a[1] >= 20) {\n' +
            '        let z=20; \n' +
            '        if (a[0]<z){\n' +
            '        return x[0];\n' +
            '        }\n' +
            '    }\n' +
            '}\n';

        readCodeLineByLine(codeToParse.split('\n'));
        variablesInsertion('[20,10]');
        let parsedCode = parseCode(codeToParse);
        globalInsertion(parsedCode.body.filter(dec=>dec.type!=='FunctionDeclaration'));
        let code=codeParse(parsedCode.body.filter(dec=>dec.type==='FunctionDeclaration'),new Map());
        assert.equal(code.get(3), 'function foo(x){');
    });
    it('check', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse=''
        variablesInsertion('');
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let substitution = new Map();
        codeParse(parsedCode,substitution);
        assert.equal('', '');
    });
    it('global before and after ', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse=
            'let z;\n'+
            'let y=[20,10];\n'+
            'function foo(x){\n' +
            '    let a = x[0];\n' +
            '    a=[80,90]  \n' +
            '    let w;  \n' +
            '    if (a[1] >= 20) {\n' +
            '        let z=20; \n' +
            '        if (a[0]<z){\n' +
            '        return x[0];\n' +
            '        }\n' +
            '    }\n' +
            'let g=20\n'+
            '}\n';

        readCodeLineByLine(codeToParse.split('\n'));
        variablesInsertion('[20,10]');
        let parsedCode = parseCode(codeToParse);
        globalInsertion(parsedCode.body.filter(dec=>dec.type!=='FunctionDeclaration'));
        let code=codeParse(parsedCode.body.filter(dec=>dec.type==='FunctionDeclaration'),new Map());
        assert.equal(code.get(3), 'function foo(x){');
    });
    it('empty functions ', () => {
        // let codeToParse = $('#codePlaceholder').val();
        let codeToParse=
            'let z;\n'+
            'let y=[20,10];\n'+
            'function foo(){\n' +
            '    let a = x[0];\n' +
            '    a=[80,90]  \n' +
            '    let w;  \n' +
            '    if (a[1] >= 20) {\n' +
            '        let z=20; \n' +
            '        if (a[0]<z){\n' +
            '        return x[0];\n' +
            '        }\n' +
            '    }\n' +
            'let g=20\n'+
            '}\n';

        readCodeLineByLine(codeToParse.split('\n'));
        variablesInsertion('[20,10]');
        let parsedCode = parseCode(codeToParse);
        globalInsertion(parsedCode.body.filter(dec=>dec.type!=='FunctionDeclaration'));
        let code=codeParse(parsedCode.body.filter(dec=>dec.type==='FunctionDeclaration'),new Map());
        assert.equal(code.get(3), 'function foo(){');
    });
});
