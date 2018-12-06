import * as $ from 'jquery';
import {parseCode, codeParse,readCodeLineByLine} from './code-analyzer';
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        readCodeLineByLine(codeToParse.split('\n'));
        let parsedCode = parseCode(codeToParse);
        let code=codeParse(parsedCode);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

    });
});