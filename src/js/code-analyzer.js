import * as esprima from 'esprima';


import * as es from 'esgraph';
//EXPORTS FUNCTIONS TO APP
export {esTry};
export {codeParse};
export {parseCode};
export {readCodeLineByLine};
export {variablesInsertion};
export {globalInsertion};
export {insertBooleanLines};
//CONVERT CODE TO JSON
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

//GLOBAL VARIABLES
let alternate = false;
let original = new Map();
let inputVector = new Map();
let values = [];
let global = true;
//assignment 3
let node = [];
let lineToboolean = new Map();
let d;
let visited = [];
//TYPE HANDLERS//
let func = (parsedCode, substitution) => {
    global = false;
    parsedCode.params.forEach(function (parameter) {
        inputVec(termCheck(parameter), values[0]);
        values.shift();
    });
    codeParse(parsedCode.body, substitution);
    global = true;
};
let block = (parsedCode, substitution) => {
    codeParse(parsedCode.body, substitution);
};
let variable = (parsedCode, substitution) => {
    codeParse(parsedCode.declarations, substitution);
};
let variableDec = (parsedCode, substitution) => {
    let line = parsedCode.id.loc.start.line;
    if (!global) {
        original.delete(line);
        if (parsedCode.init != null) {
            changeVal(termCheck(parsedCode.id), binarySub(termCheck(parsedCode.init), substitution), substitution);
        }
        else {
            substitution.set(termCheck(parsedCode.id), '');
        }
    }
    else {
        if (parsedCode.init == null) {
            inputVec(termCheck(parsedCode.id), '');
        }
        else {
            inputVec(termCheck(parsedCode.id), binarySub(termCheck(parsedCode.init), substitution));
        }
    }
};
let expr = (parsedCode, substitution) => {
    codeParse(parsedCode.expression, substitution);
};
let assignment = (parsedCode, substitution) => {
    let spaces = original.get(parsedCode.left.loc.start.line).search(/\S/);
    if (inputVector.has(termCheck(parsedCode.left)) && !inputVector.has(termCheck(parsedCode.right))) {
        original.set(parsedCode.left.loc.start.line, new Array(spaces + 1).join(' ') + termCheck(parsedCode.left) + ' = ' + binarySub(termCheck(parsedCode.right), substitution) + ';');
        inputVec(termCheck(parsedCode.left), binarySub(termCheck(parsedCode.right), substitution));
        return;
    }
    else original.delete(parsedCode.left.loc.start.line);
    if (parsedCode.right.type !== 'BinaryExpression') {
        changeVal(termCheck(parsedCode.left), binarySub(termCheck(parsedCode.right), substitution), substitution);
    }
    else {
        changeVal(termCheck(parsedCode.left), binarySub(binaryExpression(parsedCode.right), substitution), substitution);
    }

};
let whileSt = (parsedCode, substitution) => {
    let scope = new Map(substitution);
    let line = parsedCode.test.left.loc.start.line;
    let condition = binarySub(binaryExpression(parsedCode.test), substitution);
    let value = 'while ( ' + condition + ') {';
    value = eval(evaluation(binarySub(binaryExpression(parsedCode.test), substitution))) + new Array(original.get(line).search(/\S/) + 1).join(' ') + value;
    let spaces = original.get(line).search(/\S/);
    original.set(line, new Array(spaces + 1).join(' ') + value);
    codeParse(parsedCode.body, scope);
};
let ret = (parsedCode, substitution) => {
    let line = parsedCode.argument.loc.start.line;
    let value = 'return ' + binarySub(termCheck(parsedCode.argument), substitution);
    let spaces = original.get(line).search(/\S/);
    original.set(line, new Array(spaces + 1).join(' ') + value + ';');
};
let ifState = (parsedCode, substitution) => {
    let scope = new Map(substitution);
    let line = parsedCode.test.left.loc.start.line;
    let value = binarySub(binaryExpression(parsedCode.test), substitution);
    if (alternate == true) {
        value = ' else if (' + value + ') {';
    }
    else {
        value = ' if (' + value + ') {';
    }
    value = eval(evaluation(binarySub(binaryExpression(parsedCode.test), substitution))) + new Array(original.get(line).search(/\S/) + 1).join(' ') + value;
    original.set(line, value);
    codeParse(parsedCode.consequent, scope);
    if (parsedCode.alternate != undefined) {
        alternate = true;
        codeParse(parsedCode.alternate, new Map(substitution));
    }
};
let prog = (parsedCode, substitution) => {
    codeParse(parsedCode.body, substitution);
};

let ArrayExpression = function (object) {
    let str = '[ ';
    object.elements.forEach(function (Element) {
        str += termCheck(Element) + ' ';
    });
    str += ' ]';
    return str;
};

