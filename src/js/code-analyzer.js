import * as esprima from 'esprima';

const Viz = require('viz.js');
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
    if (inputVector.has(termCheck(parsedCode.left))) {
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
        if (parsedCode.alternate.type != 'IfStatement') {
            codeParse(parsedCode.alternate, new Map(substitution));
        }
        else {
            codeParse(parsedCode.alternate, new Map(substitution));
        }
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
let VarAss = function (c,d,curr) {
    d[curr]=d[curr].slice(0, 4) + 'color=green ' + d[curr].slice(4);
    curr++;
    if (c.astNode.type == 'VariableDeclaration' || c.astNode.type == 'AssignmentExpression') {
        if (c.next[0].astNode == undefined)
            iterateTheObject(c.next[1],d,curr);
        else if (c.next.length === 1)
            iterateTheObject(c.next[0],d,curr);
    }
};
let bin = function (c,d,curr) {
    d[curr]=d[curr].slice(0, 4) + 'color=green ' + d[curr].slice(4);
    let line=c.astNode.loc.start.line;
    let boolean=lineToboolean.get(line);
    curr=getNewCurr(boolean,curr);
    if (boolean){
        iterateTheObject(c.true,d,curr);
    }
    else {
        iterateTheObject(c.false,d,curr);
    }

};
function getNewCurr(boolean,curr){
    let node ='n'+curr +' ->';
    for (let i=0;i<d.length;i++){
        if (boolean){
            if (d[i].startsWith(node) && d[i].includes('label="true"')){
                let index=d[i].indexOf('>')+3;
                return parseInt(d[i].substring(index,d[i].indexOf('[')-1));
            }
        }
        else {
            if (d[i].startsWith(node) && d[i].includes('label="false"')){
                let index=d[i].indexOf('>')+3;
                return parseInt(d[i].substring(index,d[i].indexOf('[')-1));
            }
        }

        continue;
    }
    return;
}
let retEs = function (c) {
    return;
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
    let code = esprima.parseScript(codeToParse, {range: true, loc: true});
    let c = es(code.body[0].body);
    d = es.dot(c, {counter: 0, source: codeToParse, loc: true});
    let h = es.dot(c);
    getTypes(h.split('\n'));
    d = d.split('\n');
    iterateTheObject(c[2][1],d,1);
    let z = converToString(cleanException(d));
    return Viz('digraph {' + z + '}');

}

function getTypes(h) {
    for (let i = 1; i < h.length; i++) {
        if (h[i].includes('->') || h[i].includes('label="entry"') || h[i] == '' || h[i].includes('label="exit"')) {
            continue;
        }
        else {
            node.push((h[i].match(/"(.*?)"/)[0]));
        }
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
            str += e;
            return;
        }
        e = e.replace(';', '').replace('let', '');
        str += shape(e, i);
        if (unite(i)) {
        }
        i++;
        str += '\n';
    });
    return str;
}

function unite(i) {
    if ((node[i] === '"VariableDeclaration"' || node[i] === '"AssignmentExpression"') && (node[i + 1] === '"VariableDeclaration"' || node[i + 1] === '"AssignmentExpression"'))
        return true;
    else return false;
}

function shape(e, i) {
    if (node[i] === '"BinaryExpression"') {
        return e.slice(0, 4) + 'shape=diamond ' + e.slice(4);
    }
    return e.slice(0, 4) + 'shape=rectangle ' + e.slice(4);
}

function iterateTheObject(c,d,curr) {
    if (c.next != undefined) {
        console.log(c.astNode.type);
        handlersFunction[c.astNode.type](c,d,curr);
    }
}

function insertBooleanLines(code) {
    for (let [key, value]  of code) {
        if (value.startsWith('false')) {
            lineToboolean.set(key, false);
        }
        else if (value.startsWith('true')) {
            lineToboolean.set(key, true);
        }
        else {
            continue;
        }
    }
    console.log(lineToboolean);
}


const handlersFunction = {
    IfStatement: ifState,
    VariableDeclaration: VarAss,
    ExpressionStatement: expr,
    AssignmentExpression: VarAss,
    WhileStatement: whileSt,
    ReturnStatement: retEs,
    BinaryExpression: bin
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

