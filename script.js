var t=document.getElementsByTagName("a");

function calc(title) {
  var elems=title.split(" ")
  // clickbait, not clickbait
  var priors = [0.5,0.5];
  for (var i=0; i<elems.length; i++) {
    var word = elems[i].toLowerCase();
    var b = baits[word];
    var p = proper[word];
    if (!b) b=0
    if (!p) p=0
    if (b!=0 || p!=0) {
      var s = b+p;
      b=(b*1.0/s+0.1)/2;
      p=(p*1.0/s+0.1)/2;
      var s = b+p;
      b=b/s;
      p=p/s;
      priors[0]=priors[0]*b;
      priors[1]=priors[1]*p;
    }
  }
  return priors;
}

for (var i=0; i<t.length; i++) {
  var title = t[i].innerText;
  var priors=calc(title);
  if (priors[0]>priors[1]*2) {
    // t[i].innerHTML+="&#x1f4a9;(clickbait:"+priors[0]+"/"+priors[1]+")";
    t[i].innerHTML+="&#x1f4a9;";
  }
}
