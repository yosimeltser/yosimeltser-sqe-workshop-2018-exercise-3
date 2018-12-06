import * as esprima from 'esprima';
import * as $ from 'jquery';
export {codeParse};
export {parseCode};
export {readCodeLineByLine};
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};
let original= new Map();
let substitution = new Map();
let assignmentScope= new Map();
let rows= [];
//HANDLERS
let func = (parsedCode) => {
    //addRowToTable(parsedCode.id.loc.start.line, parsedCode.type, parsedCode.id.name, '', '', table);
    parsedCode.params.forEach(function (parameter) {
    //addRowToTable(parameter.loc.start.line, 'variable declaration', parameter.name, '', '', table);
    });
    codeParse(parsedCode.body);
};
let block = (parsedCode) => {
    codeParse(parsedCode.body);
};

let variable = (parsedCode) => {
    codeParse(parsedCode.declarations);
};
let variableDec = (parsedCode) => {
    let line=parsedCode.id.loc.start.line;
    var spaces=original.get(line).search(/\S/);
    let value= 'let ';
    if (parsedCode.init != null) {
        changeValSab(parsedCode.id.name, termCheck(parsedCode.init));
        //line=(new Array(spaces + 1).join(' ')+value+parsedCode.id.name+termCheck(parsedCode.init));
    }
    else {
        //line=(new Array(spaces + 1).join(' ')+value+parsedCode.id.name+termCheck(parsedCode.init));
        substitution.set(parsedCode.id.name, '');
    }
    //rows.push(line);
};
let expr = (parsedCode) => {
    codeParse(parsedCode.expression);
};
let assignment = (parsedCode) => {
    // let spaces=original.get(parsedCode.left.loc.start.line).search(/\S/);
    if (parsedCode.right.type !== 'BinaryExpression') {
        changeValScope(termCheck(parsedCode.left), termCheck(parsedCode.right));
        // let value = termCheck(parsedCode.left)+ '='  + termCheck(parsedCode.right);
        // new Array(spaces + 1).join(' ')+value;
        // let value=substitution.get(termCheck(parsedCode.left));
        // let line= termCheck(parsedCode.left)+' = '+value;
        // original.set(parsedCode.left.loc.start.line,line);
    }
    //RIGHT LEAF IS A BINARY EXPRESSION
    else {
        let value = binaryExpression(parsedCode.right);
        changeValScope(termCheck(parsedCode.left), value);
    }
};

// let complexAssignment = (parsedCode) => {
//     let complex = '';
//     if (parsedCode.operator == '+=') {
//         complex += termCheck(parsedCode.left) + '+';
//     }
//     else if (parsedCode.operator == '-=') {
//         complex += termCheck(parsedCode.left) + '-';
//     }
//     else {
//         complex = '';
//     }
//     return complex;
// };

let whileSt = (parsedCode, table) => {
    // let line = parsedCode.test.left.loc.start.line;
    // let type = parsedCode.type;
    // let name = '';
    // let condition = binaryExpression(parsedCode.test);
    // let value = '';
    // addRowToTable(line, type, name, condition, value, table);
    assignmentScope=new Map(substitution);
    codeParse(parsedCode.body, table);
};
let ret = (parsedCode) => {
    let line = parsedCode.argument.loc.start.line;
    let value = termCheck(parsedCode.argument);
    var spaces=original.get(line).search(/\S/);
    value='return ' + value;
    console.log(new Array(spaces + 1).join(' ')+value);
    original.set(line,'return ' + value);
};
let ifState = (parsedCode, table) => {
    // let line = parsedCode.test.left.loc.start.line;
    // let type = parsedCode.type;
    // let name = '';
    console.log(binaryExpression(parsedCode.test));
    // let value = '';
    // addRowToTable(line, type, name, condition, value, table);
    assignmentScope=new Map(substitution);
    codeParse(parsedCode.consequent, table);
    if (parsedCode.alternate != undefined)
        codeParse(parsedCode.alternate, table);
};
let prog = (parsedCode) => {
    codeParse(parsedCode.body);
};
let upExp = (parsedCode) => {
    // let line = parsedCode.argument.loc.start.line;
    // let type = parsedCode.type;
    // let name = '';
    // let condition = '';
    let value = '';
    if (parsedCode.prefix) {
        value = parsedCode.operator + parsedCode.argument.name;
    }
    else {
        value = parsedCode.argument.name + parsedCode.operator;
    }
};

// let doWhile = (parsedCode) => {
//     let line = parsedCode.test.left.loc.start.line;
//     let type = parsedCode.type;
//     let name = '';
//     let condition = binaryExpression(parsedCode.test);
//     let value = '';
//
//     codeParse(parsedCode.body);
// };

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
        if (assignmentScope.get(termCheck(object.right))==null){
            return subHas(termCheck(object.left))+ object.operator + subHas(termCheck(object.right));
        }
        else {
            return scopeHas(termCheck(object.left))+ object.operator + scopeHas(termCheck(object.right));
        }
    }
    else {
        if (assignmentScope.get(termCheck(object.right))==null){
            return binaryExpression(object.left) + object.operator + subHas(termCheck(object.right));
        }
        else {
            return binaryExpression(object.left) + object.operator + scopeHas(termCheck(object.right));
        }
    }
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

// function identifierHandler(key) {
//     if (substitution.has(key)) {
//         return substitution.get(key);
//     }
//     else {
//         return key;
//     }
// }

function unaryExpression(object) {
    return object.operator + object.argument.value;
}

function MemberExpression(object) {
    return termCheck(object.object) + '[' + termCheck(object.property) + ']';
}

function subHas(key){
    if (substitution.get(key)!=null) {
        return substitution.get(key);
    }
    else {
        return key;
    }
}
function scopeHas(key){
    if (assignmentScope.get(key)!=null) {
        return assignmentScope.get(key);
    }
    else {
        return key;
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
    if (assignmentScope.has(key)) {
        assignmentScope.delete(key);
        assignmentScope.set(key, newVal);
    }
    else {
        assignmentScope.set(key, newVal);
    }
}
function readCodeLineByLine(lines){
    for(let i = 0;i < lines.length;i++){
        original.set(i+1,lines[i]);
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

