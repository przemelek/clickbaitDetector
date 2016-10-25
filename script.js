// var myVocabList = [];
// function add(array,word) {
//   if (array.indexOf(word)==-1) {
//     array.push(word);
//   }
// }
// var baitsCount = 0;
// var baitsLen = 0;
// for (var t in baits) { if (baits.hasOwnProperty(t)) { baitsCount+=baits[t]; baitsLen++; add(myVocabList, t); } };
// console.log("baits count:"+baitsCount);
// console.log(baitsLen);
// var properCount = 0;
// var properLen = 0;
// for (var t in proper) { if (proper.hasOwnProperty(t)) { properCount+=proper[t]; properLen++; add(myVocabList, t);} };
// console.log("proper count:"+properCount);
// console.log(properLen);

// var baitsCount = 0;
// for (var t in baits) { if (baits.hasOwnProperty(t)) baitsCount++; };
// var properCount = 0;
// for (var t in proper) { if (proper.hasOwnProperty(t)) properCount++; };

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

// var docs = [];
// var listClasses = [];
// for (var i=0; i<baitsTitles.length; i++) {
//   docs.push(baitsTitles[i]);
//   listClasses[docs.length-1]=1;
// }
// for (var i=0; i<properTitles.length; i++) {
//   docs.push(properTitles[i]);
//   listClasses[docs.length-1]=0;
// }
//
// var trainMatrix = [];
// for (var i=0; i<docs.length; i++) {
//   trainMatrix.push(setOfWords2Vec(myVocabList,docs[i].split(" ")));
// }

// console.log(trainMatrix);
// var model=train(trainMatrix,listClasses);
// console.log(model);

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
  priors[2] = wordsCount;
  return priors;
}

function calc2(title) {
  if (!title) return [0,0];
  var elems=title.toString().toLowerCase().split(" ");
  if (elems.length<3) return [0,0];
  return classify(setOfWords2Vec(myVocabList,elems),model)
}

// function clean(map) {
//   var newMap = {};
//   for (var t in map) {
//     if (map.hasOwnProperty(t)) {
//       if (t.length<3) continue;
//       var s = "";
//       for (var i=0; i<t.length; i++) {
//         var c = t.charAt(i);
//         if (c.toUpperCase()!=c.toLowerCase()) {
//           s+=c;
//         }
//       }
//       if (s.length>2) {
//         newMap[s]=map[t];
//       }
//     }
//   }
//   return newMap;
// }

// baits=clean(baits);
// proper=clean(proper);
//
// function calc(title) {
//   if (!title) return [0,0];
//   var elems=title.toString().split(" ")
//   // clickbait, not clickbait
//   var priors = [0.5,0.5,0,"",0];
//   var wordsCount = 0;
//   var spamProb = 0;
//   for (var i=0; i<elems.length; i++) {
//     var word = elems[i].toLowerCase();
//     var b = baits[word]*1.0/baitsCount;
//     var p = proper[word]*1.0/properCount;
//     if (!b) b=0
//     if (!p) p=0
//     b+=0.05;
//     p+=0.05;
//     spamProb+=Math.log(p/b)
//     if (b!=0 || p!=0) {
//       if (b!=0 && p!=0) {
//          wordsCount++;
//          priors[3]+=" "+word;
//       }
//       // b+=0.05;
//       // p+=0.05;
//       var s = b+p;
//       // if (s>b && s>p) {
//       if (true) {
//         // b=(b*1.0/s+0.1)/2;
//         // p=(p*1.0/s+0.1)/2;
//         b/=s*1.0;
//         p/=s*1.0;
//         s = b+p;
//         b/=s;
//         p/=s;
//         priors[0]=priors[0]*b;
//         priors[1]=priors[1]*p;
//         s=priors[0]+priors[1];
//         priors[0]/=s;
//         priors[1]/=s;
//         priors[0]=Math.round(priors[0]);
//         priors[1]=Math.round(priors[1]);
//         // console.log(priors);
//       } else {
//         // console.log(p+"+"+b+"="+s);
//       }
//     }
//   }
//   // console.log(spamProb+" "+priors[0]+"/"+priors[1]);
//   priors[4]=spamProb;
//   priors[0]=0;
//   if (priors[4]>0) priors[0]=100;
//   if (wordsCount<3) {
//      priors[0]=0;
//   }
//   priors[2]=wordsCount;
//   return priors;
// }

function markClickBaitLinks() {
  var links=document.getElementsByTagName("a");
  console.log("will process "+links.length+" links.")
  for (var i=0; i<links.length; i++) {
    var title = links[i].innerText;
    var priors=calc2(title);
    if (priors[0]>priors[1]) {
      links[i].innerHTML+="<span title='"+priors[0]+"/"+priors[1]+" "+priors[2]+" "+priors[3]+"'>&#x1f4a9;</span>";
      //t[i].innerHTML+="&#x1f4a9;";
    }
  }
  console.log("porcessed")
}

setTimeout(markClickBaitLinks,1000);
//markClickBaitLinks();
// var recognizedBaitsCount = 0;
// var unrecognizedBaitsCount = 0;
// var rb = 0;
// for (var i=0; i<baitsTitles.length; i++) {
//   var p = calc2(baitsTitles[i]);
//   if (p[0]>p[1]) {
//     recognizedBaitsCount++;
//   } else {
//     unrecognizedBaitsCount++;
//   }
// }
// var recognizedProperCount = 0;
// var unrecognizedProperCount = 0;
// var rp = 0;
// for (var i=0; i<properTitles.length; i++) {
//   var p = calc2(properTitles[i]);
//   if (p[0]<p[1]) {
//     recognizedProperCount++;
//   } else {
//     unrecognizedProperCount++;
//   }
// }
//
// console.log(recognizedBaitsCount*1.0/baitsTitles.length*100);
// console.log(recognizedProperCount*1.0/properTitles.length*100);
// console.log(unrecognizedBaitsCount*1.0/baitsTitles.length*100);
// console.log(unrecognizedProperCount*1.0/properTitles.length*100);
