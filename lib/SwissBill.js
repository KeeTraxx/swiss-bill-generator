var fs = require('fs');
var path = require('path');

var _ = require('underscore');
_.str = require('underscore.string');

var PDFDocument = require('pdfkit');

var ocrFont = path.join(__dirname, '..', 'res', 'fonts', 'OCRB.ttf');

var defaultOpts = {
    amount: '11113949.75',
    account: '01-92722-7',
    issuer: 'TestFirma GmbH\nTestweg 723\n3072 Ostermundigen',
    billTo: 'Hans Mustermann\nMusterstrasse 28\n3012 Bern',
    ref: '313947143000901',
    layout: {size: 'A4', margin: 0} // never change these unless you know what you are doing.
};

var SwissBill = function (opts) {
    this.opts = _.extend({}, defaultOpts, opts || {});
};

SwissBill.prototype.getPDF = function () {
    this.normalizeData();
    var doc = new PDFDocument(this.opts.layout);
    // Amount left side
    doc.font(ocrFont).fontSize(10).text(_.str.sprintf('%11s', this.opts.amountArray.join(' ')), 0, 687, {width: 163, align: 'right',characterSpacing: 7.2});

    // Recipient left side
    doc.font('Helvetica').fontSize(8).text(this.opts.issuer, 20, 580, {lineGap: 3});

    // Recipient right side
    doc.font('Helvetica').fontSize(8).text(this.opts.issuer, 195, 580, {lineGap: 3});

    // Calculate reference number
    this.opts.ref = _.str.sprintf('%015s', this.opts.ref);
    var ref = this.opts.ref + this.modulo10recursive(this.opts.ref);

    // Group reference number into groups of 5 digits (starting at the end of the string)
    var formattedRef = _.str.reverse(_.str.reverse(ref).replace(/(\d{5})/g, '$1 '));

    // Reference number left side
    doc.font(ocrFont).fontSize(10).text(_.str.sprintf('%20s', formattedRef), 10, 712,{align: 'left', width: 290});

    // Reference number right side
    doc.font(ocrFont).fontSize(10).text(_.str.sprintf('%20s', formattedRef), 0, 637,{align: 'right', width: 580});

    // Bill to left side
    doc.font(ocrFont).fontSize(10).text(this.opts.billTo, 20, 730, {lineGap: 2});

    // Bill to right side
    doc.font(ocrFont).fontSize(10).text(this.opts.billTo, 360, 687, {lineGap: 5});

    // Amount right side
    doc.font(ocrFont).fontSize(10).text(this.opts.amountArray.join(' '), 0, 687, {width: 336, align: 'right',characterSpacing: 7.2});

    // Account numbers
    doc.font('Helvetica').fontSize(10).text(this.opts.account, 90, 665);
    doc.font('Helvetica').fontSize(10).text(this.opts.account, 265, 665);

    this.opts.ref = _.str.sprintf('%015s', this.opts.ref);


    // Code line
    var codeamount = _.str.sprintf('01%010s', this.opts.amountArray.join(''));

    // pad middle
    var accountfields = this.opts.account.split('-');
    var accountCodeLine = _.str.sprintf('%s%06s%s', accountfields[0], accountfields[1], accountfields[2]);

    // codeLine
    var codeLine = _.str.sprintf('%s%s>%s+ %s>',
        codeamount,
        this.modulo10recursive(codeamount),
        ref,
        accountCodeLine
    );

    doc.font(ocrFont).fontSize(10).text(codeLine, 0, 785,{align: 'right', width: 571});

    // Reset text position
    doc.font('Helvetica').fontSize(11).text('', 100, 100);
    return doc;
};

SwissBill.prototype.savePDF = function (filename) {
    var pdf = this.getPDF();
    pdf.pipe(fs.createWriteStream(filename));
    pdf.end();
};

SwissBill.prototype.normalizeData = function () {
    // Normalize amount
    this.opts.amountArray = parseFloat(this.opts.amount).toFixed(2).split('.');
};

SwissBill.prototype.pipe = function (pipe) {
    var pdf = this.getPDF();
    pdf.pipe(pipe);
    pdf.end();
};

SwissBill.prototype.modulo10recursive = function (input) {
    var str = String(input);
    var encode = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
    var carry = 0;
    for (var i = 0; i < str.length; i++) {
        carry = (encode[(carry + parseInt(str[i]) ) % 10]) % 10;
    }

    return (10 - carry) % 10;
};

module.exports = SwissBill;