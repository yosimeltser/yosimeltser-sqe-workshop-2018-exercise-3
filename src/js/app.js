import $ from 'jquery';
import {parseCode} from './code-analyzer';
//TABLE OF THE MODEL LAYER WILL BE TRANSFORMED INTO HTML
var table=new Array(5);
for (var i=0;i<5;i++ ){
    table[i]=new Array();
}
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        codeParse(parsedCode.body);
    });
});


//FUNCTION FOR EACH TYPE
let block= (object) => {
    console.log(object);
}
let identifier= (object) => {
    console.log(object);
}
let func= (parsedCode) => {
    addRowToTable(parsedCode[0].id.loc.start.line,parsedCode[0].type,parsedCode[0].id.name,"","");
}
let variable= (object) => {
    console.log(object);
}
// MAPS = > (TYPE,FUNCTION)
const arrayOfFunctions= {
    FunctionDeclaration: func,
    // Identifier: identifier,
    // BlockStatement: block,
    // Variable: variable

}
function codeParse(parsedCode){
    parsedCode.forEach(function (Element){
        arrayOfFunctions[Element.type](parsedCode);
    })
}
function  addRowToTable(Line,Type,Name,Condition,Value){
    table[0].push(Line);
    table[1].push(Type);
    table[2].push(Name);
    table[3].push(Condition);
    table[4].push(Value);
}
// arrayOfFunctions.Identifier("hi");
// arrayOfFunctions.Function("hi");
// arrayOfFunctions.BlockStatement("hi");
// arrayOfFunctions.Variable("hi")