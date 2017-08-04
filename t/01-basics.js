const jpt = require("..");
require("should");

describe("basics", () => {
    it("scalar", () => {
        (jpt(null,      {}) === null).should.be.true;
        (jpt(undefined, {}) === undefined).should.be.true;

        jpt(42,           {}).should.be.eql(42);
        jpt(-13,          {}).should.be.eql(-13);
        jpt(3.14,         {}).should.be.eql(3.14);
        jpt("the answer", {}).should.be.eql("the answer");
        jpt(NaN,          {}).should.be.NaN;
    });

    it("structures", () => {
        jpt([],                 {}).should.be.eql([]);
        jpt({},                 {}).should.be.eql({});
        jpt(new Set(),          {}).should.be.eql(new Set());
        jpt(new Map(),          {}).should.be.eql(new Map());

        jpt([1, 2, 3],          {}).should.be.eql([1, 2, 3]);
        jpt({a:1, b:2, c:3},    {}).should.be.eql({a:1, b:2, c:3});
    });

    it("render", () => {
        (jpt("$", null) === null).should.be.true;

        jpt("$",    {}      ).should.be.eql({});
        jpt("$.x",  {x: 42} ).should.be.eql(42);
        jpt("$.x",  {x: []} ).should.be.eql([]);
        jpt("$.x",  {x: {}} ).should.be.eql({});

        (jpt("$.x", {}) === undefined).should.be.true;
    });

    it("render string", () => {
        jpt("The {{ $.letter }} is the letter",  {letter: "x"}).should.be.eql("The x is the letter");
        jpt("->{{$.*}}-{{$.*}}<-",  {a:1, b:2, c:3}).should.be.eql("->1-1<-");
        jpt("->{{$.*}}-{{$.*}}<-",  {a:1, b:2, c:3}, true).sort.should.be.eql([
            "->1-1<-",
            "->2-1<-",
            "->3-1<-",
            "->1-2<-",
            "->2-2<-",
            "->3-2<-",
            "->1-3<-",
            "->2-3<-",
            "->3-3<-",
        ].sort);
    });

    it("array loop", () => {
        jpt(["$..x"],       [{x: 1}, {x: 2}, {x: 3}]).should.be.eql([1, 2, 3]);
        jpt(["$..x", "$"],  [{x: 1}, {x: 2}, {x: 3}]).should.be.eql([1, 2, 3]);
        jpt(["$.*", "$.x"], [{x: 1}, {x: 2}, {x: 3}]).should.be.eql([1, 2, 3]);

        jpt(["$.*", ["$.x"]], [{x: 1}, {x: 2}, {x: 3}]).should.be.eql([[1], [2], [3]]);
        jpt(["$.*", {value: "$.x"}], [{x: 1}, {x: 2}, {x: 3}]).should.be.eql([{value: 1}, {value: 2}, {value: 3}]);
        jpt(["$.*", {"$.x": 42}], [{x: 1}, {x: 2}, {x: 3}]).should.be.eql([{1: 42}, {2: 42}, {3: 42}]);
        jpt(["$.*", {"$.y": "$.x"}], [{x: 1, y: "a"}, {x: 2, y: "b"}, {x: 3, y: "c"}]).should.be.eql([{a: 1}, {b: 2}, {c: 3}]);
    });

    it("hash loop", () => {
        jpt({"@": "$.*", "$.y": "$.x"}, [{x: 1, y: "a"}, {x: 2, y: "b"}, {x: 3, y: "c"}]).should.be.eql({a: 1, b: 2, c: 3});
        jpt({"@": "$.*", "$.y": ["$.x"]}, [{x: 1, y: "a"}, {x: 2, y: "b"}, {x: 3, y: "c"}]).should.be.eql({a: [1], b: [2], c: [3]});
        jpt({"@": "$.*", "$.y": {bla: "$.x"}}, [{x: 1, y: "a"}, {x: 2, y: "b"}, {x: 3, y: "c"}]).should.be.eql({a: {bla: 1}, b: {bla: 2}, c: {bla: 3}});
    });

    it("modify response", () => {
        jpt("$.answer :: $ - 29", {answer: 42}).should.be.eql(13);
        jpt("$ :: Object.keys($)", {bla: 1, ble: 2}).should.be.eql(["bla", "ble"]);
        jpt("$::$.length", [1, 2, 3, 4]).should.be.eql(4);
        jpt("---{{ $.str :: $.toUpperCase() }}---", {str: "end"}).should.be.eql("---END---");
    });
});
