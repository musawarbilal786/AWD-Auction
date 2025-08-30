# Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libmariadb-dev \
    default-libmysqlclient-dev \
    pkg-config \
    python3-dev \
    build-essential \
    && apt-get clean


# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . .

# Run server (will be overridden by docker-compose command)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
