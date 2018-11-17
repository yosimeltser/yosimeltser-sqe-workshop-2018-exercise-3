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
});