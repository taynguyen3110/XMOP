# RDS template for Production
resource "aws_db_instance" "wordpress_db" {
  engine               = var.engine                         
  engine_version       = var.engine_version                 
  instance_class       = var.instance_class                 
  allocated_storage    = var.allocated_storage              
  identifier           = "wordpress-${var.id}"                        
  username             = var.username                       # Username for database access
  password             = var.password                       # Password for database access
  publicly_accessible  = false                              
  storage_type         = var.storage_type                   
  multi_az             = var.multi_az                       # Specifies if the RDS instance is multi-AZ enabled
  db_subnet_group_name = aws_db_subnet_group.db-subnet.name # Name of the DB subnet group

  db_name                = var.db_name     # Name of the first created database when RDS is first created
  skip_final_snapshot    = true            
  vpc_security_group_ids = [var.rds_sg_id]

  tags = {
    Name = "WordPress DB - ${var.id}"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "db-subnet" {
  name       = "db subnet group - ${var.id}"      
  subnet_ids = var.private_subnet_ids # List of private subnet IDs, there are 3 private subnets in case user want to create Multi-AZ Cluster
}
