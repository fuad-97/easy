FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
COPY start.sh /app/start.sh
COPY build.sh /app/build.sh

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt && \
    chmod +x /app/start.sh /app/build.sh

COPY backend /app/backend

WORKDIR /app

EXPOSE 8000

CMD ["bash", "./start.sh"]
