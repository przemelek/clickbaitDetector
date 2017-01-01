var fs=require("fs");

var myVocabList = [];
var wordsMap = {};

function load(name) {
  var str = fs.readFileSync("data/"+name+".json");
  return JSON.parse(str);
}

function add(array,word) {
  if (!wordsMap[word]) wordsMap[word]=0;
  wordsMap[word]=wordsMap[word]+1;
  if (array.indexOf(word)==-1) {
    array.push(word);
  }
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

function buildModel(data) {
  var docs = [];
  var listClasses = [];

  var baits=0;
  var propers=0;

  for (var i=0; i<data.length; i++) {
    if ((data[i].clickbait==0) && (i%2!=0)) { propers++; continue; };
    //if ((data[i].clickbait==1) && (i%5!=0)) { baits++; continue; };
    var title = data[i].article_title.toLowerCase();
    var r = new RegExp("[\\s\.\\!\\?\\\"\\;\\:\\/\\,]");
    var elems = title.split(r);
    for (var j=0; j<elems.length; j++) {
      if (elems[j].length>0) {
        add(myVocabList,elems[j]);
      }
    }
    docs.push(title);
    listClasses.push(data[i].clickbait);
  }
  console.log(baits+" "+propers);


  var toKeep = [];
  var numberRegEx = new RegExp("\\d+")
  for (var i=0; i<myVocabList.length; i++) {
    var word = myVocabList[i];
    if (word*1==word) {
     continue;
    }
    if (wordsMap[word]>1) toKeep.push(word);
  }

   myVocabList=toKeep;

  console.log(myVocabList.length);
  console.log(data.length);

  var trainMatrix = [];
  for (var i=0; i<docs.length; i++) {
    trainMatrix.push(setOfWords2Vec(myVocabList,docs[i].split(" ")));
  }
  var startTrain = new Date()*1.0;
  var model=train(trainMatrix,listClasses);
  var stopTrain = new Date()*1.0;
  fs.writeFile("../model/model.js","var model="+JSON.stringify(model)+";");

  fs.writeFile("../model/words.js","var myVocabList="+JSON.stringify(myVocabList)+";");

  //fs.writeFile("../model/listClasses.js","var listClasses="+JSON.stringify(listClasses)+";");

  var content = "";
  for (var i=0; i<myVocabList.length; i++) {
    var word = myVocabList[i];
    content+=word+","+wordsMap[word]+","+model.p0Vect[i]+","+model.p1Vect[i]+"\n";
  }

  fs.writeFile("sorted.csv",content);
  return {"model":model,"vocabList":myVocabList};
}

exports.setOfWords2Vec=setOfWords2Vec;
//exports.train=train;
exports.load=load;
exports.classify=classify;
exports.buildModel=buildModel;
