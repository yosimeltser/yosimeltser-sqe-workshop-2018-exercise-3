import $ from 'jquery';
import {parseCode, codeParse, initTable} from './code-analyzer';
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        delTableView();
        makeTableView(codeParse(parsedCode, initTable()));
    });
});

function makeTableView(table) {
    let tableRef = document.getElementById('myTable').getElementsByTagName('tbody')[0];
    for (let x=0;x<table[0].length;x++){
        let newRow = tableRef.insertRow(tableRef.rows.length);
        newRow.insertCell(0).appendChild(document.createTextNode(table[0][x]));
        newRow.insertCell(1).appendChild(document.createTextNode(table[1][x]));
        newRow.insertCell(2).appendChild(document.createTextNode(table[2][x]));
        newRow.insertCell(3).appendChild(document.createTextNode(table[3][x]));
        newRow.insertCell(4).appendChild(document.createTextNode(table[4][x]));
    }
}


function delTableView() {
    var view = document.getElementById('myTable');
    for (var i = view.rows.length - 1; i > 0; i--) {
        view.deleteRow(i);
    }
}