# Minimum Node.js application for intro to Docker 
tutorial: https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker


# Mimumun Requirement for Node.js Application with Nginx, Let's Encrypt, and Docker Compose
[digitalocean official tutorial](https://www.digitalocean.com/community/tutorials/how-to-secure-a-containerized-node-js-application-with-nginx-let-s-encrypt-and-docker-compose0)  
[user and firewall setting before doing this](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04)  
[alternative to the password user login - ssh keys](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-1804)  
[docker install on ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04)  
[docker-compose install](https://docs.docker.com/compose/install/)  



### Motivation
There are a lot of tutorial about how to secure dockerized nginx application with Let's Encrypt. But I failed every of them. I had not understood what I really need. So, I tried to figure out what is required for just starting up first. 


### Path to clear
1. Set Cloudflare & DigitalOcean
2. Install Dockerized Application on Ubuntu server
3. Make nextjs working on Nginx and Docker Container

### What I really did
1. Docker, Nginx, Nodejs and Let's Encrypt tutorial
2. Nextjs Starter App Setup
3. Dockerizing that app?

### Tech Stacks
- VPS: DigitalOcean
- DNS: Cloudflare
- Domain: Onamae.com
- Frontend: Nextjs(Nextjs Blog Starter)
- Web Server: Nginx

### Difference between my project and the tutorial
- My domain doesn't have www.dora-node.com, but only have dora-node.com. So, I need to remove all the www.dora-node things.

### Do not delete container...
Deleting container means delete the certificate file. There needs new certificate from let's encrypt and there is a limitation who can publish new certificate that would expire for 7 days later. 


# VPS Hosting vs Dedicated Hosting
[source](https://www.websitebuilderexpert.com/web-hosting/comparisons/vps-vs-dedicated/)

### VPS Hosting
multiple hosting websites use the same server that is VPS, so it has resource limits on things like RAM and bandwidth. Flexbile in handling surges of traffic, and not too expensive.
-> Small businesses and large personal sites

### Dedicated Hosting
Entire server. In total control from the get-go, and can choose resource limits.
-> Medium to big business sites.

### How to use this repository
##### Add sudo user not to use root
Add an user by ```adduser dora```.  
Add the user to the  sudo group by ```usermod -aG sudo dora```
##### Set up Firewall
Check if the SSH connetion is enable by ```ufw app list```.  
Allow by ```ufw allow OpenSSH```.  
Activate ufw by ```ufw status```.  
Then you can access by ```ssh dora@ip```.
##### Install Docker
##### Make project directory and clone repo.
```git clone https://github.com/ianubos/docker-nginx-ssl.git myblog```
```
pwd // My expected result -> /home/dora/dev/myblog
```
##### Get Let's Encrypt certification
Just get certification
```nano nginx-conf/nginx-cert.conf``` ```nano docker-compose-cert.yml``` Change domain name.  
Then
```
docker-compose -f docker-compose-cert.yml -d
```

##### Before Create Containers, Make dhparam key
```nano nginx-conf/nginx.conf``` Change domain name.
If there is an owner problem like this.
And then make dhparam ssl key by these lines.
```
mkdir dhparam
sudo openssl dhparam -out /home/dora/dev/myblog/dhparam/dhparam-2048.pem 2048
```

##### docker-compose
```
docker-compose up -d --build
```
If you have problem like this,
```
error checking context: 'can't stat '/home/dora/dev/myblog/certbot/certbot-etc/accounts''.
```
Run this command```sudo chmod -R 777 certbot/``` .  
-> This may cause problem... I need to search better way to handle this problem...

##### Let's Encrypt renewal setting
The certification is valid for 90 days.


##### Cheer up! Completed!

### Cloudflare (optional) --easier and faster!!--
##### 'Too many redirects' is Cloudflare problem?
Cloudflare's flexible Let's Encrypt causes this problem.   
[stackoverflow](https://stackoverflow.com/questions/41583088/http-to-https-nginx-too-many-redirects)  
[stackexchange](https://serverfault.com/questions/653976/redirect-loop-using-cloudflares-flexible-ssl/654018)  
```docker-compose -f docker-compose-cloudflare.yml up -d --build```  

# Problems...
1. Do I need to install SSL certification before all setups?
2. It is same to problem 1... nginx and nextjs container should be set restart:unless-stopped? Any other way?
3. ```sudo chmod -R 777 certbot/``` can't stat


### Cloudflare
Full and Flexible Let's Encrypt seems differen  