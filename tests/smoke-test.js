/*var SwissBill = require('../');

var bill = new SwissBill();

bill.savePDF('test.pdf');
    */

var fs = require('fs');

var SwissBill = require('../');
var bill = new SwissBill();
var doc = bill.getPDF();
doc.text('Hello');
doc.moveDown().text('I hope you are enjoying this library!');
doc.moveDown().moveDown().text('See you soon');
doc.moveDown().moveDown().text('Invoice date: ' + new Date());
doc.pipe(fs.createWriteStream('bill.pdf'));
doc.end();