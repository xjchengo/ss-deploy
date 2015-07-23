FROM tutum/apache-php
MAINTAINER Xujian Chen <xjchen@echo58.com>

RUN rm -fr /app
ADD . /app
RUN composer install -vvv
