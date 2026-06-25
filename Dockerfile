FROM nginx:1.29-alpine

RUN apk add --no-cache python3

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html projects.html /usr/share/nginx/html/
COPY styles.css project-detail.css script.js favicon.svg /usr/share/nginx/html/
COPY projects/ /usr/share/nginx/html/projects/
COPY images/ /usr/share/nginx/html/images/

COPY contact_handler.py /opt/contact/contact_handler.py
RUN mkdir -p /var/lib/contact-messages \
    && chmod 777 /var/lib/contact-messages

ENV CONTACT_MESSAGES_DIR=/var/lib/contact-messages
ENV CONTACT_HANDLER_PORT=8001

COPY docker-entrypoint.d/40-contact-handler.sh /docker-entrypoint.d/40-contact-handler.sh
RUN chmod +x /docker-entrypoint.d/40-contact-handler.sh
