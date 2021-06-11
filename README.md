# Deploy Containerized Node.js and Nginx Application with Cloudflare's Flexible Let's Encrypt to Ubuntu Server

## TL;DR
 In this article, we will see how to deploy Node.js application with Nginx and Cloudflare to Ubuntu server. 

## Motivation
What I had got stuck when deploying the docker containerized Node.js application was Let's Encrypt SSL certification. After struggling to deploy with Let's Encrypt Certification by hand, I found Cloudflare is really easy to make it. We will see the demonstration to deploy with minimum Node.js and Nginx setting. The code is available here.

## Steps
1. Ubuntu server and Docker preparation
2. Domain name and Cloudflare DNS server
3. Node.js application
4. Nginx configuration
5. Dockerfile and docker-compose.yml
6. Running on the server

### 1. Ubuntu server and Docker preparation
I used DigitalOcean droplet as VPS, but every other Ubuntu server is ok.
Go to DigitalOcean control panel and create your Droplet.
{image}
#### User log in setup
The minimum plan is enough. 06/11/2021
There was a promotional credit of $100 which was valid for 2 months, so we can use it free for that term. Once you create the Droplet, there is the public IP address of the Droplet. Copy it and log in to the server as the root user. If your IP address is 176.245.117.90, the login command is like this. 
```ssh root@176.245.117.90```
Logging in as the root user is not secure. So, in this article, create a new user called node. Then add this user to the sudo group.
```
$ adduser node
$ usermod -aG sudo node
```
We can set up a firewall with ufw command. These commands let you set the firewall and block connections except SSH.
```
$ ufw allow OpenSSH
$ ufw enable
```
Please check if the ufw correctly works.
```$ ufw status```
Expected result
{image}
Once this setup is finished, we can log in with the user.
```$ ssh node@176.245.117.90```

#### Docker install
We can install Docker by hand. But there is a script that automatically does the same things. 
Log in to the server and run these commands.
```
$ curl -fsSL https://get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh
```
Check if the installation does correctly work.
```
$ systemctl status docker
```
We will use not only docker but also docker-compose command. These two are separate commands, so we need to install the other.
```
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
```
Check.
```
$ docker-compose --version
```
This section is based on these articles. 
[Initial Server Setup with Ubuntu 18.04](Initial Server Setup with Ubuntu 18.04 | DigitalOcean)
[How To Install and Use Docker on Ubuntu 18.04](How To Install and Use Docker on Ubuntu 18.04 | DigitalOcean)
[Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
[Install Docker Compose](Install Docker Compose | Docker Documentation)

### 2. Domain name and Cloudflare DNS server setting
We need to get a domain name from like BlueHost or Domain.com. Once we get one, make sure to create an account on Cloudflare and add our domain. Change the nameservers on the domain provider to Cloudflare's. 
{domain.com-dns-setting}
Then, do not forget about DNS and SSL/TLS settings.
Type: A
Name: example.com -> Domain name
Content: 176.245.117.90 -> Droplet IP address
TTL: auto
Proxy status: Proxied
{let'sencrypt-flexible}
This is not end-to-end certification. ...
### 3. Node.js application containerization
We will make this application in the directory ```app/```.
```
mkdir app
cd app
```
We will see the minimum requirement for this Node.js application.  We need two npm packages, express, and cors. 
app/
```
mkdir nodejs
```
app/nodejs/index.js
```
const express = require('express')
const cors = require('cors')
const app = express()

app.enable('trust proxy')
app.use(cors({}))
app.use(express.json())

app.get('/api', (req, res) => {
    res.send('<h1>hi there!!!!</h1>')
    console.log('/ root is active.')
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`listening on port ${port}`))
```
app/nodejs/package.json
```
{
  "name": "Simple Node.js App",
  "version": "1.0.0",
  "description": "Simple Nodejs Application",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon -L index.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.7"
  }
}
```
That's all for the application.

### 4. Nginx setting and containerization
We are using Cloudflare's Flexible SSL certificate for HTTPS, so Nginx to Cloudflare connection is over HTTP. 
{cloudflare-ssl-explained}
```The Flexible SSL option allows a secure HTTPS connection between your visitor and Cloudflare, but forces Cloudflare to connect to your origin web server over unencrypted HTTP. An SSL certificate is not required on your origin web server and your visitors will still see the site as being HTTPS enabled.```
app/
```
mkdir nginx-conf
```
app/nginx-conf/nginx.conf
```
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name example.com www.example.com;

    if ($http_x_forwarded_proto = "http") {
        return 301 https://$server_name$request_uri;
    }

    root /var/www/html;

    index index.php index.html index.htm index.nginx-debian.html;

    location / {
            try_files $uri @nodejs;
    }

    location @nodejs {
        proxy_pass http://nodejs-app:4000;    
    }

}
```
example.com and www.example.com are your domain name. If you don't have www.example.com, it should be removed from the file. ```server_name: example.com```

Make sure, there is an index.html file in the root directory.
app/index.html
```
<h1>hi there!</h1>
```
This is the minimum setting for Nginx to use Cloudflare's Flexible SSL certificate. It is a simple but good start point to use Nginx.

This section is based on these articles.
[End-to-end HTTPS with Cloudflare - Part 3: SSL options](End-to-end HTTPS with Cloudflare - Part 3: SSL options – Cloudflare Help Center)
[HTTP to HTTPS Nginx too many redirects](ssl - HTTP to HTTPS Nginx too many redirects - Stack Overflow)

### 5. Dockerfile and docker-compose.yml
Dockerfile for the Node.js application
docker-compose.yml file for the app and server
app/Dockerfile
```
FROM node:15

WORKDIR /home/node/nodejs

USER root

RUN mkdir -p ./node_modules && chown -R node:node ./

COPY ./nodejs/package*.json ./

RUN npm install

USER node

COPY --chown=node:node ./nodejs .

EXPOSE 4000

CMD ["node", "index.js"]
```
Dockerfile is conventionally divided into two actions. First, copy package.json only and install npm packages. Second, copy all the other files and run the application. This is because Dockerfile commands are cached line by line. ```npm install``` is a heavy part, so it is good if this part is cached when other files like index.js are changed.

app/docker-compose.yml
```
version: '3'

services:  
  nodejs-app:
    image: node:15
    build:
        context: ./
        dockerfile: Dockerfile
    container_name: nodejs-app
    volumes:
      - ./nodejs:/home/node/nodejs
      - /home/node/nodejs/node_modules
    environment:
        - PORT=4000
    command: node index.js
    networks:
      - app-network

  webserver:
    image: nginx:mainline-alpine
    container_name: nginx-blog
    ports:
      - "80:80"
    volumes:
      - ./nginx-conf/nginx.conf:/etc/nginx/conf.d/nginx.conf
      - ./index.html:/var/www/html/index.html
    depends_on:
      - nodejs-app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```
.dockerignore
```
docker-compose*.yml
Dockerfile*
```

### 6. Running on the server
Copy the application directory to the server by ```scp```.
/
```
scp -r app node@176.245.117.90:/home/node
```
Then, log in to the sever ```ssh node@176.245.117.90``` and go to the copied directory ```cd app```.
Finally, we run docker and the app start running!
```docker-compose up -d```
If you change something, re-run the docker-compose with --build flag  ```docker-compose up -d --build```.
example.com is now https://example.com and our application is running on the server!
That's all! Thank you for reading!
