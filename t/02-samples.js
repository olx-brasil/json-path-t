require("should");
const fs = require("fs");
const { exec } = require('child_process');
describe("samples", () => {
    it("comparing files", done => {
        fs.readdir("t/samples/", (err, files) => {
            if(err) {
                (err == null).should.be.true;
            }
            files.forEach(file => {
                let m = file.match(/^(\w+).tmpl.json$/);
                if(m) {
                    let sample = m[1];
                    Promise.all([
                        Promise.resolve(`t/samples/${file}`),
                        new Promise((acc, rej) => {
                            let data = `t/samples/${sample}.data.json`;
                            fs.access(data, err => {
                                if(err) rej(err);
                                else    acc(data)
                            })
                        }),
                        new Promise((acc, rej) => {
                            let answer = `t/samples/${sample}.answer.json`;
                            fs.access(answer, err => {
                                if(err) rej(err);
                                else    acc(answer)
                            })
                        })
                    ])
                        .then(([tmpl, data, answer]) => new Promise((acc, rej) => {
                            try {
                                fs.readFile(answer, (err, answer) => {
                                    if(err) rej(err);
                                    exec(`jpt ${tmpl} ${data}`, (err, stdout) => {
                                        JSON.parse(stdout).should.be.eql(JSON.parse(answer.toString()));
                                        acc();
                                    })
                                })
                            } catch(err) {rej(err)}
                        }))
                        .then(() => done())
                        .catch(done)
                    ;
                }
            })
        });
    })
});
