FROM --platform=linux/amd64 python:3.9-slim

WORKDIR /app

COPY ./server/requirements.txt ./
COPY .env ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./server/ .

EXPOSE 5001

CMD ["flask","run", "--host", "0.0.0.0", "--port", "5001"]
