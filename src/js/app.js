import * as $ from 'jquery';
const Viz = require('viz.js');
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
        let code=codeParse(parsedCode.body.filter(dec=>dec.type==='FunctionDeclaration'),substitution);
        insertBooleanLines(code);
        $('#myTable').html(Viz('digraph {' + esTry(codeToParse) + '}'));
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});
function delTableView() {
    $('#myTable').empty();
}