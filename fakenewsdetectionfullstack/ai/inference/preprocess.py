# ============================================================
# Import Libraries
# ============================================================

import re
import nltk
import os

nltk.data.path.insert(
    0,
    os.environ.get(
        "NLTK_DATA",
        os.path.join(os.path.dirname(__file__), "../../nltk_data"),
    ),
)

from bs4 import BeautifulSoup
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag


def _ensure_nltk_resource(resource_path: str, download_name: str) -> None:
    try:
        nltk.data.find(resource_path)
    except LookupError:
        try:
            nltk.data.find(f"{resource_path}.zip")
        except LookupError as exc:
            raise RuntimeError(
                f"Required local NLTK resource is missing: {resource_path}. "
                "Download it during environment provisioning; runtime downloads are disabled."
            ) from exc


_ensure_nltk_resource("corpora/stopwords", "stopwords")
_ensure_nltk_resource("corpora/wordnet", "wordnet")
_ensure_nltk_resource("corpora/omw-1.4", "omw-1.4")
_ensure_nltk_resource("taggers/averaged_perceptron_tagger", "averaged_perceptron_tagger")
_ensure_nltk_resource("taggers/averaged_perceptron_tagger_eng", "averaged_perceptron_tagger_eng")

# Initialize objects
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()


# ============================================================
# Text Cleaning Function
# ============================================================



# Convert NLTK POS tags to WordNet POS tags

def get_wordnet_pos(tag):

    if tag.startswith("J"):
        return wordnet.ADJ

    elif tag.startswith("V"):
        return wordnet.VERB

    elif tag.startswith("N"):
        return wordnet.NOUN

    elif tag.startswith("R"):
        return wordnet.ADV

    else:
        return wordnet.NOUN





def clean_text(text):

    # Convert to lowercase
    text = text.lower()

    # Remove HTML tags
    text = BeautifulSoup(text, "html.parser").get_text()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", " ", text)

    # Remove Twitter mentions
    text = re.sub(r"@\w+", " ", text)

    # Remove hashtag symbol but keep the word
    text = re.sub(r"#", "", text)

    # Remove [VIDEO], [PHOTO], etc.
    text = re.sub(r"\[.*?\]", " ", text)

    # Remove punctuation and special characters
    text = re.sub(r"[^a-zA-Z\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    # Tokenization
    words = text.split()

    # Remove stopwords
    words = [word for word in words if word not in stop_words]

    # POS tagging
    tagged_words = pos_tag(words)

    # POS-aware Lemmatization
    words = [
        lemmatizer.lemmatize(word, get_wordnet_pos(tag))
        for word, tag in tagged_words
    ]

    return " ".join(words)
