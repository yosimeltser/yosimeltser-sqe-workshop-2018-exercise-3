import * as esprima from 'esprima';

export {codeParse};
export {parseCode};
export {readCodeLineByLine};
export {variablesInsertion};
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};
//global variables
let alternate = false;
let original = new Map();

let inputVector = new Map();
let values = [];
let global = true;
//HANDLERS
let func = (parsedCode, substitution) => {
    global = false;
    parsedCode.params.forEach(function (parameter) {
        inputVector.set(parameter.name, values[0]);
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
            changeVal(parsedCode.id.name, binarySub(termCheck(parsedCode.init),substitution),substitution);
        }
        else {
            substitution.set(parsedCode.id.name, '');
        }
    }
    else {
        if (parsedCode.init == null) {
            inputVector.set(parsedCode.id.name, '');
        }
        else {
            inputVector.set(parsedCode.id.name, binarySub(termCheck(parsedCode.init),substitution));
        }
    }
};
let expr = (parsedCode,substitution) => {
    codeParse(parsedCode.expression,substitution);
};

let assignment = (parsedCode,substitution) => {
    let spaces = original.get(parsedCode.left.loc.start.line).search(/\S/);
    if (inputVector.has(termCheck(parsedCode.left))) {
        original.set(parsedCode.left.loc.start.line, new Array(spaces + 1).join(' ') + termCheck(parsedCode.left) + ' = ' + binarySub(termCheck(parsedCode.right),substitution) + ';');
        inputVector.set(termCheck(parsedCode.left), binarySub(termCheck(parsedCode.right),substitution));
        return;
    }
    else original.delete(parsedCode.left.loc.start.line);
    if (parsedCode.right.type !== 'BinaryExpression') {
        changeVal(termCheck(parsedCode.left), binarySub(termCheck(parsedCode.right)),substitution);
    }
    else {
        changeVal(termCheck(parsedCode.left), binarySub(binaryExpression(parsedCode.right),substitution),substitution);
    }

};

let whileSt = (parsedCode, substitution) => {
    let line = parsedCode.test.left.loc.start.line;
    let condition = binarySub(binaryExpression(parsedCode.test),substitution);
    let value = 'while ( ' + condition + ') {';
    let spaces = original.get(line).search(/\S/);
    original.set(line, new Array(spaces + 1).join(' ') + value);
    codeParse(parsedCode.body, substitution);
};
let ret = (parsedCode,substitution) => {
    let line = parsedCode.argument.loc.start.line;
    let value = 'return ' + binarySub(termCheck(parsedCode.argument),substitution);
    let spaces = original.get(line).search(/\S/);
    original.set(line, new Array(spaces + 1).join(' ') + value + ';');
};
let ifState = (parsedCode, substitution) => {
    let line = parsedCode.test.left.loc.start.line;
    let value = binarySub(binaryExpression(parsedCode.test),substitution);
    if (alternate == true) {
        value = ' else if (' + value + ') {';
    }
    else {
        value = ' if (' + value + ') {';
    }
    value = eval(evaluation(binarySub(binaryExpression(parsedCode.test),substitution))) + new Array(original.get(line).search(/\S/) + 1).join(' ') + value;
    original.set(line, value);
    codeParse(parsedCode.consequent, substitution);
    if (parsedCode.alternate != undefined) {
        codeParse(parsedCode.alternate, substitution);
    }
};
let prog = (parsedCode, substitution) => {
    codeParse(parsedCode.body, substitution);
};
//TODO check if needed update
let upExp = (parsedCode) => {
    let line = parsedCode.argument.loc.start.line;
    return line;
};
let ArrayExpression = function (object) {
    let str = '[ ';
    object.elements.forEach(function (Element) {
        str += termCheck(Element) + ' ';
    });
    str += ' ]';
    return str;
};

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
            let x = subHas(element,substitution);
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

//RETURNS A TERM -> NUMBER OR VAR ,ACCORDING TO IDENTIFIER OR LATERAL
/* istanbul ignore else  */
function termCheck(object) {
    if (object.type == 'Literal') {
        return object.value;
    }
    else if (object.type == 'Identifier') {
        return object.name;
    }
    else if (object.type == 'UnaryExpression') {
        return unaryExpression(object);
    }
    else if (object.type == 'MemberExpression') {
        return MemberExpression(object);
    }
    else if (object.type == 'ArrayExpression') {
        return ArrayExpression(object);
    }
    else {
        return binaryExpression(object);
    }
}


function unaryExpression(object) {
    return object.operator + termCheck(object.argument);
}

function MemberExpression(object) {
    return termCheck(object.object) + '[' + termCheck(object.property) + ']';
}

function subHas(key, substitution) {
    if (substitution.get(key) != null) {
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
        return arrChangeVal(key, newVal);
    }
}

function arrChangeVal(key, newVal, substitution) {
    let arr = newVal.split(' ');
    let i = 0;
    arr.forEach(function (e) {
        if (e !== '[' && e != ']' && e != '') {
            substitution.set(key + '[' + i + ']', e);
        }
        i++;
    });
}


function checkIfArray(object) {
    if (typeof object == 'string') {
        if (object.startsWith(' [') && object.endsWith(']')) {
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
    for (let i = 0; i < lines.length; i++) {
        original.set(i + 1, lines[i]);
    }
}

function variablesInsertion(variables) {
    values = variables.split(',');
}

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
    UpdateExpression: upExp,
    VariableDeclarator: variableDec,
    ArrayExpression: ArrayExpression
};