///////////////////////
//esgraph handlers
let VarAss = function (c, d, curr) {
    let x = d[curr].indexOf(' ') + 2;
    d[curr] = d[curr].slice(0, x) + 'color=green ' + d[curr].slice(x);
    curr = getNewCurr('VarAss', curr);
    if (c.next[0].astNode == undefined)
        iterateTheObject(c.next[1], d, curr);
    else
        iterateTheObject(c.next[0], d, curr);

};
let bin = function (c, d, curr) {
    if (c.parent.type === 'WhileStatement') {
        whileHandler(c, d, curr);
    }
    else {
        let x = d[curr].indexOf(' ') + 2;
        d[curr] = d[curr].slice(0, x) + 'color=green ' + d[curr].slice(x);
        let line = c.astNode.loc.start.line;
        let boolean = lineToboolean.get(line);
        curr = getNewCurr(boolean, curr);
        if (boolean) iterateTheObject(c.true, d, curr);
        else iterateTheObject(c.false, d, curr);
    }


};

function whileHandler(c, d, curr) {
    if (visited.includes(curr)) {
        curr = getNewCurr(false, curr);
        iterateTheObject(c.false, d, curr);
    }
    else {
        let x = d[curr].indexOf(' ') + 2;
        d[curr] = d[curr].slice(0, x) + 'color=green ' + d[curr].slice(x);
        visited.push(curr);
        let line = c.astNode.loc.start.line;
        let boolean = lineToboolean.get(line);
        curr = getNewCurr(boolean, curr);
        if (boolean) iterateTheObject(c.true, d, curr);
        else iterateTheObject(c.false, d, curr);
    }
}

function getNewCurr(boolean, curr) {
    let node = 'n' + curr + ' ->';
    for (let i = 0; i < d.length; i++) {
        if (!d[i].startsWith(node)) continue;
        else {
            if (boolean === 'VarAss') {
                return checkSubNext(d[i]);
            }
            else if (artFunc(d[i], boolean) === 'cont') continue;
            else return artFunc(d[i], boolean);

        }
    }
}

function artFunc(object, bool) {
    if (bool && object.includes('label="true"')) {
        return checkSubNext(object);
    }
    else if (object.includes('label="false"')) {
        return checkSubNext(object);
    }
    return 'cont';
}

function checkSubNext(object) {
    let index = object.indexOf('>') + 3;
    return parseInt(object.substring(index, object.indexOf('[') - 1));
}

let retEs = function (c, d, curr) {
    let x = d[curr].indexOf(' ') + 2;
    d[curr] = d[curr].slice(0, x) + 'color=green ' + d[curr].slice(x);
};


//MAIN RECURSIVE FUNCTION

function codeParse(parsedCode, substitution) {
    if (Array.isArray(parsedCode)) {
        parsedCode.forEach(function (Element) {
            arrayOfFunctions[Element.type](Element, substitution);
        });
    }
    else {
        arrayOfFunctions[parsedCode.type](parsedCode, substitution);
    }
    return original;
}

//HELP FUNCTIONS
function binaryExpression(object) {
    if (object.left.type !== 'BinaryExpression') {
        return '( ' + termCheck(object.left) + ' ' + object.operator + ' ' + termCheck(object.right) + ' )';
    }
    else {
        return binaryExpression(object.left) + ' ' + object.operator + ' ' + termCheck(object.right);
    }
}

function binarySub(object, substitution) {
    if (typeof object === 'string' || object instanceof String) {
        let arr = object.split(' ');
        let str = '';
        arr.forEach(function (element) {
            let x = subHas(element, substitution);
            str = str + ' ' + x;
        });
        return str.replace(/ +(?= )/g, '');
    }
    else return object;
}

function evaluation(object) {
    let arr = object.split(' ');
    let str = '';
    arr.forEach(function (element) {
        if (inputVector.has(element)) {
            str = str + ' ' + inputVector.get(element);
        }
        else {
            str = str + ' ' + element;
        }
    });
    return str;
}

function inputVec(key, value) {
    if (!checkIfArray(value)) {
        inputVector.set(key, value);
    }
    else {
        return arrChangeVal(key, value, false);
    }
}

function termCheck(object) {
    if (object.type == 'Literal') {
        return LiteralExpression(object);
    }
    else if (object.type == 'Identifier') {
        return object.name;
    }
    else if (object.type == 'UnaryExpression') return unaryExpression(object);
    else return complexTermCheck(object);
}

//artificial function
function complexTermCheck(object) {
    if (object.type == 'MemberExpression') return MemberExpression(object);
    else if (object.type == 'ArrayExpression') return ArrayExpression(object);
    else return binaryExpression(object);
}

function LiteralExpression(object) {
    if (object.raw != undefined && object.value != true && object.raw != false) return object.raw;
    return object.value;
}

function unaryExpression(object) {
    return object.operator + termCheck(object.argument);
}

function MemberExpression(object) {
    return termCheck(object.object) + '[' + termCheck(object.property) + ']';
}

