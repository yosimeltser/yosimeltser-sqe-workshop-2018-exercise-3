import * as $ from 'jquery';
import {parseCode, codeParse,readCodeLineByLine,variablesInsertion,esTry,insertBooleanLines} from './code-analyzer';
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        delTableView();
        let codeToParse = $('#codePlaceholder').val();
        let variables=$('#vars').val();
        readCodeLineByLine(codeToParse.split('\n'));
        variablesInsertion(variables);
        let parsedCode = parseCode(codeToParse);
        let substitution = new Map();
        //globalInsertion(parsedCode.body.filter(dec=>dec.type!=='FunctionDeclaration'));
        let code=codeParse(parsedCode.body.filter(dec=>dec.type==='FunctionDeclaration'),substitution);
        insertBooleanLines(code);
        $('#myTable').html(esTry(codeToParse));
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        // code.forEach(logMapElements);
    });
});
// function logMapElements(value){
//     if (value.startsWith('false')){
//         $('#myTable').append('<tr><td bgcolor="#8b0000">'+value.substring(6)+'</td></tr>');
//     }
//     else if (value.startsWith('true')){
//         $('#myTable').append('<tr><td bgcolor="#006400">'+value.substring(5)+'</td></tr>');
//     }
//     else {
//         $('#myTable').append('<tr><td>'+value+'</td></tr>');
//     }
// }
function delTableView() {
    $('#myTable').empty();
}