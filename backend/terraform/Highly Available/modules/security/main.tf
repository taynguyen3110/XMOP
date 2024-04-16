# Security Group for Bastion host
resource "aws_security_group" "bastion_sg" {
  vpc_id = var.vpc_id

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Bastion Security Group - ${var.id}"
  }
}

#EC2 security group
resource "aws_security_group" "ec2_sg" {
  vpc_id = var.vpc_id

  # HTTP from Load Balancer
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = ["${aws_security_group.lb_sg.id}"]
  }

  # HTTPS from Load Balancer
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = ["${aws_security_group.lb_sg.id}"]
  }

  # SSH from Bastion Host
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = ["${aws_security_group.bastion_sg.id}"]
  }

  # Egress rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "EC2 Security Group - ${var.id}"
  }
}

#Load Balancer security group
resource "aws_security_group" "lb_sg" {
  vpc_id = var.vpc_id

  //Ingress rules
  dynamic "ingress" {
    for_each = var.lb_ingress
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
    }
  }

  // Egress rules
  dynamic "egress" {
    for_each = var.lb_egress
    content {
      from_port   = egress.value.from_port
      to_port     = egress.value.to_port
      protocol    = egress.value.protocol
      cidr_blocks = egress.value.cidr_blocks
    }
  }

  tags = {
    Name = "LB Security Group - ${var.id}"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds_sg" {
  vpc_id = var.vpc_id

  # Aurora/MySQL/MariaDB
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = ["${aws_security_group.ec2_sg.id}", "${aws_security_group.bastion_sg.id}"]
  }

  # PostgreSQL
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = ["${aws_security_group.ec2_sg.id}", "${aws_security_group.bastion_sg.id}"]
  }

  # Egress rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "RDS Security Group - ${var.id}"
  }
}

#EFS Security Group
resource "aws_security_group" "efs_sg" {
  vpc_id = var.vpc_id

  # NFS from EC2
  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    security_groups = ["${aws_security_group.ec2_sg.id}"]
  }

  # Egress rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "EFS Security Group - ${var.id}"
  }
}
