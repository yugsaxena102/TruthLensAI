FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install spaCy model
RUN python -m spacy download en_core_web_sm

# Download NLTK data
RUN python -m nltk.downloader -d /usr/local/share/nltk_data \
    stopwords \
    wordnet \
    omw-1.4 \
    averaged_perceptron_tagger \
    averaged_perceptron_tagger_eng

# Copy project
COPY . .

ENV PYTHONPATH=/app
ENV NLTK_DATA=/usr/local/share/nltk_data

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
