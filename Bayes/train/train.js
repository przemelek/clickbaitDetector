var fs=require("fs");
var bayes = require("./bayes.js");

var sources = ["buzzfeed","clickhole","dose","nytimes"];

var data = [];
var testData = [];

for (var i=0; i<sources.length; i++) {
  var d = bayes.load(sources[i]);
  for (var j=0; j<d.length; j++) {
    if (j%10==0) {
      testData.push(d[j]);
    } else {
      data.push(d[j]);
    }
  }
}

var modelF = bayes.buildModel(data);
var model = modelF.model;
var myVocabList = modelF.vocabList;

// test


function calc2(title) {
  if (!title) return [0,0];
  var r = new RegExp("[\\s\.\\!\\?\\\"\\;\\:\\/\\,]");
  var elems=title.toString().toLowerCase().split(r);
  if (elems.length<3) return [0,0];
  return bayes.classify(bayes.setOfWords2Vec(myVocabList,elems),model)
}

var data = testData;

var hitBaits = 0;
var missBaits = 0;
var hitProper = 0;
var missProper = 0;

var sumBaits = 0;
var countBaits = 0;
var sumProper = 0;
var countProper = 0;
var startTest = new Date()*1.0;
for (var i=0; i<data.length; i++) {
  var prop = calc2(data[i].article_title);
  if (data[i].clickbait=="1") {
    sumBaits+=prop[0];
    countBaits++;
  } else {
    sumProper+=prop[0];
    countProper++;
  }
  // if (prop[0]-prop[1]>0) {
  if (data[i].clickbait=="1") {
    if (prop[0]>prop[1]) {
      hitBaits++;
    } else {
      missBaits++;
    }
  } else {
    if (prop[0]>prop[1]) {
      missProper++;
    } else {
      hitProper++;
    }
  }
}
var stopTest = new Date()*1.0;
console.log(hitBaits+" "+missBaits);
console.log(hitProper+" "+missProper);
console.log(hitBaits/countBaits);
console.log(hitProper/countProper);
// console.log(stopTrain-startTrain);
// console.log(stopTest-startTest);
