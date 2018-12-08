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
let substitution = new Map();
let assignmentScope = new Map();
let inputVector = new Map();
let values = [];
//HANDLERS
let func = (parsedCode) => {
    parsedCode.params.forEach(function (parameter) {
        inputVector.set(parameter.name, values[0]);
        values.shift();
    });
    codeParse(parsedCode.body);
};
let block = (parsedCode) => {
    codeParse(parsedCode.body);
};

let variable = (parsedCode) => {
    codeParse(parsedCode.declarations);
};
//TODO check if variable is global- do not delete lines with declaration of global variables
let variableDec = (parsedCode) => {
    let line = parsedCode.id.loc.start.line;
    if (parsedCode.init != null) {
        changeValSab(parsedCode.id.name, binarySub(termCheck(parsedCode.init)));
    }
    else {
        substitution.set(parsedCode.id.name, '');
    }
    //if not global!!!!
    original.delete(line);
};
let expr = (parsedCode) => {
    codeParse(parsedCode.expression);
};
let assignment = (parsedCode) => {
    let value;
    if (parsedCode.right.type !== 'BinaryExpression') {
        changeValScope(termCheck(parsedCode.left), termCheck(parsedCode.right));
    }
    //RIGHT LEAF IS A BINARY EXPRESSION
    else {
        value = binarySub(binaryExpression(parsedCode.right));
        changeValScope(termCheck(parsedCode.left), value);
    }
    if (inputVector.has(termCheck(parsedCode.left))) {
        original.set(parsedCode.left.loc.start.line, termCheck(parsedCode.left) + ' = ' + binarySub(termCheck(parsedCode.right)));
        inputVector.set(termCheck(parsedCode.left), binarySub(termCheck(parsedCode.right)));
    }
    else {
        //check assignment for global variable
        original.delete(parsedCode.left.loc.start.line);
    }

};

let whileSt = (parsedCode, table) => {
    let line = parsedCode.test.left.loc.start.line;
    let condition = binarySub(binaryExpression(parsedCode.test));
    let value = 'while ( ' + condition + ') {';
    original.set(line, value);
    assignmentScope = new Map(substitution);
    codeParse(parsedCode.body, table);
};
let ret = (parsedCode) => {
    let line = parsedCode.argument.loc.start.line;
    let value = 'return ' + binarySub(termCheck(parsedCode.argument));
    let spaces = original.get(line).search(/\S/);
    original.set(line, new Array(spaces + 1).join(' ') + value + ';');
};
let ifState = (parsedCode, table) => {
    let line = parsedCode.test.left.loc.start.line;
    let value = binarySub(binaryExpression(parsedCode.test));
    if (alternate == true) {
        value = ' else if (' + value + ') {';
    }
    else {
        value = ' if (' + value + ') {';
    }
    value = checkTest(evaluation(binarySub(binaryExpression(parsedCode.test)))) + new Array(original.get(line).search(/\S/) + 1).join(' ') + value;
    original.set(line, value);
    assignmentScope = new Map(substitution);
    codeParse(parsedCode.consequent, table);
    if (parsedCode.alternate != undefined) {
        alternate = true;
        codeParse(parsedCode.alternate, table);
        alternate = false;
    }
};
let prog = (parsedCode) => {
    codeParse(parsedCode.body);
};
//TODO check if needed unary
let upExp = (parsedCode) => {
    let line = parsedCode.argument.loc.start.line;
    return line;
    // let type = parsedCode.type;
    // let name = '';
    // let condition = '';
    // let value = '';
    // if (parsedCode.prefix) {
    //     value = parsedCode.operator + parsedCode.argument.name;
    // }
    // else {
    //     value = parsedCode.argument.name + parsedCode.operator;
    // }
};


function codeParse(parsedCode) {
    if (Array.isArray(parsedCode)) {
        parsedCode.forEach(function (Element) {
            arrayOfFunctions[Element.type](Element);
        });
    }
    else {
        arrayOfFunctions[parsedCode.type](parsedCode);
    }
    return original;
}

//HELP FUNCTIONS
function binaryExpression(object) {
    if (object.left.type !== 'BinaryExpression') {
        return termCheck(object.left) + ' ' + object.operator + ' ' + termCheck(object.right);
    }
    else {
        return binaryExpression(object.left) + ' ' + object.operator + ' ' + termCheck(object.right);
    }
}

function binarySub(object) {
    if (typeof object === 'string' || object instanceof String) {
        let arr = object.split(' ');
        let str = '';
        arr.forEach(function (element) {
            let x = scopeHas(element);
            if (x != null) str = str + ' ' + x;
            else {
                x = subHas(element);
                str = str + ' ' + x;
            }
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
    else {
        return binaryExpression(object);
    }
}


function unaryExpression(object) {
    return object.operator + object.argument.value;
}

function MemberExpression(object) {
    return termCheck(object.object) + '[' + termCheck(object.property) + ']';
}

function subHas(key) {
    if (substitution.get(key) != null) {
        return substitution.get(key);
    }
    else {
        return key;
    }
}

function scopeHas(key) {
    if (assignmentScope.get(key) != null) {
        return assignmentScope.get(key);
    }
    else {
        return null;
    }
}

function changeValSab(key, newVal) {
    if (substitution.has(key)) {
        substitution.delete(key);
        substitution.set(key, newVal);
    }
    else {
        substitution.set(key, newVal);
    }
}

function changeValScope(key, newVal) {
    if (inputVector.has(key)) {
        return;
    }
    else if (assignmentScope.has(key)) {
        assignmentScope.delete(key);
        assignmentScope.set(key, newVal);
    }
    else {
        assignmentScope.set(key, newVal);
    }
}


function readCodeLineByLine(lines) {
    //global variables
    alternate = false;
    original = new Map();
    substitution = new Map();
    assignmentScope = new Map();
    inputVector = new Map();
    let values = [];
    for (let i = 0; i < lines.length; i++) {
        original.set(i + 1, lines[i]);
    }
}

function variablesInsertion(variables) {
    values = variables.split(',');

}

//TODO ===, <==
function checkTest(value) {
    let idx;
    if ((idx = value.indexOf('<=')) !== -1) {
        return eval(value.substring(0, idx)) <= eval(value.substring(idx + 2));
    }
    else if ((idx = value.indexOf('>=')) !== -1) {
        return eval(value.substring(0, idx)) >= eval(value.substring(idx + 2));
    }
    else if ((idx = value.indexOf('<')) !== -1) {
        return eval(value.substring(0, idx)) < eval(value.substring(idx + 1));
    }
    else if ((idx = value.indexOf('==')) !== -1) {
        return eval(value.substring(0, idx)) == eval(value.substring(idx + 2));
    }
    else {
        idx = value.indexOf('>');
        return eval(value.substring(0, idx)) > eval(value.substring(idx + 1));
    }
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
    VariableDeclarator: variableDec
};

