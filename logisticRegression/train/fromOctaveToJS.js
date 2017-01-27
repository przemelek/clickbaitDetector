var fs=require("fs");
var lines = fs.readFileSync("theta2").toString().split("\n");
var theta = [];
for (var i=0; i<lines.length; i++) {
  theta.push(lines[i]*1);
}
fs.writeFile("theta.js","var theta="+JSON.stringify(theta)+";");
console.log(theta.length);
// Test
function setOfWords2Vec(vocabList,inputSet) {
  var returnVec = new Array(vocabList.length);
  for (var i=0; i<vocabList.length; i++) returnVec[i]=0;
  for (var i=0; i<inputSet.length; i++) {
    var word = inputSet[i];
    if (vocabList.indexOf(word)!=-1)
      returnVec[vocabList.indexOf(word)]=1;
  }
  return returnVec;
}
var all_words=JSON.parse(fs.readFileSync("all_words.json"));

function load(name) {
  var str = fs.readFileSync("data/"+name+".json");
  return JSON.parse(str);
}
var sources = ["buzzfeed","clickhole","dose","nytimes"];

var data = [];
for (var i=0; i<sources.length; i++) {
  var d = load(sources[i]);
  for (var j=0; j<d.length; j++) {
    data.push(d[j]);
  }
}

function sigmoid(x) {
  return 1/(1+Math.exp(-x))
}

function classify(vec2Classify) {
  var sum = theta[0];
  for (var i=0; i<vec2Classify.length; i++) {
    sum+=vec2Classify[i]*theta[i+1];
  }
  return sigmoid(sum);
}

var r = new RegExp("[\\s\.\\!\\?\\\"\\;\\:\\/\\,]");

var tClickbait = 0;
var fClickbait = 0;
var tProper = 0;
var fProper = 0;
var clickbaitsCount = 0;
var properCount = 0;
for (var i=0; i<data.length; i++) {
  var title = data[i].article_title.toUpperCase();
  var clickbait = data[i].clickbait==1;
  var pClickbait = classify(setOfWords2Vec(all_words,title.split(r)));
  if (clickbait) {
    if (pClickbait>0.5) {
      tClickbait++;
    } else {
      fClickbait++;
    }
    clickbaitsCount++;
  } else {
    if (pClickbait>0.5) {
      fProper++;
    } else {
      tProper++;
    }
    properCount++;
  }
}

console.log(tClickbait*1.0/clickbaitsCount);
console.log(tProper*1.0/properCount);
