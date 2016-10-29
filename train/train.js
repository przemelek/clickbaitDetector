var fs=require("fs");

var myVocabList = [];
function add(array,word) {
  if (array.indexOf(word)==-1) {
    array.push(word);
  }
}

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

var docs = [];
var listClasses = [];

for (var i=0; i<data.length; i++) {
  var title = data[i].article_title.toLowerCase();
  var r = new RegExp("[\\s\.\\!\\?]");
  var elems = title.split(r);
  for (var j=0; j<elems.length; j++) {
    if (elems[j].length>0) {
      add(myVocabList,elems[j]);
    }
  }
  docs.push(title);
  listClasses.push(data[i].clickbait);
}
console.log(myVocabList.length);
console.log(data.length);


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

function train(trainMatrix,trainCategory) {
  var numTrainDocs = trainMatrix.length;
  var numWords = trainMatrix[0].length;
  var pBait = 0;
  for (var i=0; i<trainCategory.length; i++) pBait+=trainCategory[i]*1.0/numTrainDocs;
  var p0Num = [];
  var p1Num = [];
  for (var i=0; i<numWords; i++) {
    p0Num[i]=1;
    p1Num[i]=1;
  }
  var p0Denom = 2.0;
  var p1Denom = 2.0;
  for (var i=0; i<numTrainDocs; i++) {
    if (trainCategory[i]==1) {
      var sum = 0;
      for (var j=0; j<trainMatrix[i].length; j++) {
        p1Num[j]+=trainMatrix[i][j];
        sum+=trainMatrix[i][j];
      }
      p1Denom+=sum;
    } else {
      var sum = 0;
      for (var j=0; j<trainMatrix[i].length; j++) {
        p0Num[j]+=trainMatrix[i][j];
        sum+=trainMatrix[i][j];
      }
      p0Denom+=sum;
    }
  }
  var p1Vect =[];
  var p0Vect =[];
  for (var i=0; i<trainMatrix[0].length; i++) {
    p1Vect[i]=p1Num[i]*1.0/p1Denom;
    p0Vect[i]=p0Num[i]*1.0/p0Denom;
  }
  return {p0Vect:p0Vect,p1Vect:p1Vect,pBait:pBait};
}

var trainMatrix = [];
for (var i=0; i<docs.length; i++) {
  trainMatrix.push(setOfWords2Vec(myVocabList,docs[i].split(" ")));
}

console.log(trainMatrix);
var model=train(trainMatrix,listClasses);

fs.writeFile("../model/model.js","var model="+JSON.stringify(model)+";");

fs.writeFile("../model/words.js","var myVocabList="+JSON.stringify(myVocabList)+";");

fs.writeFile("../model/listClasses.js","var listClasses="+JSON.stringify(listClasses)+";");


// test

function classify(vec2Classify, model) {
  var priors = [0,0,0,""];
  var p0Vec = model.p0Vect;
  var p1Vec = model.p1Vect;
  var pClass1 = model.pBait;
  var p1 = [];
  var p0 = [];
  var s1 = 0;
  var s0 = 0;
  var wordsCount=0;
  for (var i=0; i<p0Vec.length; i++) {
    if (vec2Classify[i]==1) {
      wordsCount++;
      priors[3]+=" "+myVocabList[i];
    }
    p0[i]=vec2Classify[i]*Math.log(p0Vec[i]);
    s0+=p0[i];
    p1[i]=vec2Classify[i]*Math.log(p1Vec[i]);
    s1+=p1[i];
  }
  s0+=Math.log(pClass1);
  s1+=Math.log(1.0-pClass1);
  var s = s1+s0;
  priors[0] = s0/s*100;
  priors[1] = s1/s*100;
  if (wordsCount<3) priors[0]=0;
  priors[2] = wordsCount;
  return priors;
}

function calc2(title) {
  if (!title) return [0,0];
  var r = new RegExp("[\\s\.\\!\\?]");
  var elems=title.toString().toLowerCase().split(r);
  if (elems.length<3) return [0,0];
  return classify(setOfWords2Vec(myVocabList,elems),model)
}

var hitBaits = 0;
var missBaits = 0;
var hitProper = 0;
var missProper = 0;

var sumBaits = 0;
var countBaits = 0;
var sumProper = 0;
var countProper = 0;

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

console.log(hitBaits+" "+missBaits);
console.log(hitProper+" "+missProper);
console.log(sumBaits/countBaits);
console.log(sumProper/countProper);
