
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

function calc(title) {
  if (!title) return [0,0];
  var r = new RegExp("[\\s\.\\!\\?\\\"\\;\\:\\/\\,]");
  var elems=title.toString().toUpperCase().split(r);
  return classify(setOfWords2Vec(all_words,elems))
}

function markClickBaitLinks() {
  var links=document.getElementsByTagName("a");
  // console.log("will process "+links.length+" links.")
  for (var i=0; i<links.length; i++) {
    if (links[i].classified2) continue;
    var title = links[i].innerText;
    var p=calc(title);
    if (p>0.5) {
      links[i].innerHTML+="<span title='"+p+"'>&#x1f4a9;&#x1f4a9;</span>";
    }
    links[i].classified2="true";
  }
  // console.log("processed")
  setTimeout(markClickBaitLinks,1000);
}

setTimeout(markClickBaitLinks,1000);
