import assert from 'assert';
import {codeParse, initTable, parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('Check If Assignment is working', () => {
        let table1=codeParse(parseCode('x=4;'), initTable());
        let table2= initTable();
        table2[0].push(1);
        table2[1].push('assignment expression');
        table2[2].push('x');
        table2[3].push('');
        table2[4].push(4);
        assert.equal(
            JSON.stringify(table1),
            JSON.stringify(table2)
        );
    });
    it('Check If for statement is working', () => {
        let table1=codeParse(parseCode('for (x=0;x<10;x++){}'), initTable());
        let table2= initTable();
        table2=AddRow(table2,1,'ForStatement','','','');
        table2=AddRow(table2,1,'assignment expression','x','',0);
        table2=AddRow(table2,1,'test','','x<10','');
        table2=AddRow(table2,1,'UpdateExpression','','','x++');
        assert.equal(
            JSON.stringify(table1),
            JSON.stringify(table2)
        );
    });
    it('Check MemberExpression, if statement', () => {
        let table1=codeParse(parseCode('if (X < V[mid]) high = mid - 1;'), initTable());
        let table2= initTable();
        table2=AddRow(table2,1,'IfStatement','','X<V[mid]','');
        table2=AddRow(table2,1,'assignment expression','high','','mid-1');
        assert.equal(
            JSON.stringify(table1),
            JSON.stringify(table2)
        );
    });
    it('Check whileExpression', () => {
        let table1=codeParse(parseCode('while (low <= high) { }'), initTable());
        let table2= initTable();
        table2=AddRow(table2,1,'WhileStatement','','low<=high','');
        assert.equal(
            JSON.stringify(table1),
            JSON.stringify(table2)
        );
    });
    it('return statement & function & unaryStatement', () => {
        let table1=codeParse(parseCode('function binarySearch(){return -1;}'), initTable());
        let table2= initTable();
        table2=AddRow(table2,1,'FunctionDeclaration','binarySearch','','');
        table2=AddRow(table2,1,'ReturnStatement','','','-1');
        assert.equal(
            JSON.stringify(table1),
            JSON.stringify(table2)
        );
    });
    it('function with variables', () => {
        let table1=codeParse(parseCode('function binarySearch(x){let low;}'), initTable());
        let table2= initTable();
        table2=AddRow(table2,1,'FunctionDeclaration','binarySearch','','');
        table2=AddRow(table2,1,'variable declaration','x','','');
        table2=AddRow(table2,1,'variable declaration','low','','null (or nothing)');
        assert.equal(
            JSON.stringify(table1),
            JSON.stringify(table2)
        );
    });
    it('complex binary Expression', () => {
        let table1=codeParse(parseCode('x=1+1+1+a'), initTable());
        let table2= initTable();
        table2=AddRow(table2,1,'assignment expression','x','','1+1+1+a');
        assert.equal(
            JSON.stringify(table1),
            JSON.stringify(table2)
        );
    });
});
function AddRow(table,line,type,name,condition,value){
    table[0].push(line);
    table[1].push(type);
    table[2].push(name);
    table[3].push(condition);
    table[4].push(value);
    return table;
}