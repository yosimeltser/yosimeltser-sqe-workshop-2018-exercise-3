import $ from 'jquery';
import {parseCode} from './code-analyzer';

//TABLE OF THE MODEL LAYER WILL BE TRANSFORMED INTO HTML
function initTable() {
    let table = new Array(5);
    for (let i = 0; i < 5; i++) {
        table[i] = new Array();
    }
    return table;
}
function delTableView(){
    var view = document.getElementById('myTable');
    for(var i = view.rows.length - 1; i > 0; i--)
    {
        view.deleteRow(i);
    }
}
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        delTableView();
        codeParse(parsedCode, initTable());
    });
});

//HANDLERS
let func = (parsedCode, table) => {
    addRowToTable(parsedCode.id.loc.start.line, parsedCode.type, parsedCode.id.name, '', '', table);
    parsedCode.params.forEach(function (parameter) {
        addRowToTable(parameter.loc.start.line, 'variable declaration', parameter.name, '', '', table);
    });
    codeParse(parsedCode.body, table);
};
let block = (parsedCode, table) => {
    codeParse(parsedCode.body, table);
};
let variable = (parsedCode, table) => {
    parsedCode.declarations.forEach(function (variable) {
        addRowToTable(variable.id.loc.start.line, 'variable declaration', variable.id.name, '', 'null (or nothing)', table);
    });
};
let expr = (parsedCode, table) => {
    codeParse(parsedCode.expression, table);
};
let assignment = (parsedCode, table) => {
    //RIGHT LEAF IS A VALUE
    if (parsedCode.right.type === 'Literal') {
        addRowToTable(parsedCode.left.loc.start.line, 'assignment expression', parsedCode.left.name, '', parsedCode.right.value, table);
    }
    //RIGHT LEAF IS A BINARY EXPRESSION
    else if (parsedCode.right.type === 'BinaryExpression') {
        let value = binaryExpression(parsedCode.right);
        addRowToTable(parsedCode.left.loc.start.line, 'assignment expression', parsedCode.left.name, '', value, table);
    }
};
let whileSt = (parsedCode, table) => {
    let line = parsedCode.test.left.loc.start.line;
    let type = parsedCode.type;
    let name = '';
    let condition = binaryExpression(parsedCode.test);
    let value = '';
    addRowToTable(line, type, name, condition, value, table);
    codeParse(parsedCode.body, table);
};
let ret = (parsedCode, table) => {
    let line = parsedCode.argument.loc.start.line;
    let type = parsedCode.type;
    let name = '';
    let condition = '';
    let value = termCheck(parsedCode.argument);
    addRowToTable(line, type, name, condition, value, table);
};
let ifState = (parsedCode, table) => {
    let line = parsedCode.test.left.loc.start.line;
    let type = parsedCode.type;
    let name = '';
    let condition = binaryExpression(parsedCode.test);
    let value = '';
    addRowToTable(line, type, name, condition, value, table);
    codeParse(parsedCode.consequent, table);
    if (parsedCode.alternate != undefined)
        codeParse(parsedCode.alternate, table);
};
let forSt = (parsedCode, table) => {
    let line = parsedCode.init.left.loc.start.line;
    let type = parsedCode.type;
    let name = '';
    let condition = '';
    let value = '';
    addRowToTable(line, type, name, condition, value, table);
    codeParse(parsedCode.init, table);
    addRowToTable(line, 'test', '', binaryExpression(parsedCode.test), '', table);
    codeParse(parsedCode.update, table);
    codeParse(parsedCode.body,table);
};
let prog = (parsedCode, table) => {
    codeParse(parsedCode.body, table);
};
let upExp = (parsedCode, table) => {
    let line = parsedCode.argument.loc.start.line;
    let type = parsedCode.type;
    let name = '';
    let condition = '';
    let value = '';
    if (parsedCode.prefix) {
        value = parsedCode.operator + parsedCode.argument.name;
    }
    else {
        value = parsedCode.argument.name+parsedCode.operator;
    }
    addRowToTable(line, type, name, condition, value, table);
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
    ForStatement: forSt,
    Program: prog,
    UpdateExpression: upExp

};

function codeParse(parsedCode, table) {
    if (Array.isArray(parsedCode)) {
        parsedCode.forEach(function (Element) {
            arrayOfFunctions[Element.type](Element, table);
        });
    }
    else {
        arrayOfFunctions[parsedCode.type](parsedCode, table);
    }
}

//HELP FUNCTIONS
function binaryExpression(object) {
    if (object.left.type !== 'BinaryExpression') {
        return termCheck(object.left) + object.operator + termCheck(object.right);
    }
    else {
        return binaryExpression(object.left) + object.operator + termCheck(object.right);
    }
}

//RETURNS A TERM -> NUMBER OR VAR ,ACCORDING TO IDENTIFIER OR LATERAL
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
    else if (checkIfMemberExpression(object)) {
        return MemberExpression(object);
    }
}

function unaryExpression(object) {
    return object.operator + object.argument.value;
}

function MemberExpression(object) {
    return object.object.name + '[' + object.property.name + ']';
}

function checkIfMemberExpression(object) {
    if (object.type === 'MemberExpression')
        return true;
    else
        return false;
}

function addRowToTable(Line, Type, Name, Condition, Value, table) {
    table[0].push(Line);
    table[1].push(Type);
    table[2].push(Name);
    table[3].push(Condition);
    table[4].push(Value);
    addRowToView(Line, Type, Name, Condition, Value, table);
}

function addRowToView(Line, Type, Name, Condition, Value) {
    var tableRef = document.getElementById('myTable').getElementsByTagName('tbody')[0];
    var newRow = tableRef.insertRow(tableRef.rows.length);
    newRow.insertCell(0).appendChild(document.createTextNode(Line));
    newRow.insertCell(1).appendChild(document.createTextNode(Type));
    newRow.insertCell(2).appendChild(document.createTextNode(Name));
    newRow.insertCell(3).appendChild(document.createTextNode(Condition));
    newRow.insertCell(4).appendChild(document.createTextNode(Value));
}