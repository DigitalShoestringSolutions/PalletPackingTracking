FROM nodered/node-red:3.0.2
RUN npm install node-red-contrib-pythonshell

USER root
RUN apk add py3-pip

RUN pip install python-barcode==0.15.1 brother_ql==0.9.4 pillow==10.2.0
USER node-red