function subHas(key, substitution) {
    if (substitution != undefined && substitution.get(key) != null) {
        return substitution.get(key);
    }
    else {
        return key;
    }
}

function changeVal(key, newVal, substitution) {
    if (!checkIfArray(newVal)) {
        substitution.set(key, newVal);
    }
    else {
        return arrChangeVal(key, newVal, substitution);
    }
}

function arrChangeVal(key, newVal, substitution) {
    let arr = newVal.split(' ');
    let i = 0;
    arr.forEach(function (e) {
        if (e !== '[' && e != ']' && e != '') {
            if (substitution == false) {
                inputVector.set(key + '[' + i + ']', e);
            }
            else {
                substitution.set(key + '[' + i + ']', e);
            }
            i++;
        }

    });
}

function checkIfArray(object) {
    if (typeof object == 'string') {
        if (object.trim().startsWith('[') && object.trim().endsWith(']')) {
            return true;
        }
        else {
            return false;
        }
    }
    return false;
}

function readCodeLineByLine(lines) {
    //global variables
    alternate = false;
    original = new Map();
    inputVector = new Map();
    global = true;
    values = [];
    for (let i = 0; i < lines.length; i++) {
        original.set(i + 1, lines[i]);
    }
}

function variablesInsertion(variables) {
    let input = esprima.parseScript(variables);
    if (variables == '') {
        return;
    }
    else {
        if (input.body[0].expression.expressions != undefined) {
            input.body[0].expression.expressions.forEach(function (e) {
                values.push(termCheck(e));
            });
        }
        else {
            values.push(termCheck(input.body[0].expression));
        }
    }
}

function globalInsertion(object) {
    global = true;
    object.forEach(function (globe_var) {
        variableDec(globe_var.declarations[0], new Map());
    });
    global = false;
}


function esTry(codeToParse) {
    visited = [];
    let code = esprima.parseScript(codeToParse, {range: true, loc: true});
    let c = es(code.body[0].body);
    d = es.dot(c, {counter: 0, source: codeToParse, loc: true});
    let h = es.dot(c);
    getTypes(h.split('\n'));
    d = d.split('\n');
    iterateTheObject(c[2][1], d, 1);
    let z = converToString(cleanException(d));
    return z;
}

function getTypes(h) {
    for (let i = 1; i < h.length; i++) {
        if (checkType(h[i])) {
            continue;
        }
        else {
            node.push((h[i].match(/"(.*?)"/)[0]));
        }
    }
}

function checkType(object) {
    if (object.includes('->') || object.includes('label="entry"') || object == '' || object.includes('label="exit"')) {
        return true;
    }
    else {
        return false;
    }
}

function cleanException(arr) {
    for (let x = 0; x < arr.length; x++) {
        if (arr[x].includes('exception')) {
            arr[x] = '';
        }
    }
    return arr;
}


function converToString(arr) {
    let str = '';
    let i = 0;
    arr.forEach(function (e) {
        if (e.includes('->') || e.includes('entry') || e.includes('exit') || e === '') {
            str += e + '\n';
            return;
        }
        e = e.replace(';', '').replace('let', '');
        str += shape(e, i);
        i++;
        str += '\n';
    });
    return str;
}


function shape(e, i) {
    let x = e.indexOf(' ') + 2;
    if (node[i] === '"BinaryExpression"' || node[i] === '"LogicalExpression"') {
        return e.slice(0, x) + 'shape=diamond ' + e.slice(x);
    }
    return e.slice(0, x) + 'shape=rectangle ' + e.slice(x);
}

function iterateTheObject(c, d, curr) {
    // if (c.next != undefined && !d[curr].includes('->')) {
    handlersFunction[c.astNode.type](c, d, curr);
    // }
    // else {
    //     return;
    // }
}


function insertBooleanLines(code) {
    node = [];
    lineToboolean = new Map();
    for (let [key, value]  of code) {
        if (value.trim().startsWith('false')) {
            lineToboolean.set(key, false);
        }
        else if (value.trim().startsWith('true')) {
            lineToboolean.set(key, true);
        }
        else {
            continue;
        }
    }
}


const handlersFunction = {
    IfStatement: ifState,
    VariableDeclaration: VarAss,
    ExpressionStatement: expr,
    AssignmentExpression: VarAss,
    ReturnStatement: retEs,
    BinaryExpression: bin,
    LogicalExpression: bin
};
const arrayOfFunctions = {
    FunctionDeclaration: func,
    BlockStatement: block,
    IfStatement: ifState,
    VariableDeclaration: variable,
    ExpressionStatement: expr,
    AssignmentExpression: assignment,
    WhileStatement: whileSt,
    ReturnStatement: ret,
    Program: prog,
    VariableDeclarator: variableDec,
    ArrayExpression: ArrayExpression
};

