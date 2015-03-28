var fs = require('fs');
var sha256 = require('js-sha256');
var eol = "\r\n";
if(process.argv.length <= 2) console.log('Forgot to tell me which file to encrypt');
var path = process.argv[2].toString();
var ctt = fs.readFileSync(path).toString().toLowerCase();
var isCSV = ctt.indexOf(',')>-1;
var lista = [];
if(isCSV)
{
	console.log('CSV detected..');
	lista = ctt.split(',');
} else {
	console.log('Line Separated Values detected..');
	lista = ctt.split(eol);
}
console.log('hashing ' + lista.length + ' people');
for(var i=0;i<lista.length;i++)
{
	lista[i] = sha256(lista[i]).toString();
}
var ret = lista.join();
var outp = path + '.hash.csv';
fs.writeFile(outp, ret);
console.log('Output: '+outp);


// sha256('