#!/bin/bash
sudo yum update -y
amazon-linux-extras install -y php8.0
sudo yum install -y httpd php

systemctl start httpd
systemctl enable httpd

sudo usermod -a -G apache ec2-user
sudo chown -R ec2-user:apache /var/www/html

# Mount EFS with EFS mount helper
sudo yum install -y amazon-efs-utils
sudo mount -t efs ${efs_id}:/ /var/www/html

# Create getip.php file to test traffic through load balancer
sudo echo '<?php' > /var/www/html/getip.php
sudo echo "// Get the server's IP address" >> /var/www/html/getip.php
sudo echo '$server_ip = $_SERVER["SERVER_ADDR"];' >> /var/www/html/getip.php
sudo echo 'echo "Server IP Address: " . $server_ip;' >> /var/www/html/getip.php
sudo echo '?>' >> /var/www/html/getip.php
chmod 644 /var/www/html/getip.php
chown apache:apache /var/www/html/getip.php

# Stress test
# sudo yum install -y epel-release
# sudo amazon-linux-extras install epel
# sudo yum install -y stress
# Command for stress test for 2 cpu at 100% utilization for 300s: stress --cpu 1 --timeout 150s

#Download Wordpress
cd /var/www/html
sudo wget -c http://wordpress.org/latest.tar.gz
sudo tar -xzvf latest.tar.gz
sudo chown -R ec2-user:apache /var/www/html/
sudo rm /var/www/html/latest.tar.gz
sudo service httpd restart

#Setup WP CLI
cd /var/www/html
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
sudo chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

#Install Wordpress
sudo chown -R ec2-user:apache /var/www/html/wordpress
sudo chmod -R 777 /var/www/html/wordpress
cd /var/www/html/wordpress

wp config create --dbname=${dbname} --dbuser=${dbuser}  --dbpass=${password} --dbhost=${db_endpoint}
wp core install --url=${lb_dns}/wordpress/ --title="Wordpress Application deployed by - ${id}" --admin_user=admin --admin_password=root --admin_email=info@wp-cli.org