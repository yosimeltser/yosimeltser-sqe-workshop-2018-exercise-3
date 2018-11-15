import $ from 'jquery';
import {parseCode} from './code-analyzer';
//TABLE OF THE MODEL LAYER WILL BE TRANSFORMED INTO HTML
function initTable(){
    let table=new Array(5);
    for (let i=0;i<5;i++ ){
        table[i]=new Array();
    }
    return table;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        codeParse(parsedCode.body,initTable());
    });
});


//FUNCTION HANDLER
let func= (parsedCode,table) => {
    addRowToTable(parsedCode.id.loc.start.line,parsedCode.type,parsedCode.id.name,"","",table);
    parsedCode.params.forEach(function (parameter){
        addRowToTable(parameter.loc.start.line,"variable declaration",parameter.name,"","null (or nothing)",table);
    })
    codeParse(parsedCode.body,table);
}
//BlockStatement HANDLER
let block= (parsedCode,table) => {
    codeParse(parsedCode.body,table);
}
//var deceleration  HANDLER
let variable= (parsedCode,table) => {
    parsedCode.declarations.forEach(function (variable){
        addRowToTable(variable.id.loc.start.line,"variable declaration",variable.id.name,"","",table);
    })
}
let expr= (parsedCode,table) => {
    codeParse(parsedCode.expression,table);
    }
let assignment= (parsedCode,table) => {
    //RIGHT LEAF IS A VALUE
    if (parsedCode.right.type==="Literal"){
        addRowToTable(parsedCode.left.loc.start.line,"assignment expression",parsedCode.left.name,"",parsedCode.right.value,table);
    }
    //RIGHT LEAF IS A BINARY EXPRESSION
    else if (parsedCode.right.type==="BinaryExpression"){
        let value=binaryExpression(parsedCode.right);
        addRowToTable(parsedCode.left.loc.start.line,"assignment expression",parsedCode.left.name,"",value,table);
    }
}

let whileSt= (parsedCode,table) => {
    let line= parsedCode.test.left.loc.start.line;
    let type= parsedCode.type;
    let name="";
    let condition=binaryExpression(parsedCode.test);
    let value="";
    addRowToTable(line,type,name,condition,value,table);
    codeParse(parsedCode.body,table);
}

// MAPS = > (TYPE,FUNCTION)
const arrayOfFunctions= {
    FunctionDeclaration: func,
     BlockStatement: block,
    // Variable: variable,
    VariableDeclaration: variable,
    ExpressionStatement: expr,
    AssignmentExpression: assignment,
    WhileStatement: whileSt

}
function codeParse(parsedCode,table){
    if (Array.isArray(parsedCode)) {
        parsedCode.forEach(function (Element){
            arrayOfFunctions[Element.type](Element,table);
        })
    }
    else {
        arrayOfFunctions[parsedCode.type](parsedCode,table);
    }

}
function binaryExpression(object){
    var str;
    if (object.left.type==="Identifier" && object.right.type==="Identifier") {
        str=object.left.name + " "+ object.operator +" "+ object.right.name;
    }
    else if(object.left.type!=="Identifier" && object.right.type!=="Identifier") {
        str=object.left.value + " "+ object.operator +" "+ object.right.name;
    }
    else if(object.left.type==="Identifier" && object.right.type!=="Identifier") {
        str=object.left.name + " "+ object.operator +" "+ object.right.value;
    }
    else {
        str=object.left.value + " "+ object.operator +" "+ object.right.value;
    }
    return str;
}
function  addRowToTable(Line,Type,Name,Condition,Value,table){
    table[0].push(Line);
    table[1].push(Type);
    table[2].push(Name);
    table[3].push(Condition);
    table[4].push(Value);
    console.log(table)
}
// arrayOfFunctions.Identifier("hi");
// arrayOfFunctions.Function("hi");
// arrayOfFunctions.BlockStatement("hi");
// arrayOfFunctions.Variable("hi")