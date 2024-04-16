# Amazon EFS File System: This is used to ensure data synchronization between multiple
# Wordpress instances, including cache, cookies, multi media files uploaded by users, etc..
resource "aws_efs_file_system" "wordpress_efs" {
  creation_token   = "wordpress-efs-${var.id}"
  performance_mode = "generalPurpose"

  tags = {
    Name = "WordPressEFS-${var.id}"
  }
}

resource "aws_efs_backup_policy" "policy" {
  file_system_id = aws_efs_file_system.wordpress_efs.id

  backup_policy {
    status = "DISABLED"
  }
}

# EFS Mount Target for Wordpress
resource "aws_efs_mount_target" "wordpress_mount_target" {
  count           = length(var.ec2_subnet_ids) # Number of mount targets to create (one per subnet)
  file_system_id  = aws_efs_file_system.wordpress_efs.id
  subnet_id       = var.ec2_subnet_ids[count.index]
  security_groups = [var.efs_sg_id] # Security group(s) associated with the mount target (ensure NFS traffic is allowed)
}

