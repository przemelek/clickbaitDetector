var baitsCount = 0;
for (var t in baits) { if (baits.hasOwnProperty(t)) baitsCount+=baits[t] };
var properCount = 0;
for (var t in proper) { if (proper.hasOwnProperty(t)) properCount+=proper[t] };

function clean(map) {
  var newMap = {};
  for (var t in map) {
    if (map.hasOwnProperty(t)) {
      if (t.length<3) continue;
      var s = "";
      for (var i=0; i<t.length; i++) {
        var c = t.charAt(i);
        if (c.toUpperCase()!=c.toLowerCase()) {
          s+=c;
        }
      }
      if (s.length>2) {
        newMap[s]=map[t];
      }
    }
  }
  return newMap;
}

baits=clean(baits);
proper=clean(proper);

function calc(title) {
  if (!title) return [0,0];
  var elems=title.toString().split(" ")
  // clickbait, not clickbait
  var priors = [0.5,0.5,0,""];
  var wordsCount = 0;
  for (var i=0; i<elems.length; i++) {
    var word = elems[i].toLowerCase();
    var b = baits[word]*1.0/baitsCount;
    var p = proper[word]*1.0/properCount;
    if (!b) b=0
    if (!p) p=0
    if (b!=0 || p!=0) {
      if (b!=0 && p!=0) {
         wordsCount++;
         priors[3]+=" "+word;
      }
      var s = b+p;
      if (s>b && s>p) {
        // b=(b*1.0/s+0.1)/2;
        // p=(p*1.0/s+0.1)/2;
        b/=s*1.0;
        p/=s*1.0;
        s = b+p;
        b/=s;
        p/=s;
        priors[0]=priors[0]*b;
        priors[1]=priors[1]*p;
        // if (wordsCount<3) {
        //    priors[0]/=3;
        // }
        s=priors[0]+priors[1];
        priors[0]/=s;
        priors[1]/=s;
        priors[0]=Math.round(priors[0]*100);
        priors[1]=Math.round(priors[1]*100);
      }
    }
  }
  if (wordsCount==0) {
     priors[0]=0;
  }
  priors[2]=wordsCount;
  return priors;
}

function markClickBaitLinks() {
  var links=document.getElementsByTagName("a");
  console.log("will process "+links.length+" links.")
  for (var i=0; i<links.length; i++) {
    var title = links[i].innerText;
    var priors=calc(title);
    if (priors[0]>priors[1]*2) {
      links[i].innerHTML+="<span title='"+priors[0]+"/"+priors[1]+" "+priors[3]+"'>&#x1f4a9;</span>";
      //t[i].innerHTML+="&#x1f4a9;";
    }
  }
  console.log("porcessed")
}

markClickBaitLinks();
