swiss-bill-generator
====================

Creates PDFs for Swiss ESR Payment

Usage
-----

### Specify your options

    var opts = {
        amount: '3949.75',
        account: '01-92722-7',
        issuer: 'TestFirma GmbH\nTestweg 723\n3072 Ostermundigen',
        billTo: 'Hans Mustermann\nMusterstrasse 28\n3012 Bern'
        ref: '313947143000901'
    };

### Save to a file
    var SwissBill = require('SwissBill');
    var bill = new SwissBill(opts);
    bill.savePDF('bill.pdf');

### Add additional data
See http://pdfkit.org/ for more information.

    var fs = require('fs');
    var SwissBill = require('SwissBill');
    var bill = new SwissBill();
    var doc = bill.getPDF();
    doc.text('Hello');
    doc.moveDown().text('I hope you are enjoying this library!');
    doc.moveDown().moveDown().text('See you soon');
    doc.moveDown().moveDown().text('Invoice date: ' + Date());
    doc.pipe(fs.createWriteStream('bill.pdf'));
    doc.end();

### Send to HTTP response (browser download)
    var SwissBill = require('SwissBill');

    // Express 4.x style
    router.get('/', function(req, res) {
        var filename = 'bill.pdf';
        res.set({
            "Content-Disposition": 'attachment; filename="' + filename + '"'
        });

        var bill = new SwissBill(opts);
        bill.pipe(res);
    };

