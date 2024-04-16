# Bastion instance: this instance is used for making ssh connection to Wordpress instances
# in private subnets for manual configuration, and to access RDS instances via phpMyAdmin
# in the private subnet via url: <bastion-dns/phpmyadmin>
resource "aws_instance" "bastion" {
  ami           = "ami-0df5c32c4d4710802"
  # ami-0f6b3a9de5ef4ea2e
  instance_type = "t2.micro"

  subnet_id                   = var.bastion_subnet
  associate_public_ip_address = true
  key_name                    = "bastion-key"
  security_groups             = [var.bastion_security_group]

  monitoring = true

  user_data = <<-EOF
    #!/bin/bash
    sudo yum update -y
    amazon-linux-extras install -y php7.2
    sudo yum install -y httpd php

    sudo yum install -y mariadb-server
    sudo systemctl start mariadb
    sudo systemctl enable mariadb

    systemctl start httpd
    systemctl enable httpd

    sudo usermod -a -G apache ec2-user
    sudo chown -R ec2-user:apache /var/www
    sudo chown -R ec2-user:apache /var/www/html

    #Install PhpMyAdmin
    cd /var/www/html
    sudo wget https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-english.zip
    unzip phpMyAdmin-5.2.1-english.zip 
    mv phpMyAdmin-5.2.1-english phpmyadmin
    sudo chown -R ec2-user:apache /var/www/html/phpmyadmin
    mv "/var/www/html/phpmyadmin/config.sample.inc.php" "/var/www/html/phpmyadmin/config.inc.php"
    sed -i "s/\$cfg\['Servers'\]\[\$i\]\['host'\] = 'localhost';/\$cfg\['Servers'\]\[\$i\]\['host'\] = '${aws_db_instance.wordpress_db.endpoint}';/g" "/var/www/html/phpmyadmin/config.inc.php"
  EOF

  tags = {
    Name = "Bastion Instance - ${var.id}"
  }
}
