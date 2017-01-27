
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

function calc(title) {
  if (!title) return [0,0];
  var r = new RegExp("[\\s\.\\!\\?\\\"\\;\\:\\/\\,]");
  var elems=title.toString().toLowerCase().split(r);
  if (elems.length<3) return [0,0];
  return classify(setOfWords2Vec(myVocabList,elems),model)
}

function markClickBaitLinks() {
  var links=document.getElementsByTagName("a");
  // console.log("will process "+links.length+" links.")
  for (var i=0; i<links.length; i++) {
    if (links[i].classified) continue;
    var title = links[i].innerText;
    var priors=calc(title);
    if (priors[0]>priors[1]) {
      links[i].innerHTML+="<span title='"+priors[0]+"/"+priors[1]+" "+priors[2]+" "+priors[3]+"'>&#x1f4a9;</span>";
    }
    links[i].classified="true";
  }
  // console.log("processed")
  setTimeout(markClickBaitLinks,1000);
}

setTimeout(markClickBaitLinks,1000);
