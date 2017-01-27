**ClickBaitDetectorLR** - Chrome extension which is a test of using machine learning (exactly Logistic Regression) to "detect" clickbait articles ;-)

**How it works**
When link title seems suspicious extension will mark it with :poop::poop: emoji at the end of title.
In most cases when you will hover over emoji you will see popup showing probability of this that given link is clickbait.

**Why it works**
Classification is made by multiplying vector representing title of link with hypothesis (in model/theta.js).
Vector is build using list of words in model/all_words.js, if our title have given word from all_words we will set 1 in vector, if it don't have given word we will put 0.

train/prepareDataForOctave.js will generate file articles2.m which may be loaded into Octave, and in Octave we are ussing Logistic Regression to create theta.
I'm using code which I created taking course https://www.coursera.org/learn/machine-learning/home/welcome (still in progress for me ;-)

All data used to learning are in train/data/*.json and are from https://github.com/peterldowns/clickbait-classifier

Extension code lives in main folder in files manifest.json (Manifest of extension ;-)). In script.js you will find code which is run by Chrome 1 second after page was loaded, this code iterate through all links on page and tries to classify them using naive Bayesian classifier, if probability of this that title of link is a clickbait is higher than for not being clickbait extension will add :poop::poop: emoji at the end of link with small popup visible when hover over emoji.
