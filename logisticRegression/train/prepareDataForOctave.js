var fs=require("fs");

function load(name) {
  var str = fs.readFileSync("data/"+name+".json");
  return JSON.parse(str);
}

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

var sources = ["buzzfeed","clickhole","dose","nytimes"];

var data = [];

var all_words = [];
var counts = {};

var r = new RegExp("[\\s\.\\!\\?\\\"\\;\\:\\/\\,]");

for (var i=0; i<sources.length; i++) {
  var d = load(sources[i]);
  for (var j=0; j<d.length; j++) {
    d[j].article_title=d[j].article_title.toUpperCase();
    data.push(d[j]);
    var words = d[j].article_title.split(r);
    for (var k=0; k<words.length; k++) {
      if (all_words.indexOf(words[k])==-1) {
        all_words.push(words[k]);
        counts[words[k]]={count:0,bait:0,proper:0};
      }
      counts[words[k]].count++;
      if (d[j].clickbait==0) {
        counts[words[k]].proper++;
      } else {
        counts[words[k]].bait++;
      }
    }
  }
}

var toRemove = [];

for (var i=0; i<all_words.length; i++) {
  var a = counts[all_words[i]].bait+1;
  var b = counts[all_words[i]].proper+1;
  var c = counts[all_words[i]].count;
  //if (Math.min(a,b)/Math.max(a,b)>0.5) toRemove.push(all_words[i]);
  //console.log(Math.max(a/b,b/a)*counts[all_words[i]].count+","+all_words[i]);

  if (Math.max(a/b,b/a)<3) toRemove.push(all_words[i]);

  // if (c>10 && ((a/b>10) || (b/a>10))) {
  //
  // } else {
  //   toRemove.push(all_words[i]);
  // }
}

console.log(toRemove.length+" "+all_words.length);

var words = [];

for (var i=0; i<all_words.length; i++) {
  if (toRemove.indexOf(all_words[i])==-1) {
    words.push(all_words[i]);
  }
}

// all_words=words;

console.log(all_words.length);

var f=fs.openSync("articles2.m","w+");
for (var i=0; i<data.length; i++) {
  var words = data[i].article_title.split(r);
  var vect = setOfWords2Vec(all_words,words);
  var zaw="1,";
  for (var j=0; j<vect.length; j++) {
    zaw+=vect[j]+",";
  }
  zaw+=data[i].clickbait+"\n";
  fs.writeSync(f,zaw);
}

fs.closeSync(f);

fs.writeFile("all_words.json",JSON.stringify(all_words));
fs.writeFile("all_words.js","var all_words="+JSON.stringify(all_words)+";");
