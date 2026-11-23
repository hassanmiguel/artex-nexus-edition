# NEXUS AI gateway for the ARTEX Docker Compose stack.
# It binds 0.0.0.0 inside the container but is NOT published to the host:
# ARTEX reaches it over the compose network and proxies /api/nexus/* to it.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY frontend ./frontend
COPY run_nexus.py ./

RUN mkdir -p /app/data

EXPOSE 8000

CMD ["python", "run_nexus.py", "--host", "0.0.0.0", "--port", "8000"]
