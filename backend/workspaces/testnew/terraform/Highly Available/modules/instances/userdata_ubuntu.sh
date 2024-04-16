#!/bin/bash
sudo apt update -y
sudo apt upgrade -y

sudo apt install apache2 \
                 ghostscript \
                 libapache2-mod-php \
                 mysql-server \
                 php \
                 php-bcmath \
                 php-curl \
                 php-imagick \
                 php-intl \
                 php-json \
                 php-mbstring \
                 php-mysql \
                 php-xml \
                 php-zip -y

sudo systemctl start apache2
sudo systemctl enable apache2

sudo usermod -a -G www-data ubuntu
sudo chown -R ubuntu:www-data /var/www/html

# Mount EFS with EFS mount helper
sudo apt install nfs-common -y
sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport ${efs_id}.efs.${region}.amazonaws.com:/ /var/www/html

# Create getip.php file to test traffic through load balancer
sudo echo '<?php' > /var/www/html/getip.php
sudo echo "// Get the server's IP address" >> /var/www/html/getip.php
sudo echo '$server_ip = $_SERVER["SERVER_ADDR"];' >> /var/www/html/getip.php
sudo echo 'echo "Server IP Address: " . $server_ip;' >> /var/www/html/getip.php
sudo echo '?>' >> /var/www/html/getip.php
chmod 644 /var/www/html/getip.php
chown ubuntu:www-data /var/www/html/getip.php

#Stress test
# sudo apt update
# sudo apt install stress
# Command for stress test for 2 cpu at 100% utilization for 300s: stress --cpu 2 --timeout 300s

#Download Wordpress
cd /var/www/html
sudo wget -c http://wordpress.org/latest.tar.gz
sudo tar -xzvf latest.tar.gz
sudo chown -R ubuntu:www-data /var/www/html/
sudo rm /var/www/html/latest.tar.gz
sudo systemctl restart apache2

#Setup WP CLI
cd /var/www/html
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
sudo chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

#Install Wordpress
sudo chown -R ubuntu:www-data /var/www/html/wordpress
sudo chown -R www-data:www-data /var/www/html/wordpress
sudo chmod -R 777 /var/www/html/wordpress
cd /var/www/html/wordpress

wp config create --dbname=${dbname} --dbuser=${dbuser}  --dbpass=${password} --dbhost=${db_endpoint} --allow-root
wp core install --url=${lb_dns}/wordpress/ --title="Wordpress Application deployed by - ${id}" --admin_user=${id} --admin_password=root --admin_email=info@wp-cli.org --allow-root