**ClickBaitDetector** - Chrome extension which is a test of using machine learning (exactly naive Bayesian classifier) to "detect" clickbait articles ;-)

**How it works**
When link title seems suspicious extension will mark it with :poop: emoji at the end of title.
In most cases when you will hover over emoji you will see popup showing several metrics, first is probability of this that link is clickbait, next is probability of this that it is not clickbait (both should sum up to 100 ;-)).
Next you will see number of words used to calculate this probability, and words which were used.

**Why it works**
Classification base on model, placed in model/model.js (this file contains object with our probability model, p0Vect is a vector describing "clickbaity" words, p1Vect is a vector for "proper" articles), in model/words.js you may find list of words used by classifier.
Model is build by train/train.js (this one uses NodeJS, for sure works with v7.0.0) where you will find reimplemented from Python/NumPy into JavaScript naive Bayesian classifier from ["Machine Learning in Action"](https://www.amazon.com/Machine-Learning-Action-Peter-Harrington/dp/1617290181).
train/train.js performs also some testing of classifier. It isn't perfect because it uses the same data to learn and test itself ;-)
All data used to learning are in train/data/*.json and are from https://github.com/peterldowns/clickbait-classifier

Extension code lives in main folder in files manifest.json (Manifest of extension ;-)), and script.js (most interesting is method classify which again reimplements in JavaScript code from "Machine Learning in Action"). In script.js you will find code which is run by Chrome 1 second after page was loaded, this code iterate through all links on page and tries to classify them using naive Bayesian classifier, if probability of this that title of link is a clickbait is higher than for not being clickbait extension will add :poop: emoji at the end of link with small popup visible when hover over emoji.
