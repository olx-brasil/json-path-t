#!/usr/bin/env node

const jpt   = require('json-path-t');
const fs    = require('fs');
if(process.argv.length != 4)
    throw "You should pass 2 arguments: the template file and the data file."

const [tmpl_file, data_file] = process.argv.slice(2);

Promise.all([
    new Promise((acc, rej) => {
        fs.readFile(tmpl_file, (err, data) => {
            if(err != null) rej(err);
            else            acc(data);
        })
    }),
    new Promise((acc, rej) => {
        fs.readFile(data_file, (err, data) => {
            if(err != null) rej(err);
            else            acc(data);
        })
    })
])
    .then(strs => {
        const [tmpl_str, data_str] = strs;
        const tmpl = JSON.parse(tmpl_str);
        const data = JSON.parse(data_str);

        console.log(JSON.stringify(jpt(tmpl, data), null, "    "));
    })
    .catch(console.error)
;
