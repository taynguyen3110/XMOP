variable "instance_count" {
  type        = number
  description = "Number of EC2 instances to launch"
}

variable "min_instance_count" {
  type        = number
  description = "Number of EC2 instances to launch"
}

variable "max_instance_count" {
  type        = number
  description = "Number of EC2 instances to launch"
}

variable "instance_type" {
  type        = string
  description = "Instance type for EC2 instances"
}

variable "ami_id" {
  type        = string
  description = "ID of the AMI to launch"
}

variable "os_option" {
  type = string
}

variable "key_name" {
  type        = string
  description = "Name of the EC2 key pair"
}

variable "vpc_id" {
  type        = string
  description = "ID of the VPC"
}

variable "bastion_security_group" {
  type        = string
  description = "ID of the security group for Bastion instances"
}

variable "rds_sg_id" {
  type        = string
  description = "ID of the security group for RDS db instances"
}

variable "security_group_id" {
  type        = string
  description = "ID of the security group for EC2 instances"
}

variable "efs_sg_id" {
  type        = string
  description = "ID of the security group for EFS"
}

variable "region" {
  type        = string
  description = "region"
}

variable "bastion_subnet" {
  type        = string
  description = "Subnet ID where Bastion instances will be launched"
}

variable "ec2_subnet_ids" {
  type        = list(string)
  description = "List of subnet IDs where EC2 instances will be launched"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of subnet IDs where RDS instances will be launched"
}

variable "lb_subnet_ids" {
  type        = list(string)
  description = "List of subnet IDs where the load balancer will be deployed"
}

variable "lb_security_group_id" {
  type        = string
  description = "ID of the security group for the load balancer"
}

variable "engine" {
  default = "mysql"
}

variable "engine_version" {
  default = "8.0.35"
}

variable "instance_class" {
  default = "db.t2.micro"
}

variable "allocated_storage" {
  default = 5
}

variable "username" {
  default = "wordpressuser"
}

variable "password" {
  default = "password"
}

variable "storage_type" {
  default = "gp2"
}

variable "multi_az" {
  type = bool
}

variable "db_name" {
  default = "wordpress"
}

variable "environment_type" {
  type = string
}

variable "id" {
  type = string
}